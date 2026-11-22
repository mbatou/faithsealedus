'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/Header';
import { grabFrame, prepareFromCanvas, type PreparedPhoto } from '@/lib/client/image';
import {
  captureRotation,
  requestOrientationPermission,
  startOrientation,
  stopOrientation,
} from '@/lib/client/orientation';
import type { QueueItem } from '@/lib/client/upload-queue';

export type CameraFailure = 'denied' | 'unsupported' | 'error';
type Facing = 'environment' | 'user';

interface Props {
  /** Guest known and the screen isn't covered (name card, cap reached). */
  enabled: boolean;
  left: number;
  countryLabel: string;
  items: QueueItem[];
  offline: boolean;
  /** Shown over the viewfinder when the guest has used all 15. */
  doneMessage: string | null;
  /** E.g. the first-visit name card, floated over the live viewfinder. */
  overlay?: ReactNode;
  onCapture: (p: PreparedPhoto) => void;
  onFiles: (files: File[]) => void;
  onOpenList: () => void;
  onFail: (why: CameraFailure) => void;
}

const MAX_ENCODING = 3; // photos being compressed at once, before taps are ignored

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/**
 * The page *is* the camera: a live viewfinder, one big shutter. Each tap
 * freezes the frame, compresses it on the phone and hands it to the upload
 * queue — no "use this photo?" step, the guest can keep shooting.
 */
