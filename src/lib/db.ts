import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Neon serverless Postgres client (HTTP driver — ideal for Vercel functions).
 *
 * Returns a tagged-template `sql` function, or `null` when no connection
 * string is configured so the site still builds/renders before the database
 * is wired up. Vercel's Neon integration provides `DATABASE_URL`.
 */
// Connection-string env vars, in priority order. Different Vercel/Neon
// integrations expose different names, so we accept the common ones.
const URL_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  // Vercel integrations with a custom prefix (e.g. "STORAGE").
  'STORAGE_URL',
  'STORAGE_DATABASE_URL',
  'STORAGE_POSTGRES_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'STORAGE_DATABASE_URL_UNPOOLED',
  'POSTGRES_PRISMA_URL',
  'NEON_DATABASE_URL',
];

const PG_URL_RE = /^postgres(ql)?:\/\//i;

function findUrl(): { name: string; url: string } | null {
  // 1. Known variable names, in priority order.
  for (const name of URL_VARS) {
    const url = process.env[name];
    if (url) return { name, url };
  }
  // 2. Fallback: any env var whose VALUE looks like a Postgres connection
  //    string, whatever the integration named it (e.g. a project-name prefix
  //    like `faithsealedus_DATABASE_URL`). Score names to prefer a pooled,
  //    standard, SSL connection string.
  const candidates = Object.entries(process.env).filter(
    ([, v]) => v && PG_URL_RE.test(v),
  ) as [string, string][];
  if (candidates.length) {
    const score = (n: string): number => {
      const u = n.toUpperCase();
      if (/UNPOOL|NON_POOL/.test(u)) return -2; // avoid unpooled
      if (/NO_SSL|PRISMA/.test(u)) return -1; // avoid odd variants
      if (u.endsWith('DATABASE_URL')) return 3;
      if (u.endsWith('POSTGRES_URL')) return 2;
      return 1;
    };
    candidates.sort((a, b) => score(b[0]) - score(a[0]));
    const [name, url] = candidates[0];
    return { name, url };
  }
  return null;
}

/** Name of the env var the connection string was read from (for diagnostics). */
export function dbEnvVarName(): string | null {
  return findUrl()?.name ?? null;
}

/** Names of any recognised connection-string env vars that are set. */
export function presentDbVars(): string[] {
  return URL_VARS.filter((n) => Boolean(process.env[n]));
}

/**
 * Names (never values) of env vars that look database-related — matched either
 * by a Postgres-ish key name or by a value that is a Postgres URL. Helps
 * identify what a Vercel integration actually injected.
 */
export function dbLikeEnvKeys(): string[] {
  const keyRe = /(DATABASE|POSTGRES|NEON|^PG|_PG|PGHOST|PGDATABASE)/i;
  return Object.entries(process.env)
    .filter(([k, v]) => keyRe.test(k) || (v ? PG_URL_RE.test(v) : false))
    .map(([k]) => k)
    .sort();
}

let cached: NeonQueryFunction<false, false> | null | undefined;

export function getSql(): NeonQueryFunction<false, false> | null {
  if (cached !== undefined) return cached;
  const found = findUrl();
  cached = found ? neon(found.url) : null;
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
