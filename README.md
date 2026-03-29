# Grex

Landing page + auth entrypoint for Grex.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template and add your Supabase values:
   ```bash
   cp .env.example .env.local
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Supabase auth wiring (ready for keys)

This project is pre-wired for:
- Supabase email/password sign-up + sign-in
- Supabase OAuth with Google
- Supabase OAuth2 with Strava

### Required environment variables

Set these in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, for Strava user creation + magic links)
- `STRAVA_CLIENT_ID` (from [Strava API settings](https://www.strava.com/settings/api))
- `STRAVA_CLIENT_SECRET` (server-only)
- `STRAVA_REDIRECT_URI` (e.g. `http://localhost:3000/api/auth/strava/callback`)

### Supabase dashboard configuration

In **Supabase → Authentication → URL Configuration**:
- Add your site URL (for local dev: `http://localhost:3000`)
- Add this redirect URL:
  - `http://localhost:3000/auth/callback`

In **Supabase → Authentication → Providers**:
- Enable **Google** and add client ID/secret.

The Strava magic-link flow redirects through `/auth/callback`, so no extra redirect URLs are needed beyond the one above.

**Strava OAuth** uses a custom flow (not Supabase’s built-in Strava provider). Configure your [Strava API app](https://www.strava.com/settings/api) with:
- Authorization Callback Domain: `localhost` (dev) or your production domain
- The callback URL is `STRAVA_REDIRECT_URI` (e.g. `http://localhost:3000/api/auth/strava/callback`)

## Create internal profiles for every account (required)

To guarantee every auth user has your own app-level user id/profile row,
run this SQL script in Supabase SQL Editor:

- `supabase/profiles.sql`

What it sets up:
- `public.profiles` table keyed by `auth.users.id`
- strict RLS policies (`authenticated` can only access their own rows)
- trigger on `auth.users` to auto-create/update a `public.profiles` row for every new account
- backfill for existing users
- `public.strava_connections` table keyed by your internal user id for storing Strava tokens + metadata
- grants for Supabase API roles (`anon`/`authenticated`)

If you want token writes to be server-only, remove the `insert/update/delete` policies on `public.strava_connections` and write with the service role from your backend.

Once env keys + provider settings + SQL are in place, users can authenticate and always have a stable internal profile id for storing connected-account data.

## PostHog → Discord Cockpit

PostHog events are forwarded to Discord webhooks for live monitoring (Lou, Quinn, Frank, Oscar, Bob).

### Setup

1. Add Discord webhook URLs and optional secret to `.env.local`:
   - `DISCORD_LIVE_USERS_WEBHOOK`, `DISCORD_FUNNEL_WEBHOOK`, `DISCORD_PURCHASES_WEBHOOK`, `DISCORD_ERRORS_WEBHOOK`, `DISCORD_SYSTEM_WEBHOOK`
   - `POSTHOG_WEBHOOK_SECRET` (optional; if set, PostHog must send `X-PostHog-Secret` header)

2. In PostHog → Data Pipelines → Destinations → Webhook:
   - URL: `https://your-domain.com/api/posthog-webhook`
   - Add header: `X-PostHog-Secret: <your-secret>` (if using secret)

3. Test: `GET /api/test-cockpit` sends a message to each webhook and returns status.
