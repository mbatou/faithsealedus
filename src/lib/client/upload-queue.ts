'use client';

// Resumable upload queue for guest photos.
//
//  - Prepared photos (compressed full + thumb) are stored in IndexedDB, so a
//    dropped connection, a locked phone or a reload never loses them.
//  - Each photo: reserve a slot (/api/upload/request) → upload thumb + full
//    straight to Vercel Blob with the slot's short-lived tokens →
//    /api/upload/complete.
//  - Failures retry with exponential backoff (5 tries), then wait for a tap.
//    While the phone is offline, waiting doesn't burn tries.

import { put } from '@vercel/blob/client';
import { preparePhoto } from './image';

export type ItemStatus =
  | 'preparing'
  | 'queued'
  | 'uploading'
  | 'retrying'
  | 'failed'
  | 'done'
  | 'refused'
  | 'unreadable';

interface Slot {
  photoId: string;
  pathname: string;
  thumbPathname: string;
  token: string;
  thumbToken: string;
  validUntil: number;
}

export interface QueueItem {
  localId: string;
  createdAt: number;
  status: ItemStatus;
  progress: number; // 0..1
  attempts: number;
  nextAttemptAt: number;
  caption: string;
  width?: number;
  height?: number;
  full?: Blob;
  thumb?: Blob;
  slot?: Slot;
  thumbUploaded?: boolean;
  fullUploaded?: boolean;
  photoId?: string;
  /** Object URL for the on-screen thumbnail (runtime only, never persisted). */
  previewUrl?: string;
}

export interface QueueEvents {
  /** The server refused a slot: this guest's allowance for the country is used up. */
  onCapReached?: () => void;
  /** A slot was reserved on the server (counts against the 15 from now on). */
  onSlotGranted?: () => void;
  /** A photo finished — refresh the counters. */
  onPublished?: () => void;
  /** The guest cookie is missing/invalid: ask for the name again. */
  onNoGuest?: () => void;
}

const MAX_ATTEMPTS = 5;
const CONCURRENCY = 2;
const DB_NAME = 'wedding-photo-queue';
const STORE = 'items';
const TERMINAL: ItemStatus[] = ['done', 'refused', 'unreadable'];

// ---------------------------------------------------------------------------
// Minimal IndexedDB helpers. Any failure (private mode, old Safari quirks)
// silently degrades to an in-memory queue — uploads still work, they just
// won't survive a reload.
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'localId' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idb<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function persistable(item: QueueItem): Omit<QueueItem, 'previewUrl'> {
  const rest: Partial<QueueItem> = { ...item };
  delete rest.previewUrl; // object URLs die with the page
  return rest as Omit<QueueItem, 'previewUrl'>;
}

// ---------------------------------------------------------------------------

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

async function postJson(url: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new HttpError(res.status, String(data.error ?? 'http_error'));
  return data;
}

export class UploadQueue {
  private items: QueueItem[] = [];
  private listeners = new Set<() => void>();
  private snapshot: QueueItem[] = [];
  private active = 0;
  private preparing: Promise<void> = Promise.resolve();
  private timer: ReturnType<typeof setInterval> | null = null;
  private stopped = false;
  offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

  private events: QueueEvents = {};

  setEvents(events: QueueEvents) {
    this.events = events;
  }

  // --- React glue (useSyncExternalStore) -----------------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.snapshot;

  private emit() {
    this.snapshot = [...this.items];
    this.listeners.forEach((fn) => fn());
  }

  private update(item: QueueItem, patch: Partial<QueueItem>, persist = true) {
    Object.assign(item, patch);
    if (persist) {
      if (TERMINAL.includes(item.status)) {
        void idb('readwrite', (s) => s.delete(item.localId));
      } else {
        void idb('readwrite', (s) => s.put(persistable(item)));
      }
    }
    this.emit();
  }

  // --- Lifecycle --------------------------------------------------------------
  async start() {
    this.stopped = false;
    const saved = (await idb('readonly', (s) => s.getAll() as IDBRequest<QueueItem[]>)) ?? [];
    for (const it of saved.sort((a, b) => a.createdAt - b.createdAt)) {
      if (this.items.some((x) => x.localId === it.localId)) continue;
      // Anything mid-flight when the page died goes back in line.
      if (it.status === 'uploading' || it.status === 'retrying') it.status = 'queued';
      if (it.status === 'preparing' || !it.full || !it.thumb) {
        void idb('readwrite', (s) => s.delete(it.localId));
        continue;
      }
      it.progress = 0;
      it.previewUrl = URL.createObjectURL(it.thumb);
      this.items.push(it);
    }
    this.emit();

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    document.addEventListener('visibilitychange', this.kick);
    this.timer = setInterval(this.kick, 1000);
    this.kick();
  }

  stop() {
    this.stopped = true;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    document.removeEventListener('visibilitychange', this.kick);
    if (this.timer) clearInterval(this.timer);
  }

  private handleOnline = () => {
    this.offline = false;
    // Back online: everything waiting retries right away.
    for (const it of this.items) {
      if (it.status === 'retrying') it.nextAttemptAt = 0;
    }
    this.emit();
    this.kick();
  };

  private handleOffline = () => {
    this.offline = true;
    this.emit();
  };

  /** Photos still in play (they hold or will claim one of the 15 slots). */
  pendingCount(): number {
    return this.items.filter((i) =>
      ['preparing', 'queued', 'uploading', 'retrying', 'failed'].includes(i.status),
    ).length;
  }

