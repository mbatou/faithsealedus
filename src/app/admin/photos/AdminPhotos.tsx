'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { logout } from '../actions';
import type { AdminPhoto } from '@/lib/admin-photos';
import { COUNTRIES, EVENTS, type PhotoCountry, type PhotoEvent } from '@/lib/photo-rules';

export interface PhotoStats {
  byCountry: Record<PhotoCountry, number>;
  byEvent: Record<PhotoEvent, number>;
  hidden: number;
  uploaders: number;
  top: { name: string; n: number }[];
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ivory-dim">{label}</p>
      <p className="mt-1 font-serif text-3xl text-ivory">{value}</p>
    </div>
  );
}

export function AdminPhotos({
  stats,
  initial,
  partSize,
}: {
  stats: PhotoStats;
  initial: { photos: AdminPhoto[]; nextCursor: string | null };
  partSize: number;
}) {
  const { t } = useLanguage();
  const a = t.adminPhotos;
  const g = t.photos;

  const [photos, setPhotos] = useState(initial.photos);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(reset: boolean, hidden = hiddenOnly) {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (!reset && cursor) q.set('cursor', cursor);
      if (hidden) q.set('hidden', '1');
      const d = await fetch(`/api/admin/photos?${q}`, { cache: 'no-store' }).then((r) => r.json());
      setPhotos((prev) => (reset ? d.photos : [...prev, ...d.photos]));
      setCursor(d.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  async function patch(id: string, body: Record<string, string>) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error();
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...d.photo } : p)));
    } catch {
      setError(a.updateError);
    } finally {
      setBusy(null);
    }
  }

  const total = stats.byCountry.ghana + stats.byCountry.senegal;
  const select =
    'w-full border border-gold/25 bg-noir px-2 py-1.5 text-xs text-ivory outline-none focus:border-gold';

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ivory">{a.title}</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-luxe text-gold">
            {t.hero.bride} &amp; {t.hero.groom}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn-ghost">
            ← {a.back}
          </Link>
          <form action={logout}>
            <button type="submit" className="btn-ghost">
              {t.admin.logout}
            </button>
          </form>
        </div>
      </div>

      {/* Counts */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label={a.total} value={total} />
        <Stat label={t.country.ghana} value={stats.byCountry.ghana} />
        <Stat label={t.country.senegal} value={stats.byCountry.senegal} />
        <Stat label={a.uploaders} value={stats.uploaders} />
        <Stat label={a.hiddenCount} value={stats.hidden} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <p className="eyebrow">{a.perEvent}</p>
          <ul className="mt-3 space-y-1 text-sm text-ivory">
            {EVENTS.map((e) => (
              <li key={e} className="flex justify-between">
                <span className="text-ivory-dim">{g.events[e]}</span>
                <span>{stats.byEvent[e]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <p className="eyebrow">{a.topUploaders}</p>
          <ol className="mt-3 space-y-1 text-sm text-ivory">
            {stats.top.map((u, i) => (
              <li key={`${u.name}-${i}`} className="flex justify-between">
                <span className="text-ivory-dim">
                  {i + 1}. {u.name}
                </span>
                <span>{u.n}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Download all, per country, in parts of `partSize` photos */}
      <div className="card mt-4 p-4">
        <p className="eyebrow">{a.downloadAll}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COUNTRIES.flatMap((c) => {
            const parts = Math.ceil(stats.byCountry[c] / partSize);
            return Array.from({ length: parts }, (_, i) => (
              <a
                key={`${c}-${i}`}
                href={`/api/admin/photos/zip?country=${c}&part=${i + 1}`}
                className="btn-ghost px-4 py-2"
              >
                ⬇ {t.country[c]}
                {parts > 1 ? ` · ${a.part} ${i + 1}/${parts}` : ''}
              </a>
            ));
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="mt-8 flex gap-2">
        {[false, true].map((h) => (
          <button
            key={String(h)}
            type="button"
            onClick={() => {
              setHiddenOnly(h);
              void load(true, h);
            }}
            className={`border px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
              hiddenOnly === h ? 'border-gold bg-gold text-noir' : 'border-gold/25 text-ivory-dim'
            }`}
          >
            {h ? a.filterHidden : a.filterAll}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
      )}

      {photos.length === 0 ? (
        <p className="mt-10 text-ivory-dim">{a.noPhotos}</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {photos.map((p) => {
            const hidden = p.status === 'hidden';
            return (
              <div key={p.id} className={`card overflow-hidden ${busy === p.id ? 'opacity-50' : ''}`}>
                <a href={p.url} target="_blank" rel="noreferrer" className="relative block aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumb_url}
                    alt=""
                    loading="lazy"
                    className={`h-full w-full object-cover ${hidden ? 'opacity-30 grayscale' : ''}`}
                  />
                  {hidden && (
                    <span className="absolute left-2 top-2 bg-red-500/80 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white">
                      {a.hidden}
                    </span>
                  )}
                </a>
                <div className="space-y-2 p-2">
                  <p className="truncate text-xs text-ivory">{p.name}</p>
                  {p.caption && <p className="truncate text-[0.7rem] italic text-ivory-dim">{p.caption}</p>}
                  <select
                    className={select}
                    value={p.country}
                    disabled={busy === p.id}
                    onChange={(e) => void patch(p.id, { country: e.target.value })}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {t.country[c]}
                      </option>
                    ))}
                  </select>
                  <select
                    className={select}
                    value={p.event}
                    disabled={busy === p.id}
                    onChange={(e) => void patch(p.id, { event: e.target.value })}
                  >
                    {EVENTS.map((e) => (
                      <option key={e} value={e}>
                        {g.events[e]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy === p.id}
                    onClick={() => void patch(p.id, { status: hidden ? 'published' : 'hidden' })}
                    className={`w-full border px-2 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${
                      hidden ? 'border-gold text-gold' : 'border-red-400/40 text-red-200'
                    }`}
                  >
                    {hidden ? a.unhide : a.hide}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cursor && (
        <div className="mt-8 flex justify-center">
          <button type="button" className="btn-ghost" disabled={loading} onClick={() => void load(false)}>
            {a.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
