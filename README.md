# Augusta &amp; Georges — Bilingual Wedding Website

A mobile-first, bilingual (EN/FR) single-page wedding site for **Augusta &amp;
Georges** — one trip, two celebrations in the same week: **Accra, Ghana** 🇬🇭 on
**2 December 2026** and **Senegal** 🇸🇳 on **5 December 2026**. *Two homelands,
one union.*

Built with **Next.js (App Router)**, **Neon Postgres**, **Tailwind CSS**, and
**Framer Motion** for slow, soft scroll reveals. The look is **black &amp; gold,
premium** — a near-black (`#0B0B0B`) canvas with raised `#161514` surface cards,
champagne-gold (`#C6A15B`) hairlines and accents, high-contrast Playfair Display
headings and a quiet Inter body. Editorial signatures: section index numerals,
a recurring **"union" mark** (two interlocked rings — two people, two countries),
a running marquee, and large photos framed by thin gold hairlines.

## Sections

Single-page scroll: **Hero → Our Story** (three illustrated movements) **→ The
Week** (one timeline, two acts — Accra & Senegal) **→ Us** (gallery, `next/image`
from `/public`) **→ Our Witnesses → Prayers** (a live "cloud of prayers" guests
add to) **→ Travel &amp; Stay → RSVP → Countdown + footer**, plus a
password-gated **/admin** dashboard. Header **EN/FR** toggle throughout.

A **discreet, code-gated private ceremony** (evening of 5 December) is hidden
inside the RSVP: guests who have the invitation code can unlock it and respond.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000. The site renders fully (photos included) even
before the database is configured — RSVPs and prayers just can't be saved yet.

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
   Variables**, then redeploy. The site builds and renders without them, so a
   missing key won't 404 the page (RSVPs/prayers just won't persist).
5. Open the failing deployment's **Build Logs** if it still fails — a red build
   there tells you exactly what broke.

## Database (Neon Postgres) setup

**No migration step.** Once Neon is linked (Vercel **Storage → Neon** sets
`DATABASE_URL` for you), the app **creates its tables automatically on first
use** — the first RSVP, prayer, or `/admin` visit runs idempotent
`CREATE TABLE IF NOT EXISTS` statements (`ensureSchema` in `src/lib/db.ts`). So
all you need to do is set two more environment variables and deploy:

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | Neon connection string (set by the Vercel integration) |
   | `ADMIN_PASSWORD` | Password for the `/admin` dashboard |
   | `EXCLUSIVE_ACCESS_CODE` | Code you share privately to unlock the 5 Dec evening ceremony |

The Neon serverless (HTTP) driver is used, which is ideal for Vercel functions;
access is server-side only via route handlers. If you'd rather create the tables
yourself, [`neon/schema.sql`](./neon/schema.sql) has the same DDL — but it's
optional.

### RSVP data model (`rsvps`)

`full_name`, `email`, `attending_ghana` (Accra, 2 Dec), `attending_senegal`
(Dakar, 5 Dec), `attending_exclusive` (private ceremony, 5 Dec eve),
`party_size`, `dietary_notes`, `message`, `created_at`.

Inserts go through `POST /api/rsvp`, which validates input, drops bots via a
**honeypot**, applies a **per-IP rate limit** (5 / 10 min), and only records
`attending_exclusive` when the submitted **invitation code** matches
`EXCLUSIVE_ACCESS_CODE` server-side.

### Prayers (`prayers`)

`name` (optional), `message`, `created_at`. `GET /api/prayers` feeds the cloud;
`POST /api/prayers` adds one (honeypot + rate-limited). The private-ceremony
code is checked by `POST /api/access`; the ceremony details live client-side and
are only shown once the code matches, so nothing sensitive ships in the bundle.

## Admin

Visit **`/admin`** and enter `ADMIN_PASSWORD`. You get response totals
(including a **Private ceremony** count), guest totals, the full RSVP table with
a **CSV export**, and the **prayer wall**. Auth is a signed, http-only cookie
derived from the password — the password itself is never stored in the cookie.

## Internationalisation

All copy lives in a single typed dictionary
([`src/lib/dictionary.ts`](./src/lib/dictionary.ts)) exposed through a React
context ([`src/context/LanguageContext.tsx`](./src/context/LanguageContext.tsx)).
The header toggle switches EN/FR instantly and remembers the choice
(`localStorage` + browser-language detection).

## Customising

- **All copy (names, story, venues, witnesses, travel, prayers…)** →
  `src/lib/dictionary.ts`
- **Photos (hero, Our Story, gallery)** → the `faithsealedus*.PNG` files in
  `/public`, referenced from `src/lib/gallery.ts`, `src/components/Hero.tsx` and
  `src/components/OurStory.tsx`
- **Private ceremony details** → `exclusive` in `src/lib/dictionary.ts` (keep it
  discreet — no secret address in the bundle); set the code via `EXCLUSIVE_ACCESS_CODE`
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
