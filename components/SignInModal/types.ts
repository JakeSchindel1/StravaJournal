/**
 * Auth handler interfaces for future Supabase integration.
 * Wire these callbacks when connecting the backend.
 */

export type AuthLoadingSource = "strava" | "google" | "email" | null;

export interface SignInModalAuthHandlers {
  /** Primary path: link Strava to import activity history */
  onStravaAuth?: () => Promise<void>;
  /** Secondary: sign in with Google */
  onGoogleAuth?: () => Promise<void>;
  /** Fallback: create account with email and password */
  onEmailSignup?: (email: string, password: string) => Promise<void>;
  /** Fallback: sign in for returning users */
  onEmailSignin?: (email: string, password: string) => Promise<void>;
}
