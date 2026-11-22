import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { clientCountry } from '@/lib/geo';
import {
  ensurePhotoSchema,
  regionFromCountryHeader,
  toGalleryPhoto,
  type PhotoRow,
} from '@/lib/photos';
import { isCountry, isEvent } from '@/lib/photo-rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE = 40;
const CURSOR_AT_RE = /^\d{4}-\d{2}-\d{2}[ T][\d:.]+(Z|[+-]\d{2}(:?\d{2})?)$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Public gallery feed.
 *  - `?cursor=<iso>|<id>` → the next 40 published photos, newest first.
 *  - `?since=<iso>`       → everything changed since then (new, hidden,
 *    re-tagged), for the 30-second poll. Non-published rows come back as
 *    `removed` ids so hidden photos vanish from open galleries.
 * Visitors located in Ghana only ever get Ghana photos.
 */
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const sql = getSql();
  if (!sql) return NextResponse.json({ photos: [], nextCursor: null, serverTime: null }, { headers });

  const url = new URL(request.url);
  const ghOnly = regionFromCountryHeader(clientCountry(request)) === 'gh';
  const qCountry = url.searchParams.get('country');
  const qEvent = url.searchParams.get('event');
  const countryFilter = ghOnly ? 'ghana' : isCountry(qCountry) ? qCountry : null;
  const eventFilter = isEvent(qEvent) && !(ghOnly && qEvent === 'dakar') ? qEvent : null;

  try {
    await ensurePhotoSchema(sql);
    // Step back 10 s: a write whose transaction started just before this read
    // may commit just after it. Re-sending a few rows is harmless (upserts).
    const [{ now }] = (await sql`select now() - interval '10 seconds' as now`) as {
      now: string | Date;
    }[];
    const serverTime = new Date(now).toISOString();

    const since = url.searchParams.get('since');
    if (since && !Number.isNaN(Date.parse(since))) {
      const rows = (await sql`
        select p.id, p.url, p.thumb_url, p.width, p.height, p.caption, p.country,
               p.event, p.status, g.name, p.created_at, p.updated_at
        from photos p join guests g on g.id = p.guest_id
        where p.updated_at > ${since} and p.status <> 'pending'
        order by p.updated_at asc
        limit 500
      `) as PhotoRow[];
      const changed = [];
      const removed: string[] = [];
      for (const r of rows) {
        if (
          r.status === 'published' &&
          (!countryFilter || r.country === countryFilter) &&
          (!eventFilter || r.event === eventFilter)
        ) {
          changed.push(toGalleryPhoto(r));
        } else {
          removed.push(r.id);
        }
      }
      return NextResponse.json({ changed, removed, serverTime }, { headers });
    }

    const cursor = url.searchParams.get('cursor');
    let cAt: string | null = null;
    let cId: string | null = null;
    if (cursor) {
      const [at, id] = cursor.split('|');
      if (at && id && CURSOR_AT_RE.test(at) && UUID_RE.test(id)) {
        cAt = at;
        cId = id;
      }
    }

    const rows = (await sql`
      select p.id, p.url, p.thumb_url, p.width, p.height, p.caption, p.country,
             p.event, p.status, g.name, p.created_at, p.updated_at,
             p.created_at::text as cur
      from photos p join guests g on g.id = p.guest_id
      where p.status = 'published'
        and (${countryFilter}::text is null or p.country = ${countryFilter})
        and (${eventFilter}::text is null or p.event = ${eventFilter})
        and (${cAt}::timestamptz is null or (p.created_at, p.id) < (${cAt}::timestamptz, ${cId}::uuid))
      order by p.created_at desc, p.id desc
      limit ${PAGE + 1}
    `) as (PhotoRow & { cur: string })[];

    const page = rows.slice(0, PAGE);
    const last = page[page.length - 1];
    // Full microsecond precision, so photos sharing a millisecond aren't skipped.
    const nextCursor = rows.length > PAGE && last ? `${last.cur}|${last.id}` : null;
    return NextResponse.json({ photos: page.map(toGalleryPhoto), nextCursor, serverTime }, { headers });
  } catch (err) {
    console.error('photos feed failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers });
  }
}
