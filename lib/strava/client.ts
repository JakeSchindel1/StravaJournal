/**
 * Client-side helpers for Strava auth.
 * Two flows: sign-in (logged out) vs connect (logged in, linking to existing account).
 * Both hit the same start route; the server detects session and handles accordingly.
 */

/**
 * Sign in with Strava - use when user is logged out (e.g. sign-in modal).
 * Creates new account or signs into existing Strava-linked account.
 */
export function startStravaAuth(redirectTo = "/account"): void {
  redirectToStravaStart(redirectTo);
}

/**
 * Connect Strava - use when user is already signed in (e.g. profile page).
 * Links Strava to the current account without creating a duplicate user.
 */
export function connectStravaAuth(redirectTo = "/account"): void {
  redirectToStravaStart(redirectTo);
}

function redirectToStravaStart(redirectTo: string): void {
  const params = new URLSearchParams();
  if (redirectTo && redirectTo !== "/account") {
    params.set("redirectTo", redirectTo);
  }
  const query = params.toString();
  window.location.href = `/api/auth/strava/start${query ? `?${query}` : ""}`;
}
