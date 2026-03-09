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
import { interpretFunnelEvent } from "@/lib/cockpit/funnel-interpreter";

// Events that go through the stateful interpreter instead of raw formatting.
// The interpreter tracks session state and produces conversational messages.
const INTERPRETED_EVENTS = new Set([
  "builder_step_viewed",
  "builder_step_completed",
  "builder_closed",
]);

/**
 * Safely parse a value that may arrive as a stringified JSON object OR already
 * be a plain object (PostHog sometimes does either). Returns {} on any failure.
 */
function safeParse(value: unknown, label: string): Record<string, unknown> {
  if (!value) return {};
  // Already a plain object — use it directly
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  // Stringified JSON — parse it
  if (typeof value === "string") {
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
  return {};
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

  // Prefer the direct field; fall back to the _json variant (PostHog templated string)
  const properties = safeParse(
    o.properties ?? o.properties_json,
    "properties"
  );

  const person = safeParse(
    o.person ?? o.person_json,
    "person"
  );

  // PostHog may not send distinct_id at the top level, so pull it from person or properties
  const distinctId =
    (typeof person.distinct_id === "string" ? person.distinct_id : null) ??
    (typeof properties.distinct_id === "string" ? properties.distinct_id : null) ??
    "anonymous";

  return { eventName, distinctId, properties, person };
}

export async function POST(request: NextRequest) {
  // Verify webhook authenticity — 401 is intentional even for PostHog, so it
  // knows to stop sending (wrong secret = misconfiguration, not a retry-able error).
  const secret = process.env.POSTHOG_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("x-posthog-secret");
  if (secret && (!headerSecret || headerSecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Bad JSON: return ok:true anyway so PostHog doesn't retry infinitely
    console.warn("[posthog-webhook] Could not parse request body as JSON");
    return Response.json({ ok: true });
  }

  const { eventName, distinctId, properties } = parsePayload(body);

  // Log for debugging (privacy-safe: no properties dump)
  console.log("[posthog-webhook] event:", eventName, "| distinct_id:", distinctId);

  if (!eventName) {
    // No event name means we can't route — return ok:true to stop PostHog retries
    return Response.json({ ok: true });
  }

  const webhookEnv = EVENT_TO_WEBHOOK[eventName];
  if (!webhookEnv) {
    // Unknown event: silently ignore, return ok:true so PostHog doesn't retry
    return Response.json({ ok: true });
  }

  let content: string | null;

  if (INTERPRETED_EVENTS.has(eventName)) {
    // Use the stateful interpreter — it decides whether to send a message at all
    // and translates events into conversational language instead of raw data.
    // Session key: prefer PostHog's own $session_id, fall back to distinct_id.
    const sessionId =
      (typeof properties.$session_id === "string" ? properties.$session_id : null) ??
      distinctId ??
      "unknown";
    content = interpretFunnelEvent(eventName, sessionId, properties);
  } else {
    content = formatDiscordMessage(eventName, properties);
  }

  // null means the interpreter decided to suppress this event — skip silently
  if (content === null) return Response.json({ ok: true });

  const webhookUrl = process.env[webhookEnv];

  // Fire-and-forget: return ok:true immediately; Discord failures are non-blocking
  sendToDiscord(webhookUrl, content).catch((err) => {
    console.error("[posthog-webhook] Discord send failed:", err);
  });

  return Response.json({ ok: true });
}
