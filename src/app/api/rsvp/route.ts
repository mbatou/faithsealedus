import { NextResponse } from 'next/server';
import { getSql, ensureSchema } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RsvpPayload {
  full_name?: string;
  email?: string;
  attending_ghana?: boolean;
  attending_senegal?: boolean;
  attending_exclusive?: boolean;
  access_code?: string;
  party_size?: number;
  dietary_notes?: string;
  message?: string;
  company?: string; // honeypot
}

function exclusiveCodeValid(code: string | undefined): boolean {
  const expected = process.env.EXCLUSIVE_ACCESS_CODE;
  if (!expected || !code) return false;
  return code.trim() === expected;
}

export async function POST(request: Request) {
  if (rateLimit(`rsvp:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: RsvpPayload;
  try {
    body = (await request.json()) as RsvpPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot: pretend success without persisting anything.
  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const fullName = (body.full_name ?? '').trim();
  const email = (body.email ?? '').trim();
  const attendingGhana = Boolean(body.attending_ghana);
  const attendingSenegal = Boolean(body.attending_senegal);
  // Only honour the private-ceremony RSVP when the code checks out server-side.
  const attendingExclusive =
    Boolean(body.attending_exclusive) && exclusiveCodeValid(body.access_code);

  if (!fullName) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (!attendingGhana && !attendingSenegal && !attendingExclusive) {
    return NextResponse.json({ error: 'no_attendance' }, { status: 400 });
  }

  const partySizeRaw = Number(body.party_size ?? 1);
  const partySize = Number.isFinite(partySizeRaw)
    ? Math.min(20, Math.max(1, Math.round(partySizeRaw)))
    : 1;

  const dietary = (body.dietary_notes ?? '').trim().slice(0, 500) || null;
  const message = (body.message ?? '').trim().slice(0, 1000) || null;

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    await ensureSchema(sql);
    await sql`
      insert into rsvps
        (full_name, email, attending_ghana, attending_senegal, attending_exclusive,
         party_size, dietary_notes, message)
      values
        (${fullName}, ${email}, ${attendingGhana}, ${attendingSenegal}, ${attendingExclusive},
         ${partySize}, ${dietary}, ${message})
    `;
  } catch (err) {
    console.error('RSVP insert failed:', err);
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
