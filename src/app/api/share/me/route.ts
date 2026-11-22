import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { clientCountry } from '@/lib/geo';
import {
  blobConfigured,
  cleanupPending,
  cookieGuestId,
  ensurePhotoSchema,
  photoNow,
  regionFromCountryHeader,
  usedSlots,
} from '@/lib/photos';
import { PHOTO_CAP, countryFor, eventFor } from '@/lib/photo-rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Everything the share page needs: who you are, where we are, slots left. */
export async function GET(request: Request) {
  const now = photoNow();
  const base = {
    country: countryFor(now),
    event: eventFor(now),
    cap: PHOTO_CAP,
    region: regionFromCountryHeader(clientCountry(request)),
    configured: Boolean(getSql()) && blobConfigured(),
  };
  const headers = { 'Cache-Control': 'private, no-store' };

  const sql = getSql();
  const guestId = cookieGuestId();
  if (!sql || !guestId) {
    return NextResponse.json({ ...base, guest: null, used: { ghana: 0, senegal: 0 } }, { headers });
  }

  try {
    await ensurePhotoSchema(sql);
    await cleanupPending(sql);
    const rows = (await sql`select id, name from guests where id = ${guestId}`) as {
      id: string;
      name: string;
    }[];
    if (!rows.length) {
      return NextResponse.json({ ...base, guest: null, used: { ghana: 0, senegal: 0 } }, { headers });
    }
    const used = await usedSlots(sql, guestId);
    return NextResponse.json({ ...base, guest: { name: rows[0].name }, used }, { headers });
  } catch (err) {
    console.error('share/me failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers });
  }
}
