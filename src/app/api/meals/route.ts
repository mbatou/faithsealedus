import { NextResponse } from 'next/server';
import { getSql, ensureSchema } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { isMealId } from '@/lib/meals';

export const runtime = 'nodejs';

interface MealPayload {
  full_name?: string;
  meal?: string;
  allergies?: string;
  company?: string; // honeypot
}

export async function POST(request: Request) {
  if (rateLimit(`meal:${clientIp(request)}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: MealPayload;
  try {
    body = (await request.json()) as MealPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot: pretend success without persisting anything.
  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const fullName = (body.full_name ?? '').trim().slice(0, 120);
  if (!fullName) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }
  if (!isMealId(body.meal)) {
    return NextResponse.json({ error: 'invalid_meal' }, { status: 400 });
  }
  const allergies = (body.allergies ?? '').trim().slice(0, 500) || null;

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    await ensureSchema(sql);
    await sql`
      insert into meal_choices (full_name, meal, allergies)
      values (${fullName}, ${body.meal}, ${allergies})
    `;
  } catch (err) {
    console.error('Meal choice insert failed:', err);
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
