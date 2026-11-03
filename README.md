# VibeBin

**Never lose a good prompt again.**

Personal prompt + agent config vault for AI builders and vibe coders.

## Product

| Plan | Price | Includes |
|------|-------|----------|
| Free | $0 | 25 prompts, tags, search, copy, export |
| Pro Monthly | $7/mo | Unlimited prompts and collections |
| Pro Yearly | $69/yr | Same as monthly (~17% off) |

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS (dark mode default)
- Supabase Auth (Google only) + Postgres
- Paddle billing

Prompts, collections, and the plan live in Supabase. The browser keeps a copy of older `localStorage` data only long enough to import it after the first Google sign-in. See [docs/supabase-setup.md](docs/supabase-setup.md).

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. **Continue with Google** on the login page. Without the Supabase env vars the app still builds and tells you auth is not configured.

The hosted Supabase project is **VibeBin Project** (`https://jxcvnnsrvjvimttmohn.supabase.co`). Setup is manual in that dashboard: run `supabase/schema.sql`, enable the Google provider, and set the URL allow list. Steps, including the Google Cloud OAuth client, are in [docs/supabase-setup.md](docs/supabase-setup.md).

## Project structure

```
src/
  app/
    page.tsx                 Landing
    login/                   Google sign-in
    auth/callback/           PKCE code exchange
    upgrade/                 Paddle checkout
    (app)/
      layout.tsx             Signed-in shell
      library/               Prompt list + search
      prompts/new|/[id]      Create + detail/edit
      collections/           Pro folders
      account/               Plan + export
    api/paddle/webhook/      Sets the Supabase plan
  hooks/usePrompts.ts
  hooks/useCollections.ts
  lib/supabase/              Browser and server clients
supabase/schema.sql          Run this in the SQL editor
```
