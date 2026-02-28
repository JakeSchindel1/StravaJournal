/**
 * Strava callback user lookup and creation.
 * Handles existing linked users vs new Strava-first signups.
 */

import { createAdminClient } from "@/lib/supabase-server";
import { STRAVA_SCOPE } from "./auth";
import { normalizeStravaAthlete } from "./athlete";
import type { StravaTokenResponse } from "./auth";

/** Generates a secure random password for placeholder accounts (never shown to user) */
function generateSecurePassword(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Placeholder email for Strava-only accounts (no real email from Strava) */
function placeholderEmail(athleteId: number): string {
  return `strava-${athleteId}@internal.local`;
}

export interface StravaUserResult {
  userId: string;
  email: string;
}

/**
 * Finds existing linked user or creates new account.
 * Returns userId and email for magic link generation.
 */
export async function findOrCreateStravaUser(
  tokenData: StravaTokenResponse
): Promise<StravaUserResult> {
  const supabase = createAdminClient();
  const athleteId = tokenData.athlete.id;

  // Look up existing strava_connection by athlete_id
  const { data: existing } = await supabase
    .from("strava_connections")
    .select("user_id")
    .eq("athlete_id", athleteId)
    .single();

  if (existing?.user_id) {
    // Update tokens for existing linked user
    const expiresAt = tokenData.expires_at
      ? new Date(tokenData.expires_at * 1000).toISOString()
      : null;

    await supabase
      .from("strava_connections")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        scope: STRAVA_SCOPE,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", existing.user_id);

    // Get email for magic link (existing users may have real email)
    const { data: user } = await supabase.auth.admin.getUserById(existing.user_id);
    const email = user?.user?.email ?? placeholderEmail(athleteId);

    return { userId: existing.user_id, email };
  }

  // New user: create auth.users, profile, and strava_connection
  const { display_name, avatar_url } = normalizeStravaAthlete(tokenData.athlete);
  const email = placeholderEmail(athleteId);
  const password = generateSecurePassword();

  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Skip email verification for placeholder accounts
  });

  if (createError || !createData.user) {
    throw new Error(createError?.message ?? "Failed to create user");
  }

  const userId = createData.user.id;

  // Trigger creates profile with (id, email); we update with Strava data
  await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      avatar_url: avatar_url || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  const expiresAt = tokenData.expires_at
    ? new Date(tokenData.expires_at * 1000).toISOString()
    : null;

  await supabase.from("strava_connections").insert({
    user_id: userId,
    athlete_id: athleteId,
    scope: STRAVA_SCOPE,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt
  });

  return { userId, email };
}

/**
 * Links a Strava account to an existing user (e.g. Google/email user connecting Strava).
 * Use when user is already signed in and clicks "Connect Strava".
 * Throws if athlete_id is already linked to a different user.
 */
export async function linkStravaToUser(
  existingUserId: string,
  tokenData: StravaTokenResponse
): Promise<void> {
  const supabase = createAdminClient();
  const athleteId = tokenData.athlete.id;

  const { data: existing } = await supabase
    .from("strava_connections")
    .select("user_id")
    .eq("athlete_id", athleteId)
    .single();

  if (existing) {
    if (existing.user_id === existingUserId) {
      // Same user - just update tokens
      const expiresAt = tokenData.expires_at
        ? new Date(tokenData.expires_at * 1000).toISOString()
        : null;
      await supabase
        .from("strava_connections")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          scope: STRAVA_SCOPE,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", existingUserId);
      return;
    }
    // Strava account already linked to another user
    throw new Error("STRAVA_ALREADY_LINKED");
  }

  const expiresAt = tokenData.expires_at
    ? new Date(tokenData.expires_at * 1000).toISOString()
    : null;

  await supabase.from("strava_connections").insert({
    user_id: existingUserId,
    athlete_id: athleteId,
    scope: STRAVA_SCOPE,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt
  });
}
