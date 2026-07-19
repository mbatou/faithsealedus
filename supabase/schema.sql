-- ===========================================================================
-- RSVP table for the wedding website.
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
-- ===========================================================================

create table if not exists public.rsvps (
  id                uuid primary key default gen_random_uuid(),
  full_name         text        not null,
  email             text        not null,
  attending_ghana   boolean     not null default false,
  attending_senegal boolean     not null default false,
  party_size        integer     not null default 1 check (party_size >= 1 and party_size <= 20),
  dietary_notes     text,
  message           text,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- The RSVP form is open (no login), so anonymous visitors may INSERT.
-- Nobody may SELECT/UPDATE/DELETE with the anon key — the /admin dashboard
-- reads rows using the service-role key on the server instead.
-- ---------------------------------------------------------------------------
alter table public.rsvps enable row level security;

drop policy if exists "Anyone can submit an RSVP" on public.rsvps;
create policy "Anyone can submit an RSVP"
  on public.rsvps
  for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for the photo gallery (public read).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;
