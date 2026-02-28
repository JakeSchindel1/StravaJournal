/**
 * GET /api/auth/strava/start
 * Initiates Strava OAuth by redirecting to Strava's authorize URL.
 * Accepts optional redirectTo query param for post-auth redirect.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildStravaAuthorizeUrl, STRAVA_SCOPE } from "@/lib/strava/auth";
import { generateState, setStravaOAuthCookies } from "@/lib/strava/cookies";
import { sanitizeRedirectTo } from "@/lib/strava/redirect";

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(new URL("/?error=strava_auth_failed", request.url));
  }

  const redirectTo = sanitizeRedirectTo(request.nextUrl.searchParams.get("redirectTo"));
  const state = generateState();

  await setStravaOAuthCookies(state, redirectTo);

  const authorizeUrl = buildStravaAuthorizeUrl({
    clientId,
    redirectUri,
    scope: STRAVA_SCOPE,
    state,
    approvalPrompt: "auto"
  });

  return NextResponse.redirect(authorizeUrl);
}
