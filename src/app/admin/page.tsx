import type { Metadata } from 'next';
import { isAuthed } from '@/lib/admin-auth';
import { getSql } from '@/lib/db';
import { AdminLogin } from './AdminLogin';
import {
  AdminDashboard,
  type RsvpRow,
  type PrayerRow,
} from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin · RSVPs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

async function fetchData(): Promise<{ rows: RsvpRow[]; prayers: PrayerRow[] }> {
  const sql = getSql();
  if (!sql) return { rows: [], prayers: [] };

  try {
    const [rowsRaw, prayersRaw] = await Promise.all([
      sql`select * from rsvps order by created_at desc`,
      sql`select id, name, message, created_at from prayers order by created_at desc`,
    ]);
    return {
      rows: rowsRaw as RsvpRow[],
      prayers: prayersRaw as PrayerRow[],
    };
  } catch (err) {
    console.error('Admin data load failed:', err);
    return { rows: [], prayers: [] };
  }
}

export default async function AdminPage() {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-noir">
        <AdminLogin />
      </main>
    );
  }

  const { rows, prayers } = await fetchData();

  return (
    <main className="min-h-screen bg-noir">
      <AdminDashboard rows={rows} prayers={prayers} />
    </main>
  );
}
