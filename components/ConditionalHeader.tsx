"use client";

/**
 * Renders StickyHeader only when NOT on /account. Account page uses its own FloatingHeader.
 */

import { usePathname } from "next/navigation";
import { StickyHeader } from "./StickyHeader";

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/account")) return null;
  return <StickyHeader />;
}
