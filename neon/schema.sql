-- ===========================================================================
-- Neon Postgres schema for the wedding site.
--
-- OPTIONAL: the app auto-provisions these tables on first use (see
-- ensureSchema in src/lib/db.ts), so you normally don't need to run this.
-- Kept here for reference, or if you prefer to create the tables by hand:
--   psql "$DATABASE_URL" -f neon/schema.sql
-- ===========================================================================

create table if not exists rsvps (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text        not null,
  email               text        not null,
  attending_ghana     boolean     not null default false,   -- Accra, 2 Dec
  attending_senegal   boolean     not null default false,   -- Dakar, 5 Dec
  attending_exclusive boolean     not null default false,   -- private ceremony, 5 Dec eve
  party_size          integer     not null default 1 check (party_size >= 1 and party_size <= 20),
  dietary_notes       text,
  message             text,
  created_at          timestamptz not null default now()
);

-- A wall of blessings guests leave ahead of the ceremonies.
create table if not exists prayers (
  id          uuid primary key default gen_random_uuid(),
  name        text,                       -- optional signature
  message     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists prayers_created_at_idx on prayers (created_at desc);
create index if not exists rsvps_created_at_idx on rsvps (created_at desc);
