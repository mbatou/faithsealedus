import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Validates the private-ceremony invitation code. Returns { ok: true } when it
// matches; the ceremony details themselves live client-side and are only
// revealed after a match.
export async function POST(request: Request) {
  if (rateLimit(`access:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let code = '';
  try {
    const body = (await request.json()) as { code?: string };
    code = (body.code ?? '').trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const expected = process.env.EXCLUSIVE_ACCESS_CODE;
  const ok = Boolean(expected) && code === expected;

  return NextResponse.json({ ok });
}
