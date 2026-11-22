import 'server-only';
import { cookies } from 'next/headers';
import { del } from '@vercel/blob';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { ensureSchema } from './db';
import type { GalleryPhoto, PhotoCountry, PhotoEvent } from './photo-rules';

type Sql = NeonQueryFunction<false, false>;

export const GUEST_COOKIE = 'guest_id';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

/**
 * "Now" for every photo rule. NOW_OVERRIDE (an ISO date) lets you rehearse
 * 1 Dec / 4 Dec on a preview deployment. Remove it before going live.
 */
export function photoNow(): Date {
  const o = process.env.NOW_OVERRIDE;
  if (o) {
    const d = new Date(o);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Guest id from the httpOnly cookie, if it looks valid. */
export function cookieGuestId(): string | null {
  const v = cookies().get(GUEST_COOKIE)?.value;
  return isUuid(v) ? v : null;
}

let photoSchemaReady: Promise<void> | null = null;

export function ensurePhotoSchema(sql: Sql): Promise<void> {
  if (!photoSchemaReady) {
    photoSchemaReady = (async () => {
      await ensureSchema(sql);
      await sql`
        create table if not exists guests (
          id          uuid primary key default gen_random_uuid(),
          name        text not null check (length(name) between 1 and 60),
          created_at  timestamptz not null default now()
        )
      `;
      await sql`
        create table if not exists photos (
          id           uuid primary key default gen_random_uuid(),
          guest_id     uuid not null references guests(id),
          country      text not null check (country in ('ghana','senegal')),
          event        text not null default 'moments'
                       check (event in ('civil','traditional','dakar','moments')),
          status       text not null default 'pending'
                       check (status in ('pending','published','hidden','deleted')),
          storage_key  text not null,
          thumb_key    text not null,
          url          text,
          thumb_url    text,
          width        int,
          height       int,
          caption      text check (length(caption) <= 80),
          created_at   timestamptz not null default now(),
          updated_at   timestamptz not null default now()
        )
      `;
      // 'deleted' (files erased by the couple) arrived after the table was
      // first created: widen the check once, only if it isn't already.
      await sql`
        do $$ begin
          if not exists (
            select 1 from pg_constraint
            where conname = 'photos_status_check'
              and pg_get_constraintdef(oid) like '%deleted%'
          ) then
            alter table photos drop constraint if exists photos_status_check;
            alter table photos add constraint photos_status_check
              check (status in ('pending','published','hidden','deleted'));
          end if;
        end $$
      `;
      await sql`create index if not exists photos_guest_country_idx on photos (guest_id, country)`;
      await sql`create index if not exists photos_status_created_idx on photos (status, created_at desc)`;
      await sql`create index if not exists photos_updated_idx on photos (updated_at)`;
    })().catch((err) => {
      photoSchemaReady = null;
      throw err;
    });
  }
  return photoSchemaReady;
}

/**
 * Give abandoned slots back: pending rows older than 30 minutes are deleted,
 * along with any file that did reach storage. Runs on read, best-effort.
 */
export async function cleanupPending(sql: Sql): Promise<void> {
  const stale = (await sql`
    delete from photos
    where status = 'pending' and created_at < now() - interval '30 minutes'
    returning storage_key, thumb_key
  `) as { storage_key: string; thumb_key: string }[];
  if (stale.length && blobConfigured()) {
    const keys = stale.flatMap((r) => [r.storage_key, r.thumb_key]);
    await del(keys).catch((err) => console.error('Stale blob cleanup failed:', err));
  }
}

/**
 * Slots used per country: pending + published + hidden. Hidden photos still
 * count, so moderation doesn't hand a guest extra uploads.
 */
export async function usedSlots(sql: Sql, guestId: string): Promise<Record<PhotoCountry, number>> {
  const rows = (await sql`
    select country, count(*)::int as n from photos
    where guest_id = ${guestId}
    group by country
  `) as { country: PhotoCountry; n: number }[];
  const out: Record<PhotoCountry, number> = { ghana: 0, senegal: 0 };
  for (const r of rows) out[r.country] = r.n;
  return out;
}

export interface PhotoRow {
  id: string;
  url: string;
  thumb_url: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  country: PhotoCountry;
  event: PhotoEvent;
  status: string;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export function toGalleryPhoto(r: PhotoRow): GalleryPhoto {
  return {
    id: r.id,
    url: r.url,
    thumbUrl: r.thumb_url,
    width: r.width,
    height: r.height,
    caption: r.caption,
    country: r.country,
    event: r.event,
    name: r.name,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

/**
 * Visitors located in Ghana don't see the Senegal celebration anywhere on the
 * site (see src/middleware.ts), so their gallery is Ghana-only too.
 */
export function regionFromCountryHeader(country: string | null): 'all' | 'gh' {
  return country?.toUpperCase() === 'GH' ? 'gh' : 'all';
}
