/**
 * Normalizes Strava athlete data for our profiles table.
 */

import type { StravaAthlete } from "./auth";

export interface NormalizedAthlete {
  display_name: string;
  avatar_url: string | null;
}

/** Builds display_name and avatar_url from Strava athlete object */
export function normalizeStravaAthlete(athlete: StravaAthlete): NormalizedAthlete {
  const parts: string[] = [];
  if (athlete.firstname) parts.push(athlete.firstname);
  if (athlete.lastname) parts.push(athlete.lastname);
  const display_name = parts.length > 0 ? parts.join(" ").trim() : "Strava Athlete";

  // Prefer larger profile image; profile_medium is 62x62, profile is 124x124
  const avatar_url = athlete.profile ?? athlete.profile_medium ?? null;

  return { display_name, avatar_url };
}
