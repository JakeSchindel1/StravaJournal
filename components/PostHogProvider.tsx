"use client";

/**
 * Initializes PostHog and syncs Supabase auth identity.
 * Must be inside UserProvider. Runs once on mount.
 */

import { useEffect } from "react";
import { initPosthog, identifyUser, resetUser } from "@/lib/analytics/posthog";
import { useUser } from "@/contexts/UserContext";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  useEffect(() => {
    initPosthog();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user) {
      identifyUser({ id: user.id, email: user.email ?? undefined });
    } else {
      resetUser();
    }
  }, [user, loading]);

  return <>{children}</>;
}
