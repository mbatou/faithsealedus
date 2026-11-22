import 'server-only';
import { getSql } from './db';
import { ensurePhotoSchema } from './photos';

/** Photos per admin zip. ~100 × 1.2 MB ≈ 120 MB keeps each download well inside a function's time limit. */
export const ZIP_PART_SIZE = 100;

const PAGE = 60;


export interface AdminPhoto {
  id: string;
  url: string;
  thumb_url: string;
  caption: string | null;
  country: string;
  event: string;
  status: string;
  name: string;
  created_at: string;
  cur: string;
}

export async function listAdminPhotos(cursor: string | null, hiddenOnly: boolean) {
  const sql = getSql();
  if (!sql) return { photos: [] as AdminPhoto[], nextCursor: null as string | null };
  await ensurePhotoSchema(sql);
  let cAt: string | null = null;
  let cId: string | null = null;
  if (cursor) {
    const [at, id] = cursor.split('|');
    if (at && /^[0-9a-f-]{36}$/i.test(id ?? '')) {
      cAt = at;
      cId = id;
    }
  }
  const rows = (await sql`
    select p.id, p.url, p.thumb_url, p.caption, p.country, p.event, p.status, g.name,
           p.created_at, p.created_at::text as cur
    from photos p join guests g on g.id = p.guest_id
    where p.status not in ('pending', 'deleted')
      and (${hiddenOnly} = false or p.status = 'hidden')
      and (${cAt}::timestamptz is null or (p.created_at, p.id) < (${cAt}::timestamptz, ${cId}::uuid))
    order by p.created_at desc, p.id desc
    limit ${PAGE + 1}
  `) as AdminPhoto[];
  const page = rows.slice(0, PAGE);
  const last = page[page.length - 1];
  return {
    photos: page,
    nextCursor: rows.length > PAGE && last ? `${last.cur}|${last.id}` : null,
  };
}

