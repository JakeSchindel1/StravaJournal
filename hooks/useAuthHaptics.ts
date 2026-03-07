"use client";

import { useWebHaptics } from "web-haptics/react";

/**
 * Premium two-pulse pattern: crisp initial contact + subtle mechanical click finish.
 * Used only for auth CTAs (Get Started, Sign In, Continue with Strava/Google).
 */
const AUTH_TAP_PATTERN = [
  { duration: 18 },
  { delay: 35, duration: 22, intensity: 0.9 }
] as const;

export function useAuthHaptics() {
  const { trigger } = useWebHaptics();

  const triggerAuthTap = () => {
    trigger([...AUTH_TAP_PATTERN]);
  };

  const triggerAuthSuccess = () => {
    trigger("success");
  };

  return { triggerAuthTap, triggerAuthSuccess };
}
