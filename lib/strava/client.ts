/**
 * Client-side helper for Strava auth.
 * Redirects to the Strava OAuth start route.
 * Use this from the existing Continue with Strava button.
 */

/**
 * Initiates Strava OAuth by redirecting to /api/auth/strava/start.
 * @param redirectTo - Safe internal path to redirect after auth (default: /profile)
 */
export function startStravaAuth(redirectTo = "/profile"): void {
  const params = new URLSearchParams();
  if (redirectTo && redirectTo !== "/profile") {
    params.set("redirectTo", redirectTo);
  }
  const query = params.toString();
  const url = `/api/auth/strava/start${query ? `?${query}` : ""}`;
  window.location.href = url;
}
