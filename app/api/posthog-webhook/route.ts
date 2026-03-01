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

/** Parse JSON string; on failure log one line and return {}. */
function safeParseJson(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    console.warn(`[posthog-webhook] ${label} JSON.parse failed`);
    return {};
  }
}

/** Extract event name, distinct_id, properties, person from PostHog templated payload. */
function parsePayload(body: unknown): {
  eventName: string | null;
  distinctId: string | null;
  properties: Record<string, unknown>;
  person: Record<string, unknown>;
} {
  if (!body || typeof body !== "object") {
    return { eventName: null, distinctId: null, properties: {}, person: {} };
  }
  const o = body as Record<string, unknown>;

  const eventName =
    typeof o.event === "string" ? o.event : typeof o.event_name === "string" ? o.event_name : null;

  const distinctId =
    typeof o.distinct_id === "string" ? o.distinct_id : typeof o.distinctId === "string" ? o.distinctId : null;

  let properties: Record<string, unknown>;
  if (o.properties && typeof o.properties === "object" && !Array.isArray(o.properties)) {
    properties = o.properties as Record<string, unknown>;
  } else if (typeof o.properties_json === "string") {
    properties = safeParseJson(o.properties_json, "properties_json");
  } else {
    properties = {};
  }

  let person: Record<string, unknown>;
  if (o.person && typeof o.person === "object" && !Array.isArray(o.person)) {
    person = o.person as Record<string, unknown>;
  } else if (typeof o.person_json === "string") {
    person = safeParseJson(o.person_json, "person_json");
  } else {
    person = {};
  }

  return { eventName, distinctId, properties, person };
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

  const { eventName, properties } = parsePayload(body);
  if (!eventName) {
    return NextResponse.json({ error: "Missing event name" }, { status: 400 });
  }

  const webhookEnv = EVENT_TO_WEBHOOK[eventName];
  if (!webhookEnv) {
    // Unknown event: ignore, return 200 so PostHog doesn't retry
    return NextResponse.json({ received: true, routed: false });
  }

  const webhookUrl = process.env[webhookEnv];
  const content = formatDiscordMessage(eventName, properties);

  // Fire-and-forget: don't await, return 200 immediately
  sendToDiscord(webhookUrl, content).catch(() => {
    // Logged server-side if needed; we already returned 200
  });

  return NextResponse.json({ received: true, routed: true });
}
