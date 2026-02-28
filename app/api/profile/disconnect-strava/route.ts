/**
 * POST /api/profile/disconnect-strava
 * Removes the Strava connection from the current user.
 * Requires authenticated session.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server-client";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("strava_connections")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