export function CameraView({
  enabled,
  left,
  countryLabel,
  items,
  offline,
  doneMessage,
  overlay,
  onCapture,
  onFiles,
  onOpenList,
  onFail,
}: Props) {
  const { t } = useLanguage();
  const c = t.camera;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  const [facing, setFacing] = useState<Facing>('environment');
  const [ready, setReady] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [hint, setHint] = useState(true);
  const [encoding, setEncoding] = useState(0);

  const stop = useCallback(() => {
    generation.current += 1;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
    setTorchOn(false);
    void wakeLock.current?.release().catch(() => {});
    wakeLock.current = null;
  }, []);

  const start = useCallback(
    async (face: Facing) => {
      stop();
      const gen = generation.current;
      if (!navigator.mediaDevices?.getUserMedia) {
        onFailRef.current('unsupported');
        return;
      }
      // Ask for a sharp stream first; `ideal` never fails, but some phones
      // reject big sizes outright, so fall back to plainer requests.
      const attempts: MediaStreamConstraints[] = [
        {
          audio: false,
          video: { facingMode: { ideal: face }, width: { ideal: 4096 }, height: { ideal: 3072 } },
        },
        { audio: false, video: { facingMode: { ideal: face } } },
        { audio: false, video: true },
      ];
      for (const constraints of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (gen !== generation.current) {
            stream.getTracks().forEach((tr) => tr.stop()); // superseded meanwhile
            return;
          }
          streamRef.current = stream;
          const v = videoRef.current;
          if (v) {
            v.srcObject = stream;
            await v.play().catch(() => {});
          }
          const track = stream.getVideoTracks()[0];
          const caps = (track?.getCapabilities?.() ?? {}) as { torch?: boolean };
          setTorchSupported(Boolean(caps.torch));
          setReady(true);
          try {
            const nav = navigator as unknown as {
              wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
            };
            wakeLock.current = (await nav.wakeLock?.request('screen')) ?? null;
          } catch {
            /* keeping the screen on is a nicety */
          }
          return;
        } catch (err) {
          const name = (err as DOMException)?.name;
          if (name === 'NotAllowedError' || name === 'SecurityError') {
            if (gen === generation.current) onFailRef.current('denied');
            return;
          }
          // OverconstrainedError / NotReadableError / NotFoundError: try plainer.
        }
      }
      if (gen === generation.current) onFailRef.current('error');
    },
    [stop],
  );

  // Open the camera now, and again whenever the guest flips it.
  useEffect(() => {
    void start(facing);
    return () => stop();
  }, [facing, start, stop]);

  // Phones kill the camera in the background: release it, reopen on return.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') stop();
      else void start(facing);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [facing, start, stop]);

  useEffect(() => {
    startOrientation(); // Android: works straight away. iPhone: after the permission tap.
    return () => stopOrientation();
  }, []);

  const canShoot = enabled && ready && left - encoding > 0 && encoding < MAX_ENCODING;

  function shoot() {
    requestOrientationPermission();
    const v = videoRef.current;
    if (!canShoot || !v || !v.videoWidth) return;
    let canvas: HTMLCanvasElement;
    try {
      canvas = grabFrame(v, captureRotation(facing === 'user'));
    } catch {
      return;
    }
    setFlashKey((k) => k + 1);
    setHint(false);
    navigator.vibrate?.(15);
    setEncoding((n) => n + 1);
    prepareFromCanvas(canvas)
      .then(onCapture)
      .catch(() => {})
      .finally(() => setEncoding((n) => n - 1));
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] });
      setTorchOn((on) => !on);
    } catch {
      setTorchSupported(false);
    }
  }

  // Status for the thumbnail badge.
  const sending = items.filter((i) => ['preparing', 'queued', 'uploading', 'retrying'].includes(i.status)).length + encoding;
  const failed = items.some((i) => i.status === 'failed');
  const last = [...items].sort((a, b) => b.createdAt - a.createdAt).find((i) => i.previewUrl && i.status !== 'refused');

  const round =
    'flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/40 text-ivory backdrop-blur transition active:scale-95';

  return (
    <div className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-black text-ivory">
      {/* What you see is what you get: the whole frame, letterboxed. */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 h-full w-full object-contain ${facing === 'user' ? '-scale-x-100' : ''}`}
      />

      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-sm text-ivory-dim">
          <span className="h-8 w-8 animate-spin rounded-full border border-gold/20 border-t-gold" />
          {c.starting}
        </div>
      )}

      {flashKey > 0 && (
        <div key={flashKey} aria-hidden className="shutter-flash pointer-events-none absolute inset-0 bg-white" />
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="rounded-full border border-gold/40 bg-black/50 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold backdrop-blur">
          {fill(c.left, { n: Math.max(0, left - encoding), country: countryLabel })}
        </span>
        <LanguageToggle />
      </div>

      {offline && (
        <p
          role="status"
          className="relative z-10 mx-4 border border-gold/30 bg-black/60 px-4 py-2 text-center text-sm text-gold backdrop-blur"
        >
          {t.share.retry}
        </p>
      )}

      <div className="flex-1" />

      {hint && enabled && ready && (
        <p className="relative z-10 mx-auto mb-3 max-w-xs rounded-full bg-black/55 px-4 py-2 text-center text-xs text-ivory backdrop-blur">
          {c.hint}
        </p>
      )}

      {/* Secondary controls */}
      <div className="relative z-10 flex items-center justify-between px-6 pb-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ivory backdrop-blur">
          <span aria-hidden>▦</span> {c.fromGallery}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!enabled}
            className="sr-only-field"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = '';
              if (files.length) onFiles(files);
            }}
          />
        </label>
        {torchSupported && (
          <button
            type="button"
            onClick={() => void toggleTorch()}
            aria-pressed={torchOn}
            className={`rounded-full px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] backdrop-blur ${
              torchOn ? 'bg-gold text-noir' : 'bg-black/45 text-ivory'
            }`}
          >
            ϟ {c.flash}
          </button>
        )}
      </div>

      {/* Main row: last photo · shutter · flip */}
      <div className="relative z-10 grid grid-cols-3 items-center bg-gradient-to-t from-black/80 to-transparent px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onOpenList}
            aria-label={c.myPhotos}
            className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/30 bg-black/50"
          >
            {last?.previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={last.previewUrl} alt="" className="h-full w-full object-cover" />
            )}
            {!last && <span className="text-[0.55rem] uppercase tracking-wider text-ivory-dim">{c.myPhotos}</span>}
            {(sending > 0 || failed) && (
              <span
                className={`absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold ${
                  failed ? 'bg-red-500 text-white' : 'bg-gold text-noir'
                }`}
              >
                {failed ? '!' : sending}
              </span>
            )}
            {sending === 0 && !failed && last && (
              <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] text-noir">
                ✓
              </span>
            )}
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={shoot}
            disabled={!canShoot}
            aria-label={c.shutter}
            className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-gold p-1 transition active:scale-90 disabled:opacity-40"
          >
            <span className="h-full w-full rounded-full bg-ivory" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            aria-label={c.flip}
            onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            className={`${round} text-2xl`}
          >
            ⟲
          </button>
        </div>
      </div>

      {doneMessage && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="card max-w-sm p-7 text-center">
            <p className="font-serif text-xl leading-snug text-ivory">{doneMessage}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="/gallery" className="btn-primary">
                {t.share.viewGallery}
              </a>
              <button type="button" onClick={onOpenList} className="btn-ghost">
                {c.myPhotos}
              </button>
            </div>
          </div>
        </div>
      )}

      {overlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-5 backdrop-blur-[2px]">
          {overlay}
        </div>
      )}
    </div>
  );
}
