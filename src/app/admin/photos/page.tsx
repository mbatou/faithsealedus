import type { Metadata } from 'next';
import { isAuthed } from '@/lib/admin-auth';
import { getSql } from '@/lib/db';
import { ensurePhotoSchema } from '@/lib/photos';
import { ZIP_PART_SIZE, listAdminPhotos } from '@/lib/admin-photos';
import { AdminLogin } from '../AdminLogin';
import { AdminPhotos, type PhotoStats } from './AdminPhotos';

export const metadata: Metadata = {
  title: 'Admin · Guest photos',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const EMPTY: PhotoStats = {
  byCountry: { ghana: 0, senegal: 0 },
  byEvent: { civil: 0, traditional: 0, dakar: 0, moments: 0 },
  hidden: 0,
  uploaders: 0,
  top: [],
};

async function loadStats(): Promise<PhotoStats> {
  const sql = getSql();
  if (!sql) return EMPTY;
  await ensurePhotoSchema(sql);
  const [byCountry, byEvent, hidden, uploaders, top] = await Promise.all([
    sql`select country as k, count(*)::int as n from photos where status = 'published' group by country`,
    sql`select event as k, count(*)::int as n from photos where status = 'published' group by event`,
    sql`select count(*)::int as n from photos where status = 'hidden'`,
    sql`select count(distinct guest_id)::int as n from photos where status <> 'pending'`,
    sql`
      select g.name, count(*)::int as n from photos p join guests g on g.id = p.guest_id
      where p.status <> 'pending' group by g.id, g.name order by n desc limit 8
    `,
  ]);
  const stats: PhotoStats = structuredClone(EMPTY);
  for (const r of byCountry as { k: string; n: number }[]) {
    if (r.k in stats.byCountry) stats.byCountry[r.k as 'ghana' | 'senegal'] = r.n;
  }
  for (const r of byEvent as { k: string; n: number }[]) {
    if (r.k in stats.byEvent) stats.byEvent[r.k as keyof PhotoStats['byEvent']] = r.n;
  }
  stats.hidden = (hidden[0] as { n: number }).n;
  stats.uploaders = (uploaders[0] as { n: number }).n;
  stats.top = top as { name: string; n: number }[];
  return stats;
}

export default async function AdminPhotosPage() {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-noir">
        <AdminLogin />
      </main>
    );
  }

  let stats = EMPTY;
  let initial: Awaited<ReturnType<typeof listAdminPhotos>> = { photos: [], nextCursor: null };
  try {
    [stats, initial] = await Promise.all([loadStats(), listAdminPhotos(null, false)]);
  } catch (err) {
    console.error('Admin photos load failed:', err);
  }

  return (
    <main className="min-h-screen bg-noir">
      <AdminPhotos stats={stats} initial={initial} partSize={ZIP_PART_SIZE} />
    </main>
  );
}
