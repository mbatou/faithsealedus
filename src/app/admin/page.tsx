import type { Metadata } from 'next';
import { isAuthed } from '@/lib/admin-auth';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard, type RsvpRow } from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin · RSVPs',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

async function fetchRsvps(): Promise<RsvpRow[]> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load RSVPs:', error.message);
    return [];
  }
  return (data as RsvpRow[]) ?? [];
}

export default async function AdminPage() {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-noir">
        <AdminLogin />
      </main>
    );
  }

  const rows = await fetchRsvps();

  return (
    <main className="min-h-screen bg-noir">
      <AdminDashboard rows={rows} />
    </main>
  );
}
