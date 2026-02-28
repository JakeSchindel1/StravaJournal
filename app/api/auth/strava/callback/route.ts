/**
 * GET /api/auth/strava/callback
 * Handles Strava OAuth callback: validates state, exchanges code, finds/creates user,
 * establishes session via magic link, redirects to safe destination.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava/auth";
import { consumeStateCookie, consumeRedirectCookie, consumeLinkUserCookie } from "@/lib/strava/cookies";
import { sanitizeRedirectTo } from "@/lib/strava/redirect";
import { findOrCreateStravaUser, linkStravaToUser } from "@/lib/strava/user-handler";
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

  const redirectTo = sanitizeRedirectTo(await consumeRedirectCookie());
  const linkUserId = await consumeLinkUserCookie();

  // Link flow: user was already signed in, attach Strava to their account
  if (linkUserId) {
    try {
      await linkStravaToUser(linkUserId, tokenData);
    } catch (err) {
      const isAlreadyLinked = err instanceof Error && err.message === "STRAVA_ALREADY_LINKED";
      const base = new URL(request.url).origin;
      return NextResponse.redirect(
        `${base}/account?error=${isAlreadyLinked ? "strava_already_linked" : "strava_auth_failed"}`
      );
    }
    return NextResponse.redirect(new URL(redirectTo, request.url).toString());
  }

  // Sign-in flow: find or create user, establish session via magic link
  let userResult;
  try {
    userResult = await findOrCreateStravaUser(tokenData);
  } catch {
    return errorRedirect(request, "strava_auth_failed");
  }

  const supabase = createAdminClient();
  const baseUrl = new URL(request.url).origin;
  // Route through /auth/callback so Supabase redirect lands on an allowlisted URL
  const magicLinkRedirect = `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: userResult.email,
    options: {
      redirectTo: magicLinkRedirect
    }
  });

  if (linkError || !linkData?.properties?.action_link) {
    return errorRedirect(request, "strava_auth_failed");
  }

  return NextResponse.redirect(linkData.properties.action_link);
}
