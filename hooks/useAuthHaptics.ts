"use client";

import { useWebHaptics } from "web-haptics/react";

/**
 * Subtle single-pulse pattern for auth CTAs (Get Started, Sign In, Continue with Strava/Google).
 */
const AUTH_TAP_PATTERN = [{ duration: 8 }];

export function useAuthHaptics() {
  const { trigger } = useWebHaptics();

  const triggerAuthTap = () => {
    trigger(AUTH_TAP_PATTERN, { intensity: 0.3 });
  };

  const triggerAuthSuccess = () => {
    trigger("success");
  };

  return { triggerAuthTap, triggerAuthSuccess };
}
