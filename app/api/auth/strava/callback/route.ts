/**
 * GET /api/auth/strava/callback
 * Handles Strava OAuth callback: validates state, exchanges code, finds/creates user,
 * establishes session via magic link, redirects to safe destination.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava/auth";
import { consumeStateCookie, consumeRedirectCookie } from "@/lib/strava/cookies";
import { sanitizeRedirectTo } from "@/lib/strava/redirect";
import { findOrCreateStravaUser } from "@/lib/strava/user-handler";
import { createAdminClient } from "@/lib/supabase-server";

function errorRedirect(
  request: NextRequest,
  errorType: "strava_auth_failed" | "strava_access_denied"
): NextResponse {
  const base = new URL(request.url).origin;
  return NextResponse.redirect(`${base}/?error=${errorType}`);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Handle user denied access
  if (error === "access_denied") {
    return errorRedirect(request, "strava_access_denied");
  }

  if (error) {
    return errorRedirect(request, "strava_auth_failed");
  }

  // Validate state (CSRF protection)
  const validState = await consumeStateCookie(state);
  if (!validState) {
    return errorRedirect(request, "strava_auth_failed");
  }

  if (!code) {
    return errorRedirect(request, "strava_auth_failed");
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return errorRedirect(request, "strava_auth_failed");
  }

  let tokenData;
  try {
    tokenData = await exchangeStravaCode({
      clientId,
      clientSecret,
      code,
      redirectUri
    });
  } catch {
    return errorRedirect(request, "strava_auth_failed");
  }

  let userResult;
  try {
    userResult = await findOrCreateStravaUser(tokenData);
  } catch {
    return errorRedirect(request, "strava_auth_failed");
  }

  // Establish session via magic link (Supabase handles cookie/session)
  const supabase = createAdminClient();
  const baseUrl = new URL(request.url).origin;
  const redirectTo = sanitizeRedirectTo(await consumeRedirectCookie());

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: userResult.email,
    options: {
      redirectTo: `${baseUrl}${redirectTo}`
    }
  });

  if (linkError || !linkData?.properties?.action_link) {
    return errorRedirect(request, "strava_auth_failed");
  }

  // Redirect user to magic link - Supabase verifies and redirects back with session
  return NextResponse.redirect(linkData.properties.action_link);
}
