# StravaJournal

Landing page + auth entrypoint for StravaJournal.

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

### Supabase dashboard configuration

In **Supabase → Authentication → URL Configuration**:
- Add your site URL (for local dev: `http://localhost:3000`)
- Add this redirect URL:
  - `http://localhost:3000/auth/callback`

In **Supabase → Authentication → Providers**:
- Enable **Google** and add client ID/secret.
- Enable **Strava** and add client ID/secret.

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
