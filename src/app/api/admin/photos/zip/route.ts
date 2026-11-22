import { NextResponse } from 'next/server';
import { downloadZip } from 'client-zip';
import { isAuthed } from '@/lib/admin-auth';
import { getSql } from '@/lib/db';
import { ensurePhotoSchema } from '@/lib/photos';
import { isCountry } from '@/lib/photo-rules';
import { ZIP_PART_SIZE } from '@/lib/admin-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;


function safe(s: string): string {
  return s.normalize('NFKD').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'guest';
}

/**
 * Admin: stream one part of a country's published photos as a zip. Files are
 * fetched from storage one at a time and piped straight into the archive
 * (stored, not re-compressed — JPEGs don't shrink), so memory stays flat.
 */
export async function GET(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const url = new URL(request.url);
  const country = url.searchParams.get('country');
  const part = Math.max(1, Number.parseInt(url.searchParams.get('part') ?? '1', 10) || 1);
  if (!isCountry(country)) return NextResponse.json({ error: 'invalid_country' }, { status: 400 });

  await ensurePhotoSchema(sql);
  const rows = (await sql`
    select p.id, p.url, p.event, p.created_at, g.name
    from photos p join guests g on g.id = p.guest_id
    where p.status = 'published' and p.country = ${country}
    order by p.created_at asc, p.id asc
    limit ${ZIP_PART_SIZE} offset ${(part - 1) * ZIP_PART_SIZE}
  `) as { id: string; url: string; event: string; created_at: string | Date; name: string }[];

  if (!rows.length) return NextResponse.json({ error: 'empty' }, { status: 404 });

  async function* files() {
    for (const r of rows) {
      const res = await fetch(r.url);
      if (!res.ok || !res.body) continue;
      const created = new Date(r.created_at);
      const stamp = created.toISOString().slice(0, 19).replace(/[T:]/g, '-');
      yield {
        name: `${r.event}/${stamp}_${safe(r.name)}_${r.id.slice(0, 8)}.jpg`,
        lastModified: created,
        input: res,
      };
    }
  }

  const zip = downloadZip(files());
  return new Response(zip.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="augusta-georges-${country}-part${part}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
