/**
 * GET /api/test-cockpit
 * Sends a test message to each Discord webhook to verify env vars and connectivity.
 * Returns JSON status of which messages were sent.
 */

import { NextResponse } from "next/server";
import { sendToDiscord } from "@/lib/cockpit/discord";

const TESTS: { key: string; message: string }[] = [
  { key: "DISCORD_LIVE_USERS_WEBHOOK", message: "👀 Lou online" },
  { key: "DISCORD_FUNNEL_WEBHOOK", message: "📋 Quinn online" },
  { key: "DISCORD_ERRORS_WEBHOOK", message: "🚨 Oscar online" },
  { key: "DISCORD_SYSTEM_WEBHOOK", message: "⚙️ Bob online" },
  { key: "DISCORD_PURCHASES_WEBHOOK", message: "💰 Frank online" },
  { key: "DISCORD_NEW_USER_WEBHOOK", message: "🪪 Benny online" },
];

export async function GET() {
  const results: Record<string, { sent: boolean; error?: string }> = {};

  for (const { key, message } of TESTS) {
    const url = process.env[key];
    const result = await sendToDiscord(url, message);
    results[key] = result.ok
      ? { sent: true }
      : { sent: false, error: result.error };
  }

  return NextResponse.json({ cockpit: results });
}
