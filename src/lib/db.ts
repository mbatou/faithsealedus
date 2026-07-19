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
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL;
  cached = url ? neon(url) : null;
  return cached;
}

// Auto-provision the schema on first use — no separate migration step. The
// statements are idempotent (IF NOT EXISTS) and the work is cached per warm
// instance so it runs at most once per cold start.
let schemaReady: Promise<void> | null = null;

export function ensureSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        create table if not exists rsvps (
          id                  uuid primary key default gen_random_uuid(),
          full_name           text        not null,
          email               text        not null,
          attending_ghana     boolean     not null default false,
          attending_senegal   boolean     not null default false,
          attending_exclusive boolean     not null default false,
          party_size          integer     not null default 1,
          dietary_notes       text,
          message             text,
          created_at          timestamptz not null default now()
        )
      `;
      // Backfill the exclusive column if an older rsvps table already exists.
      await sql`
        alter table rsvps
          add column if not exists attending_exclusive boolean not null default false
      `;
      await sql`
        create table if not exists prayers (
          id          uuid primary key default gen_random_uuid(),
          name        text,
          message     text        not null,
          created_at  timestamptz not null default now()
        )
      `;
      await sql`create index if not exists rsvps_created_at_idx on rsvps (created_at desc)`;
      await sql`create index if not exists prayers_created_at_idx on prayers (created_at desc)`;
    })().catch((err) => {
      // Allow a retry on the next request if provisioning failed.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
