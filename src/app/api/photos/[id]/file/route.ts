import { getSql } from '@/lib/db';
import { ensurePhotoSchema, isUuid } from '@/lib/photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * A published photo's file, served from this site's own origin so the phone
 * can draw it into a canvas for the framed keepsake download (no cross-origin
 * canvas tainting). Hidden or unknown photos are a 404.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isUuid(params.id)) return new Response('Not found', { status: 404 });
  const sql = getSql();
  if (!sql) return new Response('Not found', { status: 404 });
  try {
    await ensurePhotoSchema(sql);
    const rows = (await sql`
      select url from photos where id = ${params.id} and status = 'published'
    `) as { url: string }[];
    if (!rows.length) return new Response('Not found', { status: 404 });
    const upstream = await fetch(rows[0].url);
    if (!upstream.ok || !upstream.body) return new Response('Not found', { status: 404 });
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'image/jpeg',
        // Short: a photo hidden by the couple should stop being served soon.
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (err) {
    console.error('photo file proxy failed:', err);
    return new Response('Error', { status: 500 });
  }
}
