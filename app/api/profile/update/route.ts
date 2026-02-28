/**
 * PATCH /api/profile/update
 * Updates the current user's profile (email, display_name).
 * Requires authenticated session.
 * Only updates fields that are provided and allowed.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server-client";
import { createAdminClient } from "@/lib/supabase-server";
import { isPlaceholderEmail } from "@/lib/profile-utils";

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string; display_name?: string | null; avatar_url?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: {
    email?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString()
  };

  if (typeof body.email === "string" && body.email.trim()) {
    const email = body.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    updates.email = email;

    // If user had placeholder email, update auth.users too
    const currentEmail = user.email ?? "";
    if (isPlaceholderEmail(currentEmail)) {
      const admin = createAdminClient();
      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        email,
        email_confirm: true
      });
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    }
  }

  if (body.display_name !== undefined) {
    updates.display_name =
      typeof body.display_name === "string" && body.display_name.trim()
        ? body.display_name.trim()
        : null;
  }

  if (body.avatar_url !== undefined) {
    updates.avatar_url =
      typeof body.avatar_url === "string" && body.avatar_url.trim()
        ? body.avatar_url.trim()
        : null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
