/**
 * Account status helpers - check if user has Strava linked.
 * Used by /profile to decide which empty state to show.
 */

import { createClient } from "@/lib/supabase";

/**
 * Returns true if the current user has a linked Strava account.
 * Call from client components after confirming user is authenticated.
 */
export async function hasStravaConnection(userId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("strava_connections")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
