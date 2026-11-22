'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { SectionHeading } from '@/components/SectionHeading';
import { Lightbox } from '@/components/photos/PhotoGallery';
import type { GalleryPhoto } from '@/lib/photo-rules';

const POLL_MS = 30_000;
const MAX = 24; // photos in the cloud (12 on phones); the rest live on /gallery
const GLOW_MS = 7000;

// Deterministic variety, so the cloud looks composed rather than random.
const SIZES = ['lg', 'sm', 'md', 'sm', 'lg', 'md', 'sm', 'md'] as const;
const TILT = [-3, 2, -1.5, 3, -2, 1, 2.5, -2.5];
const WIDTH: Record<(typeof SIZES)[number], string> = {
  lg: 'w-32 sm:w-44',
  md: 'w-24 sm:w-36',
  sm: 'w-20 sm:w-28',
};

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function newestFirst(list: GalleryPhoto[]) {
  return list.sort((a, b) =>
    a.createdAt === b.createdAt ? (a.id < b.id ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1,
  );
}

/**
 * The live album on the home page: the latest guest photos floating in gold-
 * framed mats, like the prayer cloud. Every 30 seconds it checks for new
 * photos; new arrivals drift in with a soft gold glow, hidden ones leave.
 * Visitors in Ghana only get Ghana photos (the feed filters by location).
 */
export function PhotoCloud({ lead = false }: { lead?: boolean }) {
  const { t } = useLanguage();
  const g = t.photos;
  const reduce = useReducedMotion();

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [glowing, setGlowing] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const since = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/photos', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setPhotos((d.photos ?? []).slice(0, MAX));
        setTotal(d.total ?? 0);
        since.current = d.serverTime ?? null;
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== 'visible' || !since.current) return;
      try {
        const d = await fetch(`/api/photos?since=${encodeURIComponent(since.current)}`, {
          cache: 'no-store',
        }).then((r) => r.json());
        if (d.serverTime) since.current = d.serverTime;
        const changed: GalleryPhoto[] = d.changed ?? [];
        const removed = new Set<string>(d.removed ?? []);
        if (!changed.length && !removed.size) return;
        let fresh: string[] = [];
        setPhotos((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          removed.forEach((id) => byId.delete(id));
          fresh = changed.filter((p) => !byId.has(p.id)).map((p) => p.id);
          changed.forEach((p) => byId.set(p.id, p));
          return newestFirst(Array.from(byId.values())).slice(0, MAX);
        });
        setTotal((n) => Math.max(0, n + fresh.length - removed.size));
        if (fresh.length) {
          setGlowing((s) => new Set([...Array.from(s), ...fresh]));
          setTimeout(() => {
            setGlowing((s) => {
              const next = new Set(s);
              fresh.forEach((id) => next.delete(id));
              return next;
            });
          }, GLOW_MS);
        }
      } catch {
        /* next tick */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const empty = loaded && photos.length === 0;

  return (
    <section
      id="photos"
      className={`relative overflow-hidden bg-noir ${lead ? 'pb-24 pt-28 sm:pb-36 sm:pt-36' : 'section-pad'}`}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.05] blur-[130px] animate-flicker"
      />

      <div className="container-page relative">
        <SectionHeading kicker={g.liveKicker} title={g.title} intro={g.intro} />

        {/* Live indicator */}
        <p className="mt-8 flex items-center justify-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold/80">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          {g.live}
          {total > 0 && <span className="text-ivory-dim">· {fill(g.count, { n: total })}</span>}
        </p>

        {/* The cloud */}
        <div className="mt-12 min-h-[220px]">
          {empty ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4" aria-hidden>
                {[-4, 3, -2].map((tilt, i) => (
                  <span
                    key={i}
                    className="block border border-dashed border-gold/35 bg-surface/40"
                    style={{
                      width: i === 1 ? 110 : 80,
                      height: i === 1 ? 140 : 104,
                      transform: `rotate(${tilt}deg)`,
                      animation: reduce ? undefined : `floaty ${6 + i}s ease-in-out ${i * 0.6}s infinite`,
                    }}
                  />
                ))}
              </div>
              <p className="mt-8 text-center font-serif text-xl italic text-ivory-dim">{g.firstInvite}</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-5 sm:gap-x-6 sm:gap-y-8">
              <AnimatePresence initial={false}>
                {photos.map((p, i) => {
                  const size = SIZES[i % SIZES.length];
                  const glow = glowing.has(p.id);
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.6, y: reduce ? 0 : 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: glow ? 1.3 : 0.9, delay: loaded && !glow ? Math.min(i * 0.05, 0.8) : 0, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setActive(i)}
                      className={`${WIDTH[size]} ${i >= 12 ? 'hidden sm:block' : 'block'} group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
                    >
                      {/* Float on its own layer: framer-motion owns the button's transform. */}
                      <span
                        className="block"
                        style={
                          reduce
                            ? undefined
                            : { animation: `floaty ${6 + (i % 5)}s ease-in-out ${(i % 7) * 0.4}s infinite` }
                        }
                      >
                        <span
                          className={`block bg-surface p-1.5 ring-1 transition duration-700 [transform:rotate(var(--tilt))] group-hover:[transform:rotate(0deg)_scale(1.05)] sm:p-2 ${
                            glow
                              ? 'shadow-[0_0_34px_rgba(198,161,91,0.55)] ring-gold'
                              : 'shadow-[0_10px_30px_rgba(0,0,0,0.45)] ring-gold/30'
                          }`}
                          style={{ ['--tilt' as string]: `${TILT[i % TILT.length]}deg` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.thumbUrl}
                            alt={p.caption ?? ''}
                            loading="lazy"
                            decoding="async"
                            className="block w-full object-cover"
                            style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : '3 / 4' }}
                          />
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/share" className="btn-primary">
            ＋ {g.shareCta}
          </Link>
          {!empty && (
            <Link href="/gallery" className="btn-ghost">
              {g.seeAll}
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && photos[active] && (
          <Lightbox
            photos={photos}
            index={active}
            onIndex={setActive}
            onClose={() => setActive(null)}
            onNearEnd={() => {}}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
