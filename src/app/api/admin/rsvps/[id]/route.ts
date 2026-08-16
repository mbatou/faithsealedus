import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin-auth';
import { getSql, ensureSchema } from '@/lib/db';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UpdatePayload {
  full_name?: string;
  email?: string;
  attending_ghana?: boolean;
  attending_senegal?: boolean;
  attending_exclusive?: boolean;
  party_size?: number;
  dietary_notes?: string | null;
  message?: string | null;
}

// Admin-only: edit a booking.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  let body: UpdatePayload;
  try {
    body = (await request.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const fullName = (body.full_name ?? '').trim();
  const email = (body.email ?? '').trim();
  if (!fullName) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const partyRaw = Number(body.party_size ?? 1);
  const partySize = Number.isFinite(partyRaw)
    ? Math.min(20, Math.max(1, Math.round(partyRaw)))
    : 1;
  const dietary = (body.dietary_notes ?? '')?.toString().trim().slice(0, 500) || null;
  const message = (body.message ?? '')?.toString().trim().slice(0, 1000) || null;

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    await ensureSchema(sql);
    const rows = await sql`
      update rsvps set
        full_name = ${fullName},
        email = ${email},
        attending_ghana = ${Boolean(body.attending_ghana)},
        attending_senegal = ${Boolean(body.attending_senegal)},
        attending_exclusive = ${Boolean(body.attending_exclusive)},
        party_size = ${partySize},
        dietary_notes = ${dietary},
        message = ${message}
      where id = ${params.id}
      returning *
    `;
    if (!rows.length) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, rsvp: rows[0] });
  } catch (err) {
    console.error('RSVP update failed:', err);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
}

// Admin-only: cancel (delete) a booking.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    await ensureSchema(sql);
    const rows = await sql`delete from rsvps where id = ${params.id} returning id`;
    if (!rows.length) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('RSVP delete failed:', err);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }
}
