-- StravaJournal Supabase setup
-- Run this whole script in Supabase SQL Editor.
--
-- What this gives you:
-- 1) A guaranteed internal profile row per auth user
-- 2) Proper RLS on profile data
-- 3) A secure table for Strava OAuth tokens tied to your internal user id
-- 4) Backfill for existing users

begin;

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Shared trigger function
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Profiles table (app-level user identity)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Users can read only their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Users can update only their own profile (safe fields only are app concern).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Optional: allow client-side insert of own row (trigger already handles most cases).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- ------------------------------------------------------------
-- Trigger to auto-create profile for every new auth user
-- ------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id)
  do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Backfill profile rows for existing auth users.
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- ------------------------------------------------------------
-- Strava connections (tokens + metadata)
-- ------------------------------------------------------------
create table if not exists public.strava_connections (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  athlete_id bigint,
  scope text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_strava_connections_athlete_id
  on public.strava_connections (athlete_id);

alter table public.strava_connections enable row level security;
alter table public.strava_connections force row level security;

drop trigger if exists trg_strava_connections_set_updated_at on public.strava_connections;
create trigger trg_strava_connections_set_updated_at
before update on public.strava_connections
for each row
execute function public.set_updated_at();

-- Users can view only their own Strava connection metadata/tokens.
drop policy if exists "strava_connections_select_own" on public.strava_connections;
create policy "strava_connections_select_own"
on public.strava_connections
for select
to authenticated
using (auth.uid() = user_id);

-- Users can insert/update/delete only their own row if you choose browser-side writes.
-- If you prefer server-only token writes with service role, keep these policies or remove them.
-- Service role bypasses RLS regardless.
drop policy if exists "strava_connections_insert_own" on public.strava_connections;
create policy "strava_connections_insert_own"
on public.strava_connections
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "strava_connections_update_own" on public.strava_connections;
create policy "strava_connections_update_own"
on public.strava_connections
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "strava_connections_delete_own" on public.strava_connections;
create policy "strava_connections_delete_own"
on public.strava_connections
for delete
to authenticated
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Minimal grants for Supabase API roles
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.strava_connections to authenticated;

commit;
