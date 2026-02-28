/**
 * Profile helpers - check incomplete profile, placeholder email, etc.
 */

/** Placeholder email for Strava-only accounts (no real email from Strava) */
export const PLACEHOLDER_EMAIL_REGEX = /^strava-\d+@internal\.local$/;

/** Returns true if the email is a placeholder (Strava sign-up without real email) */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return Boolean(email && PLACEHOLDER_EMAIL_REGEX.test(email));
}
