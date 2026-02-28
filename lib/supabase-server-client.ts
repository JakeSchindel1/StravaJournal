/**
 * Server Supabase client that reads the user's session from cookies.
 * Use in API routes / server components when you need the current user.
 * Does NOT use service role - respects RLS.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Creates a Supabase client with the current user's session (from cookies). */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route handlers can set; Server Components may not - ignore
          }
        }
      }
    }
  );
}
