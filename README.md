# Faith &amp; Georges — Bilingual Wedding Website 💛

A mobile-first, bilingual (EN/FR) single-page wedding site for a celebration
that spans **two countries in one week** — a traditional ceremony in **Accra,
Ghana** 🇬🇭 and a celebration in **Dakar, Senegal** 🇸🇳.

Built with **Next.js (App Router)**, **Supabase**, **Tailwind CSS**, and
**Framer Motion** for tasteful scroll animations. The palette is drawn from
Ghanaian Kente and Senegalese indigo textile traditions.

## Sections

Single-page scroll: **Hero → Our Story → The Week** (a visual timeline of both
celebrations with venue, time, dress code, map & cultural notes) **→ Photo
Gallery** (`next/image`, Supabase Storage) **→ Travel &amp; Stay → Countdown →
RSVP**, plus a password-gated **/admin** dashboard.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000. The site renders fully with bundled placeholder
art even before Supabase is configured.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor. This
   creates the `rsvps` table (with RLS allowing anonymous inserts only) and a
   public `gallery` Storage bucket.
3. Copy your keys from **Project Settings → API** into `.env.local`:

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL (browser + server) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key — used to insert RSVPs |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only — lets `/admin` read every RSVP |
   | `NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET` | Storage bucket name (default `gallery`) |
   | `ADMIN_PASSWORD` | Password for the `/admin` dashboard |

4. Upload photos to the `gallery` bucket — they replace the placeholders
   automatically.

### RSVP data model (`rsvps`)

`name`, `email`, `attending_ghana`, `attending_senegal`, `party_size`,
`dietary_notes`, `message`, `created_at`.

Inserts go through the `POST /api/rsvp` route handler, which validates input,
drops bot submissions via a **honeypot** field, and confirms on screen with a
note that an email confirmation follows (wire up your email provider in
`src/app/api/rsvp/route.ts`).

## Admin

Visit **`/admin`** and enter `ADMIN_PASSWORD`. You get response totals,
per-country attendance, guest counts, the full RSVP table, and a **CSV export**
button. Auth is a signed, http-only cookie derived from the password — the
password itself is never stored in the cookie.

## Internationalisation

All copy lives in a single typed dictionary
([`src/lib/dictionary.ts`](./src/lib/dictionary.ts)) exposed through a React
context ([`src/context/LanguageContext.tsx`](./src/context/LanguageContext.tsx)).
The header toggle switches EN/FR instantly and remembers the choice
(`localStorage` + browser-language detection).

## Customising

- **Names, dates, venues, cultural notes** → `src/lib/dictionary.ts`
- **Couple photo** → replace `public/couple-placeholder.svg`
- **Colours &amp; fonts** → `tailwind.config.ts` and `src/app/layout.tsx`

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
