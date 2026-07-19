import { NextResponse } from 'next/server';
import { getSql, ensureSchema } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PrayerRow {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
}

// GET — the wall of prayers (most recent first).
export async function GET() {
  const sql = getSql();
  if (!sql) return NextResponse.json({ prayers: [] });

  try {
    await ensureSchema(sql);
    const rows = (await sql`
      select id, name, message, created_at
      from prayers
      order by created_at desc
      limit 200
    `) as PrayerRow[];
    return NextResponse.json({ prayers: rows });
  } catch (err) {
    console.error('Prayers fetch failed:', err);
    return NextResponse.json({ prayers: [] });
  }
}

interface PrayerPayload {
  name?: string;
  message?: string;
  company?: string; // honeypot
}

// POST — add a prayer to the wall.
export async function POST(request: Request) {
  if (rateLimit(`prayer:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: PrayerPayload;
  try {
    body = (await request.json()) as PrayerPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const message = (body.message ?? '').trim().slice(0, 280);
  const name = (body.name ?? '').trim().slice(0, 60) || null;

  if (message.length < 2) {
    return NextResponse.json({ error: 'invalid_message' }, { status: 400 });
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    await ensureSchema(sql);
    const rows = (await sql`
      insert into prayers (name, message)
      values (${name}, ${message})
      returning id, name, message, created_at
    `) as PrayerRow[];
    return NextResponse.json({ ok: true, prayer: rows[0] });
  } catch (err) {
    console.error('Prayer insert failed:', err);
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }
}
