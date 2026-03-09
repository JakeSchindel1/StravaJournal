/**
 * POST /api/posthog-webhook
 * Receives PostHog webhook events and routes them to the correct Discord Cockpit bot.
 *
 * Bots and their channels:
 *   Lou   → DISCORD_LIVE_USERS_WEBHOOK  (arrivals)
 *   Quinn → DISCORD_FUNNEL_WEBHOOK      (builder behavior, via interpreter)
 *   Frank → DISCORD_PURCHASES_WEBHOOK   (purchases)
 *   Oscar → DISCORD_ERRORS_WEBHOOK      (errors)
 *   Bob   → DISCORD_SYSTEM_WEBHOOK      (system events)
 *   Benny → DISCORD_NEW_USER_WEBHOOK    (new accounts)
 *
 * - Validates X-PostHog-Secret header against POSTHOG_WEBHOOK_SECRET
 * - Returns 200 quickly (Discord sends are fire-and-forget)
 * - Ignores unknown events silently
 */

import { NextRequest, NextResponse } from "next/server";
import {
  formatDiscordMessage,
  EVENT_TO_WEBHOOK,
  sendToDiscord,
} from "@/lib/cockpit/discord";
import { interpretFunnelEvent } from "@/lib/cockpit/funnel-interpreter";
import { getCockpitTag } from "@/lib/cockpit/cockpit-tag";

// Events that go through the stateful Quinn interpreter instead of raw formatting.
// The interpreter tracks session state and produces conversational messages.
const INTERPRETED_EVENTS = new Set([
  "builder_step_viewed",
  "builder_step_completed",
  "builder_closed",
  "builder_saved_draft",
]);

/**
 * Safely parse a value that may arrive as a stringified JSON object OR already
 * be a plain object (PostHog sometimes does either). Returns {} on any failure.
 */
function safeParse(value: unknown, label: string): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
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

/** Extract event name, distinct_id, properties, person from PostHog payload. */
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
    typeof o.event === "string"
      ? o.event
      : typeof o.event_name === "string"
      ? o.event_name
      : null;

  const properties = safeParse(o.properties ?? o.properties_json, "properties");
  const person = safeParse(o.person ?? o.person_json, "person");

  // PostHog may not send distinct_id at the top level
  const distinctId =
    (typeof person.distinct_id === "string" ? person.distinct_id : null) ??
    (typeof properties.distinct_id === "string" ? properties.distinct_id : null) ??
    "anonymous";

  return { eventName, distinctId, properties, person };
}

/** Capitalize first letter of a string (for provider names like "google" → "Google"). */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  const secret = process.env.POSTHOG_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("x-posthog-secret");
  if (secret && (!headerSecret || headerSecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn("[posthog-webhook] Could not parse request body as JSON");
    return Response.json({ ok: true });
  }

  const { eventName, distinctId, properties } = parsePayload(body);

  if (!eventName) return Response.json({ ok: true });

  // Compute a privacy-safe tag once and reuse it across all message builders
  const tag = getCockpitTag({ properties, distinctId });

  let content: string | null = null;
  let webhookEnv: string | undefined;
  let speaker: string;

  // ── Benny: new account created ────────────────────────────────────────────
  if (eventName === "account_created") {
    speaker = "benny";
    webhookEnv = "DISCORD_NEW_USER_WEBHOOK";
    const provider = typeof properties.provider === "string" ? properties.provider : null;
    const providerLabel = provider ? ` via ${capitalize(provider)}` : "";
    const tagSuffix = tag ? ` ${tag}` : "";
    content = `🪪 Benny: New account created${providerLabel}.${tagSuffix}`;

  // ── Quinn: stateful builder behavior via interpreter ─────────────────────
  } else if (INTERPRETED_EVENTS.has(eventName)) {
    speaker = "quinn";
    webhookEnv = EVENT_TO_WEBHOOK[eventName];
    if (!webhookEnv) return Response.json({ ok: true });

    // Session key: prefer PostHog's own $session_id, fall back to distinct_id
    const sessionId =
      (typeof properties.$session_id === "string" ? properties.$session_id : null) ??
      distinctId ??
      "unknown";

    const result = interpretFunnelEvent(eventName, sessionId, properties, distinctId);
    if (!result) return Response.json({ ok: true });
    content = result.message;

  // ── All other events: format directly ────────────────────────────────────
  } else {
    webhookEnv = EVENT_TO_WEBHOOK[eventName];
    if (!webhookEnv) return Response.json({ ok: true });

    // Determine speaker for log only
    if (webhookEnv === "DISCORD_LIVE_USERS_WEBHOOK") speaker = "lou";
    else if (webhookEnv === "DISCORD_PURCHASES_WEBHOOK") speaker = "frank";
    else if (webhookEnv === "DISCORD_ERRORS_WEBHOOK") speaker = "oscar";
    else speaker = "bob";

    // Pass tag so Lou and Frank messages include the privacy-safe identifier
    content = formatDiscordMessage(eventName, properties, tag);
  }

  // Debug log: event name, distinct_id, and which bot spoke (no full properties)
  console.log(
    `[posthog-webhook] event: ${eventName} | distinct_id: ${distinctId} | speaker: ${speaker}`
  );

  if (!content) return Response.json({ ok: true });

  const webhookUrl = process.env[webhookEnv];

  // Fire-and-forget: return ok:true immediately; Discord failures are non-blocking
  sendToDiscord(webhookUrl, content).catch((err) => {
    console.error("[posthog-webhook] Discord send failed:", err);
  });

  return Response.json({ ok: true });
}
