/**
 * Cookie helpers for Strava OAuth state and redirectTo.
 * Uses httpOnly cookies so they never reach client JS.
 */

import { cookies } from "next/headers";

const STATE_COOKIE = "strava_oauth_state";
const REDIRECT_COOKIE = "strava_oauth_redirect";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 10 // 10 minutes
};

/** Generates a cryptographically secure random state string */
export function generateState(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Stores OAuth state and optional redirectTo in cookies */
export async function setStravaOAuthCookies(state: string, redirectTo?: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, COOKIE_OPTIONS);
  if (redirectTo) {
    cookieStore.set(REDIRECT_COOKIE, redirectTo, COOKIE_OPTIONS);
  }
}

/** Reads and validates state from cookie, then deletes it (one-time use) */
export async function consumeStateCookie(returnedState: string | null): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  return Boolean(stored && returnedState && stored === returnedState);
}

/** Reads redirectTo from cookie and deletes it */
export async function consumeRedirectCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const value = cookieStore.get(REDIRECT_COOKIE)?.value;
  cookieStore.delete(REDIRECT_COOKIE);
  return value;
}
