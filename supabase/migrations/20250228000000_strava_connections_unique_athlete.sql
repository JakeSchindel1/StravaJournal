-- Add UNIQUE constraint on athlete_id so one Strava account links to at most one user.
-- Run via: supabase db push (or apply manually in SQL Editor)
-- Note: If you have duplicate athlete_ids, resolve them first (e.g. keep one row per athlete_id).

begin;

-- athlete_id must be unique: one Strava athlete can only link to one app user
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'strava_connections_athlete_id_unique'
  ) then
    alter table public.strava_connections
    add constraint strava_connections_athlete_id_unique unique (athlete_id);
  end if;
end $$;

commit;
