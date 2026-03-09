"use client";

/**
 * Fires landing_page_viewed once when the landing page loads.
 * Used for PostHog funnel analysis and Lou's top-of-funnel monitoring.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/posthog";

export function LandingPageTracker() {
  const pathname = usePathname();
  const firedRef = useRef(false);

  useEffect(() => {
    if (pathname !== "/") return;
    if (firedRef.current) return;

    firedRef.current = true;
    track("landing_page_viewed");
  }, [pathname]);

  return null;
}
