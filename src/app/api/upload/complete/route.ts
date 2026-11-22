import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { getSql } from '@/lib/db';
import { cookieGuestId, ensurePhotoSchema, isUuid } from '@/lib/photos';
import { CAPTION_MAX } from '@/lib/photo-rules';

export const runtime = 'nodejs';

function cleanCaption(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const c = v.trim().replace(/\s+/g, ' ').slice(0, CAPTION_MAX);
  return c.length ? c : null;
}

/**
 * The phone finished uploading both files: check they really exist in storage,
 * then publish. Idempotent — completing an already-published photo is a no-op.
 * Returns `expired` when the pending slot was cleaned up, so the client asks
 * for a fresh slot and uploads again.
 */
export async function POST(request: Request) {
  const guestId = cookieGuestId();
  if (!guestId) return NextResponse.json({ error: 'no_guest' }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as {
    photoId?: unknown;
    caption?: unknown;
  };
  if (!isUuid(body.photoId)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const caption = cleanCaption(body.caption);

  try {
    await ensurePhotoSchema(sql);
    const rows = (await sql`
      select id, status, storage_key, thumb_key from photos
      where id = ${body.photoId} and guest_id = ${guestId}
    `) as { id: string; status: string; storage_key: string; thumb_key: string }[];
    if (!rows.length) return NextResponse.json({ error: 'expired' }, { status: 410 });
    const row = rows[0];
    if (row.status !== 'pending') return NextResponse.json({ ok: true });

    let full, thumb;
    try {
      [full, thumb] = await Promise.all([head(row.storage_key), head(row.thumb_key)]);
    } catch {
      return NextResponse.json({ error: 'missing_file' }, { status: 409 });
    }

    await sql`
      update photos
      set status = 'published', url = ${full.url}, thumb_url = ${thumb.url},
          caption = ${caption}, updated_at = now()
      where id = ${row.id} and status = 'pending'
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('upload/complete failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

/** Edit the caption of one of your own photos after it was published. */
export async function PATCH(request: Request) {
  const guestId = cookieGuestId();
  if (!guestId) return NextResponse.json({ error: 'no_guest' }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as {
    photoId?: unknown;
    caption?: unknown;
  };
  if (!isUuid(body.photoId)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  try {
    await ensurePhotoSchema(sql);
    await sql`
      update photos set caption = ${cleanCaption(body.caption)}, updated_at = now()
      where id = ${body.photoId} and guest_id = ${guestId}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('caption update failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
