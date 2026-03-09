/**
 * Discord Cockpit helpers. Format PostHog events into short Discord messages
 * and send them to the appropriate webhooks.
 *
 * Lou   → DISCORD_LIVE_USERS_WEBHOOK  (presence / top-of-funnel)
 * Quinn → DISCORD_FUNNEL_WEBHOOK      (builder behavior — via interpreter)
 * Frank → DISCORD_PURCHASES_WEBHOOK   (purchases)
 * Oscar → DISCORD_ERRORS_WEBHOOK      (errors)
 * Bob   → DISCORD_SYSTEM_WEBHOOK      (system events)
 * Benny → DISCORD_NEW_USER_WEBHOOK    (new account created)
 *
 * Privacy: no email, IP, full URLs, or raw PostHog property dumps.
 * Builder events (Quinn) are formatted in funnel-interpreter.ts, not here.
 */

/**
 * Format an event into a short, human-readable Discord message.
 * Pass `tag` (from getCockpitTag) for Lou and Frank messages.
 * Oscar and Bob messages do not include a tag.
 */
export function formatDiscordMessage(
  event: string,
  props: Record<string, unknown>,
  tag?: string
): string {
  // Append tag if provided — used for Lou and Frank
  const t = tag ? ` ${tag}` : "";

  switch (event) {
    // ── Lou: top-of-funnel arrivals only ───────────────────────────────────
    case "landing_page_viewed":
      return `👀 Lou: Someone landed on the site.${t}`;

    case "get_started_clicked":
      return `👀 Lou: Get Started got a click.${t}`;

    case "builder_opened":
      return `👀 Lou: Builder opened.${t}`;

    // ── Frank: purchases ──────────────────────────────────────────────────
    case "purchase_completed":
      return `💰 Frank: Order headed to production.${t}`;

    // ── Oscar: errors (no tag — error context is enough) ──────────────────
    case "app_error":
    case "builder_error":
    case "error_captured": {
      const where =
        typeof props.where === "string" && props.where
          ? props.where
          : typeof props.location === "string" && props.location
          ? props.location
          : null;
      return `🚨 Oscar: Something broke${where ? ` in ${where}` : ""}.`;
    }

    // ── Bob: system events (no tag) ────────────────────────────────────────
    case "deploy_success":
      return "⚙️ Bob: Deployment landed clean.";

    case "system_ok": {
      const msg =
        typeof props.message === "string" && props.message
          ? props.message
          : null;
      return `⚙️ Bob: System check${msg ? ` — ${msg}` : " ok"}.`;
    }

    default:
      // Privacy-safe fallback: event name only, no property dump
      return `📌 ${event}`;
  }
}

/** Event → Discord webhook env var name. Determines which channel receives the event. */
export const EVENT_TO_WEBHOOK: Record<string, string> = {
  // Lou: top-of-funnel arrivals
  landing_page_viewed: "DISCORD_LIVE_USERS_WEBHOOK",
  get_started_clicked: "DISCORD_LIVE_USERS_WEBHOOK",
  builder_opened: "DISCORD_LIVE_USERS_WEBHOOK",

  // Benny: new accounts
  account_created: "DISCORD_NEW_USER_WEBHOOK",

  // Quinn: builder behavior (all go through funnel-interpreter.ts)
  builder_step_viewed: "DISCORD_FUNNEL_WEBHOOK",
  builder_step_completed: "DISCORD_FUNNEL_WEBHOOK",
  builder_closed: "DISCORD_FUNNEL_WEBHOOK",
  builder_saved_draft: "DISCORD_FUNNEL_WEBHOOK",

  // Other personas
  purchase_completed: "DISCORD_PURCHASES_WEBHOOK",
  app_error: "DISCORD_ERRORS_WEBHOOK",
  builder_error: "DISCORD_ERRORS_WEBHOOK",
  error_captured: "DISCORD_ERRORS_WEBHOOK",
  deploy_success: "DISCORD_SYSTEM_WEBHOOK",
  system_ok: "DISCORD_SYSTEM_WEBHOOK",
};

/** Send a text message to a Discord webhook. Returns ok/error without throwing. */
export async function sendToDiscord(
  webhookUrl: string | undefined,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl?.trim()) {
    return { ok: false, error: "webhook URL not configured" };
  }
  try {
    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      return { ok: false, error: `Discord returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}
