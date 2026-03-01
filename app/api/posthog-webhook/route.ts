/**
 * POST /api/posthog-webhook
 * Receives PostHog webhook events and forwards formatted messages to Discord Cockpit.
 * - Validates X-PostHog-Secret header against POSTHOG_WEBHOOK_SECRET
 * - Returns 200 quickly (Discord send is fire-and-forget)
 * - Ignores unknown events
 */

import { NextRequest, NextResponse } from "next/server";
import {
  formatDiscordMessage,
  EVENT_TO_WEBHOOK,
  sendToDiscord,
} from "@/lib/cockpit/discord";

/** PostHog sends event name in various places; normalize to string. */
function parseEventName(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const name =
    o.event ?? o.event_name ?? o.name ?? (o.properties as Record<string, unknown>)?.$event;
  return typeof name === "string" ? name : null;
}

/** Extract properties object from PostHog payload. */
function parseProperties(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const o = body as Record<string, unknown>;
  const props = o.properties ?? o.properties_;
  if (props && typeof props === "object" && !Array.isArray(props)) {
    return props as Record<string, unknown>;
  }
  return {};
}

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  const secret = process.env.POSTHOG_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("X-PostHog-Secret");
  if (secret) {
    if (!headerSecret || headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = parseEventName(body);
  if (!event) {
    return NextResponse.json({ error: "Missing event name" }, { status: 400 });
  }

  const webhookEnv = EVENT_TO_WEBHOOK[event];
  if (!webhookEnv) {
    // Unknown event: ignore, return 200 so PostHog doesn't retry
    return NextResponse.json({ received: true, routed: false });
  }

  const webhookUrl = process.env[webhookEnv];
  const props = parseProperties(body);
  const content = formatDiscordMessage(event, props);

  // Fire-and-forget: don't await, return 200 immediately
  sendToDiscord(webhookUrl, content).catch(() => {
    // Logged server-side if needed; we already returned 200
  });

  return NextResponse.json({ received: true, routed: true });
}
