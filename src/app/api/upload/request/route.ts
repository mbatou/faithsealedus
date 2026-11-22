import { NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { getSql } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import {
  blobConfigured,
  cleanupPending,
  cookieGuestId,
  ensurePhotoSchema,
  photoNow,
} from '@/lib/photos';
import { PHOTO_CAP, countryFor, eventFor } from '@/lib/photo-rules';

export const runtime = 'nodejs';

const MAX_FULL_BYTES = 4 * 1024 * 1024; // compressed photos target ≤ 1.2 MB
const MAX_THUMB_BYTES = 1024 * 1024;
// Shorter than the 30-minute pending cleanup, so no upload can still be
// writing a file when its slot is reclaimed.
const TOKEN_TTL_MS = 25 * 60 * 1000;

function dim(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 20000 ? n : null;
}

/**
 * Reserve upload slots. Counts the guest's photos for the current country
 * (pending included) and grants at most what's left of the 15, atomically:
 * an advisory lock on the guest serialises concurrent requests, so 15 parallel
 * calls can't overshoot the cap. Returns short-lived, path-locked client
 * tokens so the files go straight from the phone to Vercel Blob.
 */
export async function POST(request: Request) {
  if (rateLimit(`upreq:${clientIp(request)}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const guestId = cookieGuestId();
  if (!guestId) return NextResponse.json({ error: 'no_guest' }, { status: 401 });

  const sql = getSql();
  if (!sql || !blobConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { items?: unknown };
  const items = Array.isArray(body.items) ? body.items.slice(0, PHOTO_CAP) : [];
  if (!items.length) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });

  const now = photoNow();
  const country = countryFor(now);
  const event = eventFor(now);

  try {
    await ensurePhotoSchema(sql);
    await cleanupPending(sql);

    const guest = await sql`select 1 from guests where id = ${guestId}`;
    if (!guest.length) return NextResponse.json({ error: 'no_guest' }, { status: 401 });

    const ids: string[] = [];
    const keys: string[] = [];
    const thumbs: string[] = [];
    const widths: (number | null)[] = [];
    const heights: (number | null)[] = [];
    for (const raw of items) {
      const it = (raw ?? {}) as { width?: unknown; height?: unknown };
      const id = randomUUID();
      const rand = randomBytes(9).toString('base64url');
      ids.push(id);
      keys.push(`guests/${country}/${id}-${rand}.jpg`);
      thumbs.push(`guests/${country}/${id}-${rand}-t.jpg`);
      widths.push(dim(it.width));
      heights.push(dim(it.height));
    }

    const [, inserted] = await sql.transaction([
      sql`select pg_advisory_xact_lock(hashtext(${guestId}))`,
      sql`
        insert into photos (id, guest_id, country, event, status, storage_key, thumb_key, width, height)
        select u.id, ${guestId}::uuid, ${country}, ${event}, 'pending', u.sk, u.tk, u.w, u.h
        from unnest(${ids}::uuid[], ${keys}::text[], ${thumbs}::text[], ${widths}::int[], ${heights}::int[])
             with ordinality as u(id, sk, tk, w, h, ord)
        where u.ord <= ${PHOTO_CAP} - (
          select count(*) from photos where guest_id = ${guestId}::uuid and country = ${country}
        )
        returning id, storage_key, thumb_key
      `,
    ]);
    const rows = inserted as { id: string; storage_key: string; thumb_key: string }[];

    const validUntil = Date.now() + TOKEN_TTL_MS;
    const common = {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowedContentTypes: ['image/jpeg'],
      validUntil,
      addRandomSuffix: false,
      allowOverwrite: true, // a retried upload may rewrite the same file
      cacheControlMaxAge: 60 * 60 * 24,
    };
    const granted = await Promise.all(
      rows.map(async (r) => ({
        photoId: r.id,
        pathname: r.storage_key,
        thumbPathname: r.thumb_key,
        token: await generateClientTokenFromReadWriteToken({
          ...common,
          pathname: r.storage_key,
          maximumSizeInBytes: MAX_FULL_BYTES,
        }),
        thumbToken: await generateClientTokenFromReadWriteToken({
          ...common,
          pathname: r.thumb_key,
          maximumSizeInBytes: MAX_THUMB_BYTES,
        }),
        validUntil,
      })),
    );

    return NextResponse.json({
      ok: true,
      country,
      granted,
      refused: items.length - granted.length,
    });
  } catch (err) {
    console.error('upload/request failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
