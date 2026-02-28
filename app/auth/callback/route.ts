/**
 * GET /auth/callback
 * Handles OAuth callback (Google, etc.) and magic link completion.
 * Runs on the server so it can read the PKCE code verifier from cookies.
 * The verifier was stored by createBrowserClient when signInWithOAuth was called.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const nextPath = requestUrl.searchParams.get("next");

  const origin = requestUrl.origin;
  const safeNext = nextPath?.startsWith("/") ? nextPath : "/account";

  // OAuth provider returned an error (e.g. user denied)
  if (errorParam) {
    const message = errorDescription ?? errorParam;
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(message)}`);
  }

  // OAuth flow with code: exchange on server (has access to PKCE verifier in cookies)
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // Magic link flow (e.g. Strava): session already set by Supabase redirect, just redirect
  return NextResponse.redirect(`${origin}${safeNext}`);
}
