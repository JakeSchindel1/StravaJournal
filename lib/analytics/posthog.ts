/**
 * PostHog analytics wrapper. All analytics calls go through this module.
 * - Only initializes in browser
 * - Manual capture only (no autocapture of form inputs for privacy)
 * - Uses first-party proxy (/ph) to avoid ad-blocker interference and improve reliability
 * - Extensible for checkout_started, purchase_completed (Shopify webhook) later
 */

import posthog from "posthog-js";

let initialized = false;

/** Initialize PostHog. Safe to call multiple times; runs only once in browser. */
export function initPosthog(): void {
  if (typeof window === "undefined") return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  // First-party proxy: requests go to our domain /ph/*, not posthog.com.
  // Prevents ad blockers from blocking analytics and improves reliability.
  posthog.init(key, {
    api_host: "/ph",
    person_profiles: "identified_only",
    // Disable autocapture of inputs to avoid sending sensitive text
    autocapture: false,
    // No session replay for now (can enable later)
    disable_session_recording: true,
    capture_pageview: false, // We track page views manually where needed
  });

  initialized = true;
}

/** Identify logged-in user. Uses Supabase user.id as distinct_id. */
export function identifyUser(user: { id: string; email?: string | null }): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;

  posthog.identify(user.id);
  if (user.email) {
    posthog.people.set({ email: user.email });
  }
}

/** Reset identity on logout. */
export function resetUser(): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;

  posthog.reset();
}

/** Track a custom event. Use for all manual analytics. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;

  posthog.capture(event, props);
}

// --- Future Shopify/checkout events (add when ready) ---
// Client-side: track('checkout_started', { cart_id?, journal_id? })
// Server-side: purchase_completed via Shopify webhook (not through this wrapper)
