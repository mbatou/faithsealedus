# Augusta &amp; Georges — Bilingual Wedding Website

A mobile-first, bilingual (EN/FR) single-page wedding site for **Augusta &amp;
Georges** — one trip, two celebrations in the same week: **Accra, Ghana** 🇬🇭 on
**2 December 2026** and **Senegal** 🇸🇳 on **5 December 2026**. *Two homelands,
one union.*

Built with **Next.js (App Router)**, **Supabase**, **Tailwind CSS**, and
**Framer Motion** for slow, soft scroll reveals. The look is **black &amp; gold,
premium** — a near-black (`#0B0B0B`) canvas with raised `#161514` surface cards,
champagne-gold (`#C6A15B`) hairlines and accents, high-contrast Playfair Display
headings and a quiet Inter body. Editorial signatures: section index numerals,
a recurring **"union" mark** (two interlocked rings — two people, two countries),
a running marquee, and large photos framed by thin gold hairlines.

## Sections

Single-page scroll: **Hero → Our Story** (three movements) **→ The Week** (one
timeline, two acts — Accra & Senegal) **→ Us** (gallery, `next/image` from
Supabase Storage) **→ Our Witnesses → Travel &amp; Stay → RSVP → Countdown +
footer**, plus a password-gated **/admin** dashboard. Header **EN/FR** toggle
throughout.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000. The site renders fully with bundled placeholder
art even before Supabase is configured.

## Deploying to Vercel

The home page is **statically generated** (with hourly ISR), so it's served
straight from Vercel's CDN. If you saw a `404: NOT_FOUND`, check the project
settings — that error means Vercel served no output for `/`:

1. **Framework Preset** → *Next.js* (a `vercel.json` pins this too).
2. **Root Directory** → `./` (the repo root, where `package.json` lives). A
   wrong root is the most common cause of the 404.
3. **Production Branch** → the branch you actually push to. The default branch
   started empty, so point Vercel at `claude/bilingual-wedding-nextjs-3kyrw3`
   (or merge it into `main`) — otherwise the production URL has nothing to serve.
4. Add the environment variables below under **Settings → Environment
   Variables**, then redeploy. The site builds and renders without them (using
   placeholders), so a missing key won't 404 the page.
5. Open the failing deployment's **Build Logs** if it still fails — a red build
   there tells you exactly what broke.

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

`full_name`, `email`, `attending_ghana` (Accra, 2 Dec), `attending_senegal`
(Senegal, 4 Dec), `party_size`, `dietary_notes`, `message`, `created_at`.

Inserts go through the `POST /api/rsvp` route handler, which validates input,
drops bot submissions via a **honeypot** field, applies a **basic per-IP rate
limit** (5 / 10 min, in-memory — swap for Upstash/Redis to share across
instances), and confirms on screen with a note that an email confirmation
follows (wire up your email provider in `src/app/api/rsvp/route.ts`).

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

- **All copy (names, story, venues, witnesses, travel…)** → `src/lib/dictionary.ts`
  (the `TODO`/"to be confirmed" strings are the ones awaiting final details)
- **Couple photo** → replace `public/couple-placeholder.svg`
- **Gallery placeholders** → replace `public/gallery/*.svg` (or upload to the
  Supabase `gallery` bucket)
- **Colours (`--bg` noir / `--surface` / gold / ivory / muted) &amp; fonts** →
  `tailwind.config.ts` and `src/app/layout.tsx`

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
