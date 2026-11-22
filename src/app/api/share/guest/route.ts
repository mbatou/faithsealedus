import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { GUEST_COOKIE, ensurePhotoSchema } from '@/lib/photos';
import { GUEST_NAME_MAX } from '@/lib/photo-rules';

export const runtime = 'nodejs';

/** First visit: store the guest's name and remember them for a year. */
export async function POST(request: Request) {
  if (rateLimit(`guest:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as { name?: unknown };
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  if (name.length < 1 || name.length > GUEST_NAME_MAX) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }

  const sql = getSql();
  if (!sql) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  try {
    await ensurePhotoSchema(sql);
    const rows = (await sql`insert into guests (name) values (${name}) returning id`) as {
      id: string;
    }[];
    const res = NextResponse.json({ ok: true, guest: { name } });
    res.cookies.set(GUEST_COOKIE, rows[0].id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch (err) {
    console.error('Guest create failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
