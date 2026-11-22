import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/admin-auth';
import { listAdminPhotos } from '@/lib/admin-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Admin: every photo (hidden included), newest first, 60 at a time. */
export async function GET(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  try {
    const data = await listAdminPhotos(
      url.searchParams.get('cursor'),
      url.searchParams.get('hidden') === '1',
    );
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('Admin photo list failed:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
