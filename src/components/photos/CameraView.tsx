'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/Header';
import { Mark } from '@/components/Mark';
import { FrameBand } from '@/components/photos/FrameBand';
import { COUPLE } from '@/lib/brand';
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
type Box = { left: number; top: number; width: number; height: number };

interface Props {
  /** Guest known and the screen isn't covered (name card, cap reached). */
  enabled: boolean;
  left: number;
  cap: number;
  countryLabel: string;
  /** Place & date on the frame, e.g. "Accra · 2 · XII · MMXXVI". */
  frameLine: string;
  guestName: string | null;
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
const EASE = [0.16, 1, 0.3, 1] as const;

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/** A small copy of the frozen frame, for the "photo flies to the album" moment. */
function miniature(canvas: HTMLCanvasElement): string {
  const s = 240 / Math.max(canvas.width, canvas.height);
  const c = document.createElement('canvas');
  c.width = Math.round(canvas.width * s);
  c.height = Math.round(canvas.height * s);
  c.getContext('2d')?.drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.6);
}

/**
 * The page *is* the camera. A live viewfinder dressed as the wedding's frame
 * (gold hairline, the couple's signature band beneath — exactly what the
 * downloaded keepsake looks like), one big shutter. Each tap freezes the
 * frame, compresses it on the phone and hands it to the upload queue — no
 * "use this photo?" step, the guest keeps shooting.
 */
