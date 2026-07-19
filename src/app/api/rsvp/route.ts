import { NextResponse } from 'next/server';
import { getSupabaseAnonClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RsvpPayload {
  full_name?: string;
  email?: string;
  attending_ghana?: boolean;
  attending_senegal?: boolean;
  party_size?: number;
  dietary_notes?: string;
  message?: string;
  // Honeypot — must stay empty. Bots tend to fill every field.
  company?: string;
}

// ---------------------------------------------------------------------------
// Basic per-IP rate limit (in-memory). Enough to blunt casual abuse; on a
// serverless platform each instance keeps its own window, which is acceptable
// for a low-traffic RSVP form. Swap for Upstash/Redis if you need it shared.
// ---------------------------------------------------------------------------
const RATE_LIMIT = 5; // max submissions
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((ts: number) => now - ts < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const key of Array.from(hits.keys())) {
      const times = hits.get(key) ?? [];
      if (times.every((ts: number) => now - ts >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: RsvpPayload;
  try {
    body = (await request.json()) as RsvpPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // --- Honeypot: pretend success without persisting anything. ---------------
  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  // --- Validation -----------------------------------------------------------
  const fullName = (body.full_name ?? '').trim();
  const email = (body.email ?? '').trim();
  const attendingGhana = Boolean(body.attending_ghana);
  const attendingSenegal = Boolean(body.attending_senegal);

  if (!fullName) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (!attendingGhana && !attendingSenegal) {
    return NextResponse.json({ error: 'no_attendance' }, { status: 400 });
  }

  const partySizeRaw = Number(body.party_size ?? 1);
  const partySize = Number.isFinite(partySizeRaw)
    ? Math.min(20, Math.max(1, Math.round(partySizeRaw)))
    : 1;

  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const { error } = await supabase.from('rsvps').insert({
    full_name: fullName,
    email,
    attending_ghana: attendingGhana,
    attending_senegal: attendingSenegal,
    party_size: partySize,
    dietary_notes: (body.dietary_notes ?? '').trim() || null,
    message: (body.message ?? '').trim() || null,
  });

  if (error) {
    console.error('RSVP insert failed:', error.message);
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }

  // NOTE: A confirmation email would be sent here via your provider of choice
  // (Resend, Supabase Edge Function, SendGrid…). The UI confirms on screen and
  // tells the guest to expect an email at the address they submitted.
  return NextResponse.json({ ok: true });
}
