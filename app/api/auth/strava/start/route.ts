/**
 * GET /api/auth/strava/start
 * Initiates Strava OAuth by redirecting to Strava's authorize URL.
 * Accepts optional redirectTo query param for post-auth redirect.
 * When user is already signed in, stores linkUserId so callback links Strava to existing account.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildStravaAuthorizeUrl, STRAVA_SCOPE } from "@/lib/strava/auth";
import { generateState, setStravaOAuthCookies } from "@/lib/strava/cookies";
import { sanitizeRedirectTo } from "@/lib/strava/redirect";
import { createServerSupabaseClient } from "@/lib/supabase-server-client";

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(new URL("/?error=strava_auth_failed", request.url));
  }

  const redirectTo = sanitizeRedirectTo(request.nextUrl.searchParams.get("redirectTo"));
  const state = generateState();

  // If user is already signed in, this is "Connect Strava" (link) not "Sign in with Strava"
  let linkUserId: string | undefined;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) linkUserId = user.id;
  } catch {
    // No session - proceed as sign-in flow
  }

  await setStravaOAuthCookies(state, redirectTo, linkUserId);

  const authorizeUrl = buildStravaAuthorizeUrl({
    clientId,
    redirectUri,
    scope: STRAVA_SCOPE,
    state,
    approvalPrompt: "auto"
  });

  return NextResponse.redirect(authorizeUrl);
}
