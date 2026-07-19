import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service-role key.
 *
 * This bypasses Row Level Security and must ONLY ever be imported from
 * server code (route handlers, server actions, server components). The
 * `server-only` import above will fail the build if it leaks into a client
 * bundle.
 *
 * Returns `null` when the required environment variables are missing.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
