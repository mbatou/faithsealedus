import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Neon serverless Postgres client (HTTP driver — ideal for Vercel functions).
 *
 * Returns a tagged-template `sql` function, or `null` when no connection
 * string is configured so the site still builds/renders before the database
 * is wired up. Vercel's Neon integration provides `DATABASE_URL`.
 */
let cached: NeonQueryFunction<false, false> | null | undefined;

export function getSql(): NeonQueryFunction<false, false> | null {
  if (cached !== undefined) return cached;
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL;
  cached = url ? neon(url) : null;
  return cached;
}
