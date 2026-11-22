import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { copy, del } from '@vercel/blob';
import { isAuthed } from '@/lib/admin-auth';
import { getSql } from '@/lib/db';
import { blobConfigured, ensurePhotoSchema, isUuid } from '@/lib/photos';
import { isCountry, isEvent } from '@/lib/photo-rules';

export const runtime = 'nodejs';

interface Row {
  id: string;
  status: string;
  country: string;
  storage_key: string;
  thumb_key: string;
}

/**
 * Move a photo's two files to fresh, unguessable paths and delete the old
 * ones, so any saved link to a hidden photo stops working (and unhiding
 * doesn't resurrect the old link either).
 */
async function moveFiles(row: Row, prefix: string) {
  const rand = randomBytes(9).toString('base64url');
  const fullPath = `${prefix}/${row.id}-${rand}.jpg`;
  const thumbPath = `${prefix}/${row.id}-${rand}-t.jpg`;
  const opts = {
    access: 'public' as const,
    addRandomSuffix: false,
    contentType: 'image/jpeg',
    cacheControlMaxAge: 60 * 60 * 24,
  };
  const [full, thumb] = await Promise.all([
    copy(row.storage_key, fullPath, opts),
    copy(row.thumb_key, thumbPath, opts),
  ]);
  await del([row.storage_key, row.thumb_key]);
  return { fullPath, thumbPath, url: full.url, thumbUrl: thumb.url };
}

/** Admin: hide / unhide a photo, or change its country / event. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isUuid(params.id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  const sql = getSql();
  if (!sql || !blobConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: unknown;
    country?: unknown;
    event?: unknown;
  };

  try {
    await ensurePhotoSchema(sql);
    const rows = (await sql`
      select id, status, country, storage_key, thumb_key from photos where id = ${params.id}
    `) as Row[];
    if (!rows.length) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const row = rows[0];

    if (isCountry(body.country)) {
      await sql`update photos set country = ${body.country}, updated_at = now() where id = ${row.id}`;
    }
    if (isEvent(body.event)) {
      await sql`update photos set event = ${body.event}, updated_at = now() where id = ${row.id}`;
    }

    const wantHidden = body.status === 'hidden' && row.status === 'published';
    const wantShown = body.status === 'published' && row.status === 'hidden';
    if (wantHidden || wantShown) {
      // Flip the status first so the gallery drops it immediately, then move.
      const next = wantHidden ? 'hidden' : 'published';
      const moved = await moveFiles(row, wantHidden ? 'hidden' : `guests/${row.country}`);
      await sql`
        update photos
        set status = ${next}, storage_key = ${moved.fullPath}, thumb_key = ${moved.thumbPath},
            url = ${moved.url}, thumb_url = ${moved.thumbUrl}, updated_at = now()
        where id = ${row.id}
      `;
    }

    const [updated] = await sql`
      select id, status, country, event, url, thumb_url from photos where id = ${row.id}
    `;
    return NextResponse.json({ ok: true, photo: updated });
  } catch (err) {
    console.error('Admin photo update failed:', err);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
}