export function CameraView({
  enabled,
  left,
  cap,
  countryLabel,
  frameLine,
  guestName,
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
  const areaRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  const [facing, setFacing] = useState<Facing>('environment');
  const [ready, setReady] = useState(false);
  const [rect, setRect] = useState<Box | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [hint, setHint] = useState(true);
  const [encoding, setEncoding] = useState(0);
  const [fly, setFly] = useState<{ key: number; src: string; from: Box; to: Box } | null>(null);
  const [toast, setToast] = useState(false);

  // ---- Stream ------------------------------------------------------------------
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

  // ---- Where the picture sits, so the gold frame hugs it exactly -------------
  const measure = useCallback(() => {
    const a = areaRef.current;
    const v = videoRef.current;
    if (!a || !v || !v.videoWidth) return;
    const aw = a.clientWidth;
    const ah = a.clientHeight;
    const s = Math.min(aw / v.videoWidth, ah / v.videoHeight);
    const width = v.videoWidth * s;
    const height = v.videoHeight * s;
    setRect({ left: (aw - width) / 2, top: (ah - height) / 2, width, height });
  }, []);

  useEffect(() => {
    const a = areaRef.current;
    const v = videoRef.current;
    if (!a || !v) return;
    const ro = new ResizeObserver(measure);
    ro.observe(a);
    v.addEventListener('loadedmetadata', measure);
    v.addEventListener('resize', measure); // stream turns with the phone
    return () => {
      ro.disconnect();
      v.removeEventListener('loadedmetadata', measure);
      v.removeEventListener('resize', measure);
    };
  }, [measure]);

  // ---- "Added to the album" whenever another photo lands ---------------------
  const doneCount = items.filter((i) => i.status === 'done').length;
  const prevDone = useRef(doneCount);
  useEffect(() => {
    if (doneCount > prevDone.current) {
      setToast(true);
      const id = setTimeout(() => setToast(false), 2200);
      prevDone.current = doneCount;
      return () => clearTimeout(id);
    }
    prevDone.current = doneCount;
  }, [doneCount]);

  // ---- Shutter -----------------------------------------------------------------
  const remaining = Math.max(0, left - encoding);
  const canShoot = enabled && ready && remaining > 0 && encoding < MAX_ENCODING;

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

    // The shot shrinks from the viewfinder into the "My photos" thumbnail.
    const area = areaRef.current?.getBoundingClientRect();
    const to = thumbRef.current?.getBoundingClientRect();
    if (area && to && rect) {
      setFly({
        key: Date.now(),
        src: miniature(canvas),
        from: { left: area.left + rect.left, top: area.top + rect.top, width: rect.width, height: rect.height },
        to: { left: to.left, top: to.top, width: to.width, height: to.height },
      });
    }

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

  // ---- Badge on the thumbnail -----------------------------------------------------
  const sending =
    items.filter((i) => ['preparing', 'queued', 'uploading', 'retrying'].includes(i.status)).length + encoding;
  const failed = items.some((i) => i.status === 'failed');
  const last = [...items]
    .sort((a, b) => b.createdAt - a.createdAt)
    .find((i) => i.previewUrl && i.status !== 'refused' && i.status !== 'unreadable');

  const pill =
    'rounded-full bg-black/55 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] backdrop-blur';
  const used = cap - remaining;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-noir text-ivory">
      {/* Top bar: allowance + language */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5 rounded-full border border-gold/35 bg-black/40 py-1.5 pl-3 pr-4">
          {/* 15 little beads that fill as photos are taken */}
          <span className="flex gap-[2px]" aria-hidden>
            {Array.from({ length: cap }, (_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full transition-colors duration-500 ${
                  i < used ? 'bg-gold' : 'bg-gold/20'
                }`}
              />
            ))}
          </span>
          <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-gold">
            {fill(c.left, { n: remaining, country: countryLabel })}
          </span>
        </div>
        <LanguageToggle />
      </div>

      {/* Viewfinder */}
      <div ref={areaRef} className="relative mx-5 min-h-0 flex-1">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          } ${facing === 'user' ? '-scale-x-100' : ''}`}
        />

        {/* The frame: a floating gold hairline with corner marks, hugging the picture */}
        {ready && rect && (
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
          >
            <div className="absolute inset-0 shadow-[inset_0_0_70px_rgba(0,0,0,0.35)]" />
            <div className="absolute -inset-[7px] border border-gold/60" />
            {(
              [
                'left-0 top-0 border-l-[1.5px] border-t-[1.5px]',
                'right-0 top-0 border-r-[1.5px] border-t-[1.5px]',
                'left-0 bottom-0 border-l-[1.5px] border-b-[1.5px]',
                'right-0 bottom-0 border-r-[1.5px] border-b-[1.5px]',
              ] as const
            ).map((pos) => (
              <span key={pos} className={`absolute -m-[11px] h-5 w-5 border-gold ${pos}`} />
            ))}
          </div>
        )}

        {/* Branded splash while the camera wakes up */}
        <AnimatePresence>
          {!ready && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
              >
                <Mark className="mx-auto h-10 w-16 text-gold" />
              </motion.div>
              <p className="mt-4 font-serif text-3xl italic text-ivory">{COUPLE}</p>
              <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-gold">
                {frameLine}
              </p>
              <p className="mt-8 flex items-center gap-3 text-xs text-ivory-dim">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border border-gold/25 border-t-gold" />
                {c.starting}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {flashKey > 0 && rect && (
          <div
            key={flashKey}
            aria-hidden
            className="shutter-flash pointer-events-none absolute bg-white"
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
          />
        )}

        {offline && (
          <p
            role="status"
            className="absolute inset-x-2 top-2 border border-gold/30 bg-black/70 px-4 py-2 text-center text-sm text-gold backdrop-blur"
          >
            {t.share.retry}
          </p>
        )}

        <AnimatePresence>
          {hint && enabled && ready && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.8 } }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-3 mx-auto w-fit max-w-[85%] rounded-full bg-black/60 px-4 py-2 text-center text-xs text-ivory backdrop-blur"
            >
              {c.hint}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-gold px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-noir"
            >
              ✓ {c.shared}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* The signature band, as it will appear under the photo */}
      <div className="relative z-10 pt-4">
        <FrameBand
          compact
          line={frameLine}
          by={guestName ? fill(t.photos.by, { name: guestName }) : null}
        />
      </div>

      {/* Secondary controls */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-3">
        <label className={`${pill} flex cursor-pointer items-center gap-2 text-ivory`}>
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
            className={`${pill} ${torchOn ? '!bg-gold text-noir' : 'text-ivory'}`}
          >
            ϟ {c.flash}
          </button>
        )}
      </div>

      {/* Main row: last photo · shutter · flip */}
      <div className="relative z-10 grid grid-cols-3 items-center px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex justify-start">
          <button
            ref={thumbRef}
            type="button"
            onClick={onOpenList}
            aria-label={c.myPhotos}
            className="relative flex h-14 w-14 items-center justify-center rounded-lg border border-gold/40 bg-surface"
          >
            {last?.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={last.previewUrl} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <span className="px-1 text-[0.5rem] font-semibold uppercase leading-tight tracking-wider text-ivory-dim">
                {c.myPhotos}
              </span>
            )}
            {(sending > 0 || failed) && (
              <span
                className={`absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold ${
                  failed ? 'bg-red-500 text-white' : 'bg-gold text-noir'
                }`}
              >
                {failed ? '!' : sending}
              </span>
            )}
            {sending === 0 && !failed && last && (
              <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[0.65rem] text-noir">
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
            className="group relative flex h-[84px] w-[84px] items-center justify-center rounded-full border-[2px] border-gold transition disabled:opacity-40"
          >
            <span aria-hidden className="absolute inset-[5px] rounded-full border border-gold/40" />
            <span className="h-[62px] w-[62px] rounded-full bg-ivory transition duration-150 group-active:scale-90 group-active:bg-gold" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            aria-label={c.flip}
            onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-black/40 text-2xl text-gold transition active:rotate-180"
          >
            ⟲
          </button>
        </div>
      </div>

      {/* The shot, flying into the album */}
      <AnimatePresence>
        {fly && (
          <motion.img
            key={fly.key}
            src={fly.src}
            alt=""
            aria-hidden
            className="pointer-events-none fixed z-30 object-cover ring-1 ring-gold"
            initial={{ ...fly.from, opacity: 1, borderRadius: 0 }}
            animate={{ ...fly.to, opacity: 0.9, borderRadius: 8 }}
            transition={{ duration: 0.65, ease: EASE }}
            onAnimationComplete={() => setFly((f) => (f?.key === fly.key ? null : f))}
          />
        )}
      </AnimatePresence>

      {doneMessage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
          <div className="card max-w-sm p-7 text-center">
            <Mark className="mx-auto h-6 w-10 text-gold" />
            <p className="mt-4 font-serif text-xl leading-snug text-ivory">{doneMessage}</p>
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
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-5 backdrop-blur-[3px]">
          {overlay}
        </div>
      )}
    </div>
  );
}
