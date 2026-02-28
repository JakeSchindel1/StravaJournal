/**
 * POST /api/profile/delete
 * Permanently deletes the current user's account (auth + profile + strava_connection).
 * Requires authenticated session.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server-client";
import { createAdminClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Profile and strava_connection cascade delete via FK
  return NextResponse.json({ success: true });
}
