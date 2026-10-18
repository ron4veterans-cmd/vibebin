# VibeBin

**Never lose a good prompt again.**

Personal prompt + agent config vault for AI builders and vibe coders.

## Product

| Plan | Price | Includes |
|------|-------|----------|
| Free | $0 | 25 prompts, tags, search, copy, export |
| Pro Monthly | $7/mo | Unlimited + collections, sharing |
| Pro Yearly | $69/yr | Same as monthly (~17% off) |

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS (dark mode default)
- **Local-first** storage (`localStorage`) — fully usable today
- Supabase (Auth + Postgres) — schema + client stubs ready
- Stripe — checkout + webhook route stubs ready

## What's working now

- Landing page with honest pricing
- Local auth (email → library; demo Pro login)
- Full prompt CRUD (create, edit, delete, one-click copy)
- Search across title, content, tags, notes
- Free limit enforcement (25) + upgrade modal
- Collections page (Pro-gated)
- Account page (plan status + JSON/Markdown export)
- Supabase SQL schema + RLS policies
- Stripe checkout & webhook API route stubs

## Run locally

```bash
cd vibebin
npm install
npm run dev
```

Open http://localhost:3000 → **Get started** → enter any email.

Use **Try as Pro user (demo)** on the login page to test unlimited mode and collections.

## Production setup

1. Copy `.env.example` → `.env.local`
2. Create a Supabase project, run `supabase/schema.sql` in the SQL editor
3. Add Supabase URL + anon key to `.env.local`
4. Install production deps:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr stripe
   ```
5. Create Stripe products/prices, add keys + price IDs to `.env.local`
6. Point Stripe webhook to `/api/stripe/webhook`

Until those env vars exist, the app stays in local/demo mode.

## Project structure

```
src/
  app/
    page.tsx                 Landing
    login/                   Auth
    upgrade/                 Pricing
    (app)/
      layout.tsx             Authenticated shell
      library/               Prompt list + search
      prompts/new|/[id]      Create + detail/edit
      collections/           Pro folders
      account/               Plan + export
    api/stripe/              Checkout + webhook stubs
  components/                UI primitives
  hooks/usePrompts.ts
  lib/store.ts               Local storage layer
  lib/supabase/             Client stubs
  types/
supabase/schema.sql
.env.example
```

## Ethics

Transparent pricing. No dark patterns. Honest messaging.
