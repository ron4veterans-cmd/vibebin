# Supabase setup for VibeBin

This is the manual setup for the existing project **VibeBin Project** (`https://jxcvnnsrvjvimttmohn.supabase.co`). It is on the free plan (Nano compute), has no migrations applied, and has no GitHub integration. Do not connect GitHub for this step. Paste the SQL in the dashboard. This repo does not contain credentials and does not modify that project.

Sign-in is **Google only**, through Supabase Auth. There is no email/password form, magic link, or OTP. The button calls `signInWithOAuth({ provider: "google" })` and Supabase returns the user to `/auth/callback`, which exchanges the code for a session.

Checked against the live docs (console labels move, so follow the field names if a menu has been renamed):

- [Get started with the Google Auth Platform](https://support.google.com/cloud/answer/15544987)
- [Configure the OAuth consent screen](https://developers.google.com/workspace/guides/configure-oauth-consent)
- [Manage OAuth clients](https://support.google.com/cloud/answer/15549257)
- [Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

If the Project URL shown in the dashboard differs from `https://jxcvnnsrvjvimttmohn.supabase.co`, use the dashboard value in Vercel and in Google’s redirect URI.

## 1. Run the SQL

1. Open the SQL editor: [VibeBin Project → SQL → New query](https://supabase.com/dashboard/project/jxcvnnsrvjvimttmohn/sql/new).
2. Paste the full contents of `supabase/schema.sql` (the same script is `supabase/migrations/20261103000000_init.sql`).
3. Run it once. It is safe to run again. It does not delete rows.
4. In Table Editor, confirm `profiles`, `prompts`, `collections`, and `collection_prompts`. Each should have row level security enabled.

The script creates:

- A profile row for each new auth user (including Google sign-ups).
- Prompt storage, with a database check that free accounts stop at 25 prompts.
- Collections, which only an active Pro subscription can create.
- Policies so each person can read and write only their own rows.
- A block so a signed-in user cannot change their own plan. The Paddle webhook uses the service role, which is allowed to update billing columns.

`stripe_customer_id` is unused. Paddle ids are `paddle_customer_id` and `paddle_subscription_id`.

If the API later says the schema cache is stale, wait a minute and reload. Supabase usually refreshes it when the SQL finishes.

## 2. Create the Google Cloud project and OAuth client

Do this in a **personal Google account**, not a Workspace organization. Create a new Cloud project named `VibeBin`. Do not reuse a company project. The support and contact emails are whichever personal account you are signed in with. Pick them from Google’s dropdown. Do not commit that address, the client secret, or any Supabase key.

Google’s menus have two names for the same screens. Current docs say **Google Auth Platform** (Overview, Branding, Audience, Data Access, Clients). Older consoles still say **APIs & Services → OAuth consent screen** and **APIs & Services → Credentials**. Use whichever label you see. The fields below are the ones that matter.

### 2a. Create the project

1. Open [Google Cloud Console](https://console.cloud.google.com/) and sign in with the personal account.
2. Open the project picker in the top bar and click **New project**.
3. Project name: `VibeBin`.
4. Location / Organization: **No organization**. If the form forces a company organization, stop and switch to the personal account. A Workspace project can offer an **Internal** audience, which would block anyone outside that company.
5. Click **Create**. Wait until the top bar shows `VibeBin` as the selected project.

### 2b. Start Google Auth Platform

1. Open the navigation menu (☰) and go to **Google Auth Platform**. If that entry is missing, use **APIs & Services → OAuth consent screen**.
2. If the page says the platform is not configured yet, click **Get started**. The wizard is the current setup from Google’s consent-screen guide:
   1. **App Information.** App name: `VibeBin`. User support email: choose the personal account in the dropdown (it only lists the signed-in account, or a Google Group that account manages). Click **Next**.
   2. **Audience.** Select **External**. A personal project does not use Internal. Click **Next**.
   3. **Contact Information.** Enter an email you actually read (the same personal account is fine). Google sends project notices there. Click **Next**.
   4. **Finish.** Read the Google API Services User Data Policy, check the agreement box, click **Continue**, then **Create**.

### 2c. Branding

Open **Google Auth Platform → Branding** (older label: OAuth consent screen).

- App name: `VibeBin`
- User support email: the personal account from the dropdown
- App domain / application home page: `https://www.vibebin.app`
- Privacy policy: `https://www.vibebin.app/privacy`
- Terms of service: `https://www.vibebin.app/terms`
- Authorized domains: add `vibebin.app` only. That is the registrable domain. Do not type `www`. `localhost` does not belong here.

Do **not** add `supabase.co` or `jxcvnnsrvjvimttmohn.supabase.co`. Google only accepts an authorized domain you can prove you own, and this account does not own `supabase.co`. Supabase’s current Sign in with Google guide does not ask you to add it. The Supabase host belongs on the OAuth client’s redirect URI in the next step, not in Authorized domains.

Leave the logo empty for now. Showing your own name and logo on the consent screen is optional brand verification and can take several business days. Sign-in works without it. Until then, Google’s screen can show the `supabase.co` host. A custom auth domain such as `auth.vibebin.app` would hide that, and Supabase recommends it, but custom domains are not on the free plan. Skip it for this setup.

Save.

### 2d. Scopes

Open **Google Auth Platform → Data Access** (older label: Scopes on the consent screen). Click **Add or remove scopes**.

Keep only these non-sensitive scopes. Supabase’s guide says `openid` must be added by hand, and the two userinfo scopes are usually already selected:

- `openid`
- `.../auth/userinfo.email` (`https://www.googleapis.com/auth/userinfo.email`)
- `.../auth/userinfo.profile` (`https://www.googleapis.com/auth/userinfo.profile`)

The picker sometimes labels the last two `email` and `profile`. Do not add Gmail, Drive, Calendar, or anything listed as sensitive or restricted. Those force a long verification review. Click **Update**, then **Save**.

### 2e. Test users, then publishing

Open **Google Auth Platform → Audience**.

Publishing status starts as **Testing**. In Testing, Google only lets accounts on the test-user list sign in (100 max). Everyone else gets an “app is in testing” block.

1. Under **Test users**, click **Add users**.
2. Add the personal Gmail addresses that should sign in while you test, including the account you will use yourself. Save.
3. When any Google account should be able to sign in, click **Publish app** on the Audience page and confirm. With only the three scopes above, publishing does not start the sensitive-scope security review. The app name and logo can still look unverified until you optionally submit brand verification.

While the app stays in Testing, Google expires refresh tokens after 7 days, so a test session can start failing until the person signs in again. Publish before real customers depend on it.

### 2f. Create the Web client

1. Open **Google Auth Platform → Clients** (older label: **APIs & Services → Credentials → Create credentials → OAuth client ID**).
2. Click **Create client**.
3. Application type: **Web application**. Name it `VibeBin Web`.
4. **Authorized JavaScript origins** (scheme + host + port, no path, no trailing slash):
   - `https://www.vibebin.app`
   - `http://localhost:3000`
   
   Plain HTTP is allowed only for localhost. Do not put a wildcard here.
5. **Authorized redirect URIs.** This is Supabase’s callback, not the app’s `/auth/callback`:
   - `https://jxcvnnsrvjvimttmohn.supabase.co/auth/v1/callback`
   
   Before you save, open Supabase → Authentication → Providers → Google and copy the **Callback URL** shown there. If that host differs from the URL above, use the dashboard value. A mismatch produces `redirect_uri_mismatch`.
6. Click **Create**.

Copy the **Client ID** and **Client secret** before you close the dialog. Google shows the secret then and does not show that same value again. If you lose it, open this client and add a new secret. The secret goes only into the Supabase Google provider in the next section. Do not put it in Git, Vercel, or `.env.local`.

Changes to origins and redirect URIs can take from a few minutes to a few hours to apply.

## 3. Enable Google in Supabase, and turn email off

1. Open [Authentication → Sign In / Providers](https://supabase.com/dashboard/project/jxcvnnsrvjvimttmohn/auth/providers) (the page may be labeled Providers).
2. Open **Google**. Turn it on. Paste the Client ID and Client secret. Save.
3. Leave **Skip nonce check** off. That option is for native iOS token sign-in, not this website.
4. Open **Email** and turn it off. That removes email/password, magic links, and OTP. Google is the only sign-in method. The Google client secret stays in this Supabase form. Do not put it in Vercel.

## 4. Auth URL configuration

Open [Authentication → URL Configuration](https://supabase.com/dashboard/project/jxcvnnsrvjvimttmohn/auth/url-configuration).

- **Site URL:** `https://www.vibebin.app`
- **Redirect URLs** (Supabase only redirects back to URLs on this list):
  - `https://www.vibebin.app/auth/callback`
  - `http://localhost:3000/auth/callback`
  - `https://www.vibebin.app/auth/callback**`
  - `http://localhost:3000/auth/callback**`

The app sends people to `/auth/callback?next=/library` (or another in-app path). The `**` entries match that query string. Supabase’s redirect guide says `**` matches any continuation of the URL, and recommends an exact production path rather than a wildcard on the whole site. The two `**` entries above only extend the callback path.

Vercel preview deployments are optional. Add a tight pattern after you know the project name, for example `https://vibebin-*.vercel.app/auth/callback**`. A broad `https://*.vercel.app/auth/callback**` also works and will accept any Vercel host, so prefer the tighter one.

If Google sign-in dumps you on the marketing site with no error, the `redirectTo` URL was not on this list. Supabase then falls back to the Site URL.

Flow, matching the current Supabase Next.js example:

1. The browser calls `signInWithOAuth`. `@supabase/ssr` stores the PKCE code verifier in a cookie and redirects to Google.
2. Google redirects to `https://jxcvnnsrvjvimttmohn.supabase.co/auth/v1/callback`.
3. Supabase redirects to `https://www.vibebin.app/auth/callback?code=...`.
4. `src/app/auth/callback/route.ts` calls `exchangeCodeForSession` and sends the user to `/library`.

## 5. API keys

Open [Project Settings → API Keys](https://supabase.com/dashboard/project/jxcvnnsrvjvimttmohn/settings/api).

| Dashboard value | Env var | Where it goes |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Browser and server. Example: `https://jxcvnnsrvjvimttmohn.supabase.co` |
| Publishable key (`sb_publishable_...`), or the legacy anon JWT if that is what the page still shows | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser. Safe to expose. |
| Secret key (`sb_secret_...`), or the legacy service_role JWT | `SUPABASE_SERVICE_ROLE_KEY` | Server only. Paddle webhook. Bypasses row level security. |

Current Supabase docs pass the publishable key to `createClient`. This app’s env name is still `NEXT_PUBLIC_SUPABASE_ANON_KEY` so existing examples keep working. Put the publishable key in that variable. Do not prefix the secret key with `NEXT_PUBLIC_`.

Set these in Vercel (Production, and Preview if you use preview URLs) and in `.env.local` for local dev. Copy `.env.example`. `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after saving them.

Also keep the existing Paddle variables:

- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- `NEXT_PUBLIC_PADDLE_PRICE_MONTHLY`
- `NEXT_PUBLIC_PADDLE_PRICE_YEARLY`
- `PADDLE_WEBHOOK_SECRET`

## 6. Paddle webhook

Point the Paddle notification destination at `https://www.vibebin.app/api/paddle/webhook`.

The upgrade page already sends `customData.user_id` (the Supabase user id) with checkout. On `subscription.created`, `subscription.activated`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`, `subscription.paused`, and `subscription.resumed`, the webhook writes:

- `subscription_status`: `active` (Paddle `active` or `trialing`), `past_due`, or `canceled` (`canceled` and `paused`)
- `subscription_plan`: `monthly` or `yearly`, from the price id env vars, or else the billing interval
- `current_period_end`
- `paddle_customer_id` and `paddle_subscription_id`

Pro in the app means `subscription_status = active`. Past due and canceled accounts fall back to the 25-prompt limit. The client checks the limit, and the database rejects a 26th prompt even if the client is skipped.

## 7. What happens to old browser data

Prompts and collections previously stored in `localStorage` (`vibebin_prompts`, `vibebin_collections`, `vibebin_collection_prompts`) are copied into Supabase the first time someone signs in with Google on that browser.

- The first account to sign in on that browser claims the data. A second account does not get another copy.
- Free accounts import up to 25 prompts. The rest stay in `localStorage` and import after the account becomes Pro.
- Collections import only for Pro.
- The browser copy is left in place as a backup.

## Free plan limits that matter

VibeBin Project is already on Nano compute. You do not need to change the instance size for this migration.

- Free projects pause after a stretch without activity (about 7 days). A paused project rejects sign-in and saves until you restore it from the dashboard. That will affect `www.vibebin.app` if the project goes quiet.
- Prompt text will not press the 500 MB database cap.
- Google sign-in does not use Supabase’s built-in email sender, so the free-plan email rate limit does not apply. Keep the Email provider disabled anyway.
- There is no point-in-time recovery on the free plan.

## Local check

```bash
cp .env.example .env.local
# fill in the publishable key, then:
npm run dev
```

Open `http://localhost:3000/login` and use **Continue with Google**. The localhost origin and redirect URL from the steps above must already be saved.

With the Supabase env vars unset, `npm run build` still succeeds. Login says auth is not available, and the library explains that Supabase is not configured.

## Order before production works

1. Run `supabase/schema.sql`.
2. Create the Google Web client and paste it into the Supabase Google provider.
3. Turn off the Email provider.
4. Set the Site URL and redirect URLs.
5. Set the Vercel env vars and redeploy.
6. Confirm the Paddle webhook destination.
7. Publish the Google consent screen, or stay in Testing and use only the test users you added.
