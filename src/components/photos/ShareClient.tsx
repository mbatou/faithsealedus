'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MarkDivider } from '@/components/Mark';
import { UploadQueue, type QueueItem } from '@/lib/client/upload-queue';
import { CAPTION_MAX, GUEST_NAME_MAX, type PhotoCountry } from '@/lib/photo-rules';

interface Me {
  country: PhotoCountry;
  cap: number;
  region: 'all' | 'gh';
  configured: boolean;
  guest: { name: string } | null;
  used: Record<PhotoCountry, number>;
}

const IN_PLAY = ['preparing', 'queued', 'uploading', 'retrying', 'failed'];
const EMPTY: QueueItem[] = [];

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function ShareClient() {
  const { t } = useLanguage();
  const s = t.share;

  const [me, setMe] = useState<Me | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needName, setNeedName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/share/me', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Me;
      setMe(data);
      setLoadError(false);
      if (!data.guest) setNeedName(true);
    } catch {
      setLoadError(true);
    }
  }, []);

  // One queue for the page's lifetime.
  const queueRef = useRef<UploadQueue | null>(null);
  if (!queueRef.current && typeof window !== 'undefined') {
    queueRef.current = new UploadQueue();
  }
  const queue = queueRef.current;
  const items = useSyncExternalStore(
    queue?.subscribe ?? (() => () => {}),
    queue?.getSnapshot ?? (() => EMPTY),
    () => EMPTY,
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Start the queue once we know who the guest is.
  const hasGuest = Boolean(me?.guest);
  useEffect(() => {
    if (!queue || !hasGuest) return;
    queue.setEvents({
      onSlotGranted: refresh,
      onPublished: refresh,
      onCapReached: refresh,
      onNoGuest: () => {
        setNeedName(true);
        setMe((m) => (m ? { ...m, guest: null } : m));
      },
    });
    void queue.start();
    return () => queue.stop();
  }, [queue, hasGuest, refresh]);

  async function submitName(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch('/api/share/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      });
      if (!res.ok) throw new Error();
      setNeedName(false);
      await refresh();
    } catch {
      setFormError(s.error);
    } finally {
      setSaving(false);
    }
  }

  function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow picking the same photo again later
    if (!files.length || !queue) return;
    queue.add(files, left);
  }

  // ---- Counters ---------------------------------------------------------------
  const country = me?.country ?? 'ghana';
  const cap = me?.cap ?? 15;
  // Photos picked on this phone that haven't reserved a server slot yet.
  const unreserved = items.filter((i) => IN_PLAY.includes(i.status) && !i.slot).length;
  const used = me?.used[country] ?? 0;
  const left = Math.max(0, cap - used - unreserved);
  const busy = items.some((i) => IN_PLAY.includes(i.status) && i.status !== 'failed');
  const capReached = Boolean(me?.guest) && left === 0 && !busy;
  const gh = me?.region === 'gh';
  const other: PhotoCountry = country === 'ghana' ? 'senegal' : 'ghana';
  const otherLeft = Math.max(0, cap - (me?.used[other] ?? 0));
  const ordered = [...items].sort((a, b) => b.createdAt - a.createdAt);
  const offline = Boolean(queue?.offline) && items.some((i) => i.status === 'retrying');

  const doneMessage = country === 'ghana' ? (gh ? s.doneGhLocal : s.doneGh) : s.doneSn;

  return (
    <main className="container-page max-w-xl pb-24 pt-12 sm:pt-16">
      <div className="flex flex-col items-center text-center">
        <p className="eyebrow">{t.hero.bride} &amp; {t.hero.groom}</p>
        <h1 className="mt-5 font-serif text-[2.3rem] font-semibold leading-[1.05] text-ivory sm:text-5xl">
          {s.title}
        </h1>
        <MarkDivider className="mt-6" />
        <p className="mt-6 text-base font-light text-ivory-dim">{s.sub}</p>
      </div>

      {!me && !loadError && (
        <div className="mt-14 flex justify-center" aria-busy>
          <span className="h-8 w-8 animate-spin rounded-full border border-gold/20 border-t-gold" />
        </div>
      )}

      {loadError && !me && (
        <div className="mt-12 text-center">
          <p className="text-ivory-dim">{s.error}</p>
          <button type="button" className="btn-ghost mt-5" onClick={() => void refresh()}>
            {s.tapRetry}
          </button>
        </div>
      )}

      {me && !me.configured && (
        <p className="card mt-12 p-6 text-center text-ivory-dim">{s.notConfigured}</p>
      )}

      {/* First visit: name */}
      {me && me.configured && needName && (
        <form onSubmit={submitName} className="card mt-12 p-6 sm:p-8">
          <label htmlFor="guest-name" className="block font-serif text-2xl text-ivory">
            {s.name}
          </label>
          <input
            id="guest-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={GUEST_NAME_MAX}
            autoComplete="given-name"
            autoFocus
            placeholder={s.namePlaceholder}
            className="field-input mt-5 text-lg"
          />
          {formError && (
            <p className="mt-4 border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary mt-7 w-full py-4"
          >
            {s.continue}
          </button>
        </form>
      )}

      {/* Upload screen */}
      {me && me.configured && me.guest && !needName && (
        <div className="mt-10">
          <p className="text-center font-serif text-lg italic text-gold">
            {fill(s.hello, { name: me.guest.name })}
          </p>

          <div className="mt-8 text-center">
            {capReached ? (
              <p className="font-serif text-xl leading-snug text-ivory sm:text-2xl">{doneMessage}</p>
            ) : (
              <p className="font-serif text-2xl text-ivory sm:text-3xl">
                {fill(s.left, { n: left, country: t.country[country] })}
              </p>
            )}
            {!gh && (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ivory-dim">
                {country === 'ghana'
                  ? s.opensSenegal
                  : fill(s.otherLeft, { n: otherLeft, country: t.country[other] })}
              </p>
            )}
          </div>

          <label
            className={`btn-primary mt-8 w-full cursor-pointer py-5 text-sm hover:bg-gold hover:text-noir ${
              left === 0 ? 'pointer-events-none opacity-50' : ''
            }`}
            aria-disabled={left === 0}
          >
            <span aria-hidden className="text-lg leading-none">＋</span> {s.add}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={left === 0}
              onChange={onFiles}
              className="sr-only-field"
            />
          </label>

          {offline && (
            <p
              role="status"
              className="mt-5 border border-gold/30 bg-gold/10 px-4 py-2 text-center text-sm text-gold"
            >
              {s.retry}
            </p>
          )}

          {ordered.length > 0 && (
            <ul className="mt-8 space-y-3">
              {ordered.map((item) => (
                <QueueRow key={item.localId} item={item} queue={queue!} />
              ))}
            </ul>
          )}

          <div className="mt-12 text-center">
            <Link href="/gallery" className="btn-ghost">
              {s.viewGallery}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function QueueRow({ item, queue }: { item: QueueItem; queue: UploadQueue }) {
  const { t } = useLanguage();
  const s = t.share;
  const [caption, setCaption] = useState(item.caption);

  const label: Record<QueueItem['status'], string> = {
    preparing: s.preparing,
    queued: s.uploading,
    uploading: `${s.uploading} · ${Math.round(item.progress * 100)}%`,
    retrying: s.retrying,
    failed: s.tapRetry,
    done: s.shared,
    refused: s.refused,
    unreadable: s.unreadable,
  };
  const dim = item.status === 'refused' || item.status === 'unreadable';
  const canCaption = !dim;

  return (
    <li className={`card flex gap-3 p-3 ${dim ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={() => queue.retry(item.localId)}
        disabled={item.status !== 'failed'}
        className="relative h-20 w-20 shrink-0 overflow-hidden bg-noir ring-1 ring-gold/25"
        aria-label={item.status === 'failed' ? s.tapRetry : undefined}
      >
        {item.previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
        )}
        {item.status === 'failed' && (
          <span className="absolute inset-0 flex items-center justify-center bg-noir/70 text-2xl text-gold">
            ↻
          </span>
        )}
        {item.status === 'done' && (
          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.65rem] text-noir">
            ✓
          </span>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
              item.status === 'failed' ? 'text-red-300' : item.status === 'done' ? 'text-gold' : 'text-ivory-dim'
            }`}
          >
            {item.status === 'failed' ? (
              <button type="button" onClick={() => queue.retry(item.localId)} className="underline">
                {label.failed}
              </button>
            ) : (
              label[item.status]
            )}
          </span>
        </div>

        {(item.status === 'uploading' || item.status === 'queued' || item.status === 'retrying') && (
          <div className="mt-2 h-0.5 w-full bg-gold/15">
            <div
              className="h-full bg-gold transition-[width] duration-300"
              style={{ width: `${Math.round(item.progress * 100)}%` }}
            />
          </div>
        )}

        {canCaption && (
          <input
            type="text"
            value={caption}
            maxLength={CAPTION_MAX}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => caption !== item.caption && queue.setCaption(item.localId, caption)}
            placeholder={s.captionPlaceholder}
            aria-label={s.captionPlaceholder}
            className="field-input mt-2 py-1.5 text-sm"
          />
        )}
      </div>
    </li>
  );
}
