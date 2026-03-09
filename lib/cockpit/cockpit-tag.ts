/**
 * Generates a short, privacy-safe identifier tag for Discord Cockpit messages.
 *
 * Priority order:
 *   1. properties.$user_id  → "(U: last6)"  — explicit user identifier
 *   2. distinctId           → "(U: last6)"  — PostHog distinct_id (becomes user id after identify())
 *   3. properties.$session_id → "(S: last6)" — anonymous session fallback
 *
 * Never includes email, full IDs, or IP addresses.
 * Used by Lou, Quinn, Benny, and Frank messages.
 */

type CockpitTagInput = {
  properties: Record<string, unknown>;
  distinctId: string | null;
};

export function getCockpitTag({ properties, distinctId }: CockpitTagInput): string {
  // 1. Explicit $user_id set in event properties (e.g. after posthog.identify)
  const userId = typeof properties.$user_id === "string" ? properties.$user_id : null;
  if (userId) return `(U: ${userId.slice(-6)})`;

  // 2. PostHog distinct_id (set to Supabase user.id after posthog.identify())
  if (distinctId && distinctId !== "anonymous") return `(U: ${distinctId.slice(-6)})`;

  // 3. Session ID for anonymous visitors who haven't identified yet
  const sessionId = typeof properties.$session_id === "string" ? properties.$session_id : null;
  if (sessionId) return `(S: ${sessionId.slice(-6)})`;

  return "";
}
