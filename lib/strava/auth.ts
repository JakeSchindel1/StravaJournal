/**
 * Strava OAuth utilities - server-only.
 * Never expose STRAVA_CLIENT_SECRET or tokens to the client.
 */

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

/** Default scope for activity import - read profile + activities */
export const STRAVA_SCOPE = "read,activity:read_all,profile:read_all";

export interface StravaAthlete {
  id: number;
  firstname?: string;
  lastname?: string;
  profile?: string;
  profile_medium?: string;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthlete;
}

/** Builds the Strava OAuth authorize URL for redirecting the user */
export function buildStravaAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  scope?: string;
  state: string;
  approvalPrompt?: "auto" | "force";
}): string {
  const url = new URL(STRAVA_AUTHORIZE_URL);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", params.scope ?? STRAVA_SCOPE);
  url.searchParams.set("state", params.state);
  url.searchParams.set("approval_prompt", params.approvalPrompt ?? "auto");
  return url.toString();
}

/** Exchanges Strava authorization code for tokens (server-side only) */
export async function exchangeStravaCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri?: string;
}): Promise<StravaTokenResponse> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
    grant_type: "authorization_code"
  });
  if (params.redirectUri) {
    body.set("redirect_uri", params.redirectUri);
  }

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava token exchange failed: ${err}`);
  }

  return (await res.json()) as StravaTokenResponse;
}
