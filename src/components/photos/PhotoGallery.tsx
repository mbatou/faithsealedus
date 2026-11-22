'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { SectionHeading } from '@/components/SectionHeading';
import type { GalleryPhoto, PhotoCountry, PhotoEvent } from '@/lib/photo-rules';
import { FrameBand } from '@/components/photos/FrameBand';
import { frameLine } from '@/lib/brand';
import { renderKeepsake, saveKeepsake } from '@/lib/client/keepsake';

type CountryTab = 'all' | PhotoCountry;
type EventTab = 'all' | PhotoEvent;

const POLL_MS = 30_000;

const EVENTS_FOR: Record<CountryTab, PhotoEvent[]> = {
  all: ['civil', 'traditional', 'dakar', 'moments'],
  ghana: ['civil', 'traditional', 'moments'],
  senegal: ['dakar', 'moments'],
};

function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function matches(p: GalleryPhoto, country: CountryTab, event: EventTab) {
  return (country === 'all' || p.country === country) && (event === 'all' || p.event === event);
}

function sortNewest(list: GalleryPhoto[]) {
  return list.sort((a, b) =>
    a.createdAt === b.createdAt ? (a.id < b.id ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1,
  );
}

/** Vercel Blob serves `?download=1` as an attachment, so the button saves the file. */
function downloadHref(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}download=1`;
}

export function PhotoGallery({
  region,
  variant = 'page',
}: {
  region: 'all' | 'gh';
  variant?: 'page' | 'home';
}) {
  const { t } = useLanguage();
  const g = t.photos;
  const gh = region === 'gh';

  const [country, setCountry] = useState<CountryTab>(gh ? 'ghana' : 'all');
  const [event, setEvent] = useState<EventTab>('all');
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const sinceRef = useRef<string | null>(null);
  const filterRef = useRef({ country, event });
  filterRef.current = { country, event };
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  const query = useCallback(
    (extra: Record<string, string>) => {
      const q = new URLSearchParams(extra);
      if (country !== 'all') q.set('country', country);
      if (event !== 'all') q.set('event', event);
      return `/api/photos?${q.toString()}`;
    },
    [country, event],
  );

  // First page whenever the filters change.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(query({}), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setPhotos(Array.isArray(d.photos) ? d.photos : []);
        setCursor(d.nextCursor ?? null);
        sinceRef.current = d.serverTime ?? null;
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  // Live-ish: every 30 s, merge what changed (new, hidden, re-tagged).
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== 'visible' || !sinceRef.current) return;
      try {
        const r = await fetch(query({ since: sinceRef.current }), { cache: 'no-store' });
        const d = await r.json();
        if (d.serverTime) sinceRef.current = d.serverTime;
        const changed: GalleryPhoto[] = d.changed ?? [];
        const removed = new Set<string>(d.removed ?? []);
        if (!changed.length && !removed.size) return;
        const { country: c, event: e } = filterRef.current;
        setPhotos((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          removed.forEach((id) => byId.delete(id));
          const oldest = prev[prev.length - 1]?.createdAt;
          for (const p of changed) {
            if (!matches(p, c, e)) {
              byId.delete(p.id);
              continue;
            }
            // Don't pull in photos older than what's loaded — pagination will.
            if (byId.has(p.id) || !oldest || p.createdAt >= oldest || !cursorRef.current) {
              byId.set(p.id, p);
            }
          }
          return sortNewest(Array.from(byId.values()));
        });
      } catch {
        /* next tick */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [query]);

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const d = await fetch(query({ cursor }), { cache: 'no-store' }).then((r) => r.json());
      const more: GalleryPhoto[] = d.photos ?? [];
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setCursor(d.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  // Infinite scroll: load the next page as the sentinel nears the viewport.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor || variant === 'home') return;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && !loading && void loadMore(),
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, loading, variant]);

  // Keep the lightbox index valid if photos change underneath it.
  useEffect(() => {
    if (active !== null && active >= photos.length) setActive(photos.length ? photos.length - 1 : null);
  }, [photos.length, active]);

  const countryTabs: { id: CountryTab; label: string }[] = gh
    ? []
    : [
        { id: 'all', label: g.all },
        { id: 'ghana', label: g.accra },
        { id: 'senegal', label: g.dakar },
      ];
  const eventTabs = EVENTS_FOR[gh ? 'ghana' : country];

  const tab = (on: boolean) =>
    `whitespace-nowrap border px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] transition ${
      on ? 'border-gold bg-gold text-noir' : 'border-gold/25 text-ivory-dim hover:border-gold/60 hover:text-ivory'
    }`;

  return (
    <section id="photos" className={variant === 'home' ? 'section-pad bg-noir pt-28 sm:pt-36' : 'bg-noir pb-24 pt-10'}>
      <div className="container-page">
        {variant === 'home' ? (
          <SectionHeading kicker={`${t.hero.bride} & ${t.hero.groom}`} title={g.title} intro={g.intro} />
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow">{g.kicker}</p>
            <h1 className="mt-5 font-serif text-[2.3rem] font-semibold leading-[1.05] text-ivory sm:text-5xl md:text-6xl">
              {g.title}
            </h1>
            <p className="mt-6 max-w-xl text-base font-light text-ivory-dim">{g.intro}</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/share" className="btn-primary">
            ＋ {g.shareCta}
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col items-center gap-3">
          {countryTabs.length > 0 && (
            <div className="flex gap-2" role="tablist">
              {countryTabs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={country === c.id}
                  className={tab(country === c.id)}
                  onClick={() => {
                    setCountry(c.id);
                    setEvent('all');
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <div className="-mx-5 flex max-w-[100vw] gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            <button type="button" className={tab(event === 'all')} onClick={() => setEvent('all')}>
              {g.allEvents}
            </button>
            {eventTabs.map((e) => (
              <button key={e} type="button" className={tab(event === e)} onClick={() => setEvent(e)}>
                {g.events[e]}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry grid */}
        {!loading && photos.length === 0 ? (
          <p className="mt-16 text-center font-serif text-lg italic text-ivory-dim">{g.empty}</p>
        ) : (
          <div className="mt-10 columns-2 gap-2 sm:columns-3 sm:gap-4 lg:columns-4">
            {photos.map((p, i) => (
              <Thumb key={p.id} photo={p} onOpen={() => setActive(i)} />
            ))}
          </div>
        )}

        <div ref={sentinel} />
        {cursor && (
          <div className="mt-10 flex justify-center">
            {variant === 'home' ? (
              <Link href="/gallery" className="btn-ghost">
                {g.seeAll}
              </Link>
            ) : (
              <button type="button" className="btn-ghost" disabled={loading} onClick={() => void loadMore()}>
                {g.loadMore}
              </button>
            )}
          </div>
        )}
        {loading && photos.length === 0 && (
          <div className="mt-16 flex justify-center" aria-busy>
            <span className="h-8 w-8 animate-spin rounded-full border border-gold/20 border-t-gold" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {active !== null && photos[active] && (
          <Lightbox
            photos={photos}
            index={active}
            onIndex={setActive}
            onClose={() => setActive(null)}
            onNearEnd={() => cursor && !loading && void loadMore()}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Thumb({ photo, onOpen }: { photo: GalleryPhoto; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : '3 / 4';
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative mb-2 block w-full break-inside-avoid overflow-hidden bg-surface ring-1 ring-gold/25 transition duration-500 hover:ring-gold/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:mb-4"
      style={{ aspectRatio: ratio }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbUrl}
        alt={photo.caption ?? ''}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-[1.4s] ease-out group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </button>
  );
}

export function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
  onNearEnd,
}: {
  photos: GalleryPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  onNearEnd: () => void;
}) {
  const { t } = useLanguage();
  const g = t.photos;
  const p = photos[index];
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (d: number) => {
      const next = index + d;
      if (next < 0 || next >= photos.length) return;
      onIndex(next);
      if (next >= photos.length - 3) onNearEnd();
    },
    [index, photos.length, onIndex, onNearEnd],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  // Preload neighbours so swiping feels instant.
  useEffect(() => {
    [photos[index + 1], photos[index - 1]].forEach((n) => {
      if (n) new Image().src = n.url;
    });
  }, [index, photos]);

  // The framed keepsake for the photo on screen, prepared ahead of the tap so
  // the phone's share sheet opens instantly (it needs the tap's "gesture").
  const line = frameLine(p.country, p.event);
  const by = fill(g.by, { name: p.name });
  const [keepsake, setKeepsake] = useState<{ id: string; blob: Blob } | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef<Promise<Blob> | null>(null);
  useEffect(() => {
    let alive = true;
    const job = fetch(`/api/photos/${p.id}/file`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('fetch_failed'))))
      .then((b) => renderKeepsake(b, { line, by }));
    pending.current = job;
    job.then((blob) => alive && setKeepsake({ id: p.id, blob })).catch(() => {});
    return () => {
      alive = false;
    };
  }, [p.id, line, by]);

  async function download() {
    const name = `augusta-georges-${p.id.slice(0, 8)}.jpg`;
    if (keepsake?.id === p.id) return saveKeepsake(keepsake.blob, name);
    setSaving(true);
    try {
      await saveKeepsake(await pending.current!, name);
    } catch {
      window.location.href = downloadHref(p.url); // plain original as a last resort
    } finally {
      setSaving(false);
    }
  }

  const iconBtn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold backdrop-blur transition hover:bg-gold/10';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col bg-noir/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = touch.current;
        touch.current = null;
        if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => void download()}
          className={`${iconBtn} ${saving ? 'animate-pulse' : ''}`}
          aria-label={g.download}
          title={g.download}
        >
          ⬇
        </button>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ivory-dim">
          {index + 1} / {photos.length}
        </span>
        <button type="button" className={iconBtn} aria-label={g.close} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-6" onClick={onClose}>
        <AnimatePresence mode="wait" initial={false}>
          {/* The photo in the wedding frame: floating gold hairline, as on the camera */}
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption ?? ''}
              className="block object-contain"
              style={{
                maxHeight: 'calc(100dvh - 300px)',
                maxWidth: 'calc(100vw - 48px)',
                backgroundImage: `url(${p.thumbUrl})`,
                backgroundSize: 'cover',
              }}
            />
            <span aria-hidden className="pointer-events-none absolute -inset-[7px] border border-gold/60" />
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          aria-label={g.prev}
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          disabled={index === 0}
          className={`${iconBtn} absolute left-3 hidden disabled:opacity-0 sm:flex`}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={g.next}
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          disabled={index === photos.length - 1}
          className={`${iconBtn} absolute right-3 hidden disabled:opacity-0 sm:flex`}
        >
          ›
        </button>
      </div>

      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center">
        <FrameBand line={line} by={by} />
        {p.caption && <p className="mt-3 font-serif text-lg italic text-ivory/90">“{p.caption}”</p>}
      </div>
    </motion.div>
  );
}
