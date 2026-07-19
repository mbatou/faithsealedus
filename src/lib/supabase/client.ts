import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser / anon Supabase client.
 *
 * Returns `null` when the public environment variables are missing so that
 * the site still renders (and builds) before Supabase has been wired up.
 * Callers should handle the null case gracefully.
 */
export function getSupabaseAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

export const GALLERY_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET || 'gallery';
