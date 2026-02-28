/**
 * Next.js proxy - runs before each request.
 * Refreshes Supabase auth session so PKCE and OAuth work correctly.
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Exclude auth callback - proxy can interfere with PKCE code verifier during OAuth exchange
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
