import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

type OAuthProvider = "google" | "strava";

let browserClient: SupabaseClient | null = null;

function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  };
}

/**
 * Creates a singleton browser Supabase client.
 * Returns null when project env vars are not configured yet.
 */
export function createClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  browserClient = createSupabaseClient(url, anonKey, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  });

  return browserClient;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

function getAuthCallbackUrl() {
  if (typeof window === "undefined") return undefined;

  const next = `${window.location.pathname}${window.location.search}`;
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", next);

  return callback.toString();
}

export async function signInWithOAuth(provider: OAuthProvider) {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Authentication is not configured. Add Supabase env keys to continue.");
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider as never,
    options: {
      redirectTo: getAuthCallbackUrl()
    }
  });

  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Authentication is not configured. Add Supabase env keys to continue.");
  }

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Authentication is not configured. Add Supabase env keys to continue.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
