import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin-auth';
import { getSql, ensureSchema } from '@/lib/db';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Admin-only: remove a prayer from the public wall (moderation).
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
    const rows = await sql`delete from prayers where id = ${params.id} returning id`;
    if (!rows.length) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Prayer delete failed:', err);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }
}