  // --- Adding photos ----------------------------------------------------------
  /**
   * Queue new files. `room` is how many slots are left after what's already
   * in play; anything beyond it is shown as refused straight away (the server
   * enforces the cap regardless).
   */
  add(files: File[], room: number) {
    files.forEach((file, i) => {
      const item: QueueItem = {
        localId: uid(),
        createdAt: Date.now() + i,
        status: i < room ? 'preparing' : 'refused',
        progress: 0,
        attempts: 0,
        nextAttemptAt: 0,
        caption: '',
      };
      if (item.status === 'refused') {
        item.previewUrl = URL.createObjectURL(file);
        this.items.push(item);
        return;
      }
      this.items.push(item);
      // Prepare one at a time: decoding several 12-48 MP photos at once can
      // run a phone out of memory.
      this.preparing = this.preparing.then(async () => {
        try {
          const p = await preparePhoto(file);
          this.update(item, {
            ...p,
            status: 'queued',
            previewUrl: URL.createObjectURL(p.thumb),
          });
        } catch {
          this.update(item, { status: 'unreadable', previewUrl: URL.createObjectURL(file) });
        }
        this.kick();
      });
    });
    this.emit();
  }

  setCaption(localId: string, caption: string) {
    const item = this.items.find((i) => i.localId === localId);
    if (!item) return;
    this.update(item, { caption });
    // Already published: save the caption on the server too.
    if (item.status === 'done' && item.photoId) {
      void fetch('/api/upload/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: item.photoId, caption }),
      }).catch(() => {});
    }
  }

  retry(localId: string) {
    const item = this.items.find((i) => i.localId === localId);
    if (!item || item.status !== 'failed') return;
    this.update(item, { status: 'queued', attempts: 0, nextAttemptAt: 0 });
    this.kick();
  }

  // --- Worker -----------------------------------------------------------------
  kick = () => {
    if (this.stopped || document.visibilityState === 'hidden') return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.offline = true;
      return;
    }
    const now = Date.now();
    while (this.active < CONCURRENCY) {
      const next = this.items.find(
        (i) => i.status === 'queued' || (i.status === 'retrying' && i.nextAttemptAt <= now),
      );
      if (!next) break;
      this.active += 1;
      this.update(next, { status: 'uploading' }, false);
      void this.process(next).finally(() => {
        this.active -= 1;
        this.kick();
      });
    }
  };

  private async process(item: QueueItem) {
    try {
      if (!item.full || !item.thumb) throw new Error('missing_data');

      // 1. Reserve a slot (or reuse one whose tokens are still fresh).
      if (!item.slot || item.slot.validUntil < Date.now() + 60_000) {
        const data = await postJson('/api/upload/request', {
          items: [{ width: item.width, height: item.height }],
        });
        const granted = (data.granted as Slot[] | undefined) ?? [];
        if (!granted.length) {
          this.update(item, { status: 'refused', full: undefined, thumb: undefined });
          this.events.onCapReached?.();
          return;
        }
        this.update(item, { slot: granted[0], thumbUploaded: false, fullUploaded: false });
        this.events.onSlotGranted?.();
      }
      const slot = item.slot!;

      // 2. Upload both files straight to storage.
      if (!item.thumbUploaded) {
        await put(slot.thumbPathname, item.thumb, {
          access: 'public',
          token: slot.thumbToken,
          contentType: 'image/jpeg',
          onUploadProgress: (e) => this.update(item, { progress: (e.percentage / 100) * 0.1 }, false),
        });
        this.update(item, { thumbUploaded: true });
      }
      if (!item.fullUploaded) {
        await put(slot.pathname, item.full, {
          access: 'public',
          token: slot.token,
          contentType: 'image/jpeg',
          onUploadProgress: (e) =>
            this.update(item, { progress: 0.1 + (e.percentage / 100) * 0.88 }, false),
        });
        this.update(item, { fullUploaded: true });
      }

      // 3. Publish.
      try {
        await postJson('/api/upload/complete', { photoId: slot.photoId, caption: item.caption });
      } catch (err) {
        if (err instanceof HttpError && (err.status === 410 || err.status === 409)) {
          // Slot expired or a file went missing: start this photo over.
          this.update(item, { slot: undefined, thumbUploaded: false, fullUploaded: false });
        }
        throw err;
      }

      this.update(item, {
        status: 'done',
        progress: 1,
        photoId: slot.photoId,
        // Drop the heavy blobs; keep the small preview for the screen.
        full: undefined,
        slot: undefined,
      });
      this.events.onPublished?.();
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        this.update(item, { status: 'queued', progress: 0 });
        this.events.onNoGuest?.();
        this.stop();
        return;
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline: wait for the 'online' event without spending a try.
        this.offline = true;
        this.update(item, { status: 'retrying', progress: 0, nextAttemptAt: Date.now() + 5000 });
        return;
      }
      const attempts = item.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        this.update(item, { status: 'failed', attempts, progress: 0 });
        return;
      }
      const delay = 2000 * 2 ** (attempts - 1) + Math.random() * 500; // 2, 4, 8, 16 s
      this.update(item, {
        status: 'retrying',
        attempts,
        progress: 0,
        nextAttemptAt: Date.now() + delay,
      });
    }
  }
}
