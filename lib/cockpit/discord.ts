/**
 * Discord Cockpit helpers. Format PostHog events into short Discord messages
 * and send them to the appropriate webhooks (Lou, Quinn, Frank, Oscar, Bob).
 *
 * Lou: presence / arrivals / top-of-funnel only. Short, observational, no bullets.
 * Quinn: interpretation / friction / meaningful builder behavior only.
 * Privacy: no email, IP, full URLs, or raw PostHog property dumps.
 */

/** Human-readable labels for cover/layout (matches JournalBuilderModal). */
const COVER_LABELS: Record<string, string> = {
  classicBlack: "Classic Black",
  linen: "Linen",
  midnight: "Midnight",
  stone: "Stone",
  burgundy: "Burgundy",
};
const LAYOUT_LABELS: Record<string, string> = {
  minimal: "Minimal",
  detailed: "Detailed",
  photo: "Photo",
};

/** Safely get string from unknown props. */
function str(props: Record<string, unknown>, key: string): string {
  const v = props[key];
  return typeof v === "string" ? v : v != null ? String(v) : "—";
}

/**
 * Format event + props into a short Discord message.
 * Lou events: short, observational, no bullets.
 * Quinn events: inspector voice, short, useful.
 */
export function formatDiscordMessage(
  event: string,
  props: Record<string, unknown>
): string {
  switch (event) {
    // ── Lou: top-of-funnel only ─────────────────────────────────────────────
    case "landing_page_viewed":
      return "👀 Lou: Someone landed on the site.";

    case "get_started_clicked":
      return "👀 Lou: Get Started got a click.";

    case "builder_opened":
      return "👀 Lou: Builder opened.";

    // ── Quinn: meaningful builder behavior ─────────────────────────────────
    case "builder_saved_draft": {
      const coverId = str(props, "cover_style");
      const layoutId = str(props, "layout");
      const cover = COVER_LABELS[coverId] ?? coverId;
      const layout = LAYOUT_LABELS[layoutId] ?? layoutId;
      return `📋 Quinn: Draft saved — ${cover} cover, ${layout} layout.`;
    }

    // ── Other personas (unchanged) ──────────────────────────────────────────
    case "purchase_completed":
      return [
        "💰 Frank logged a purchase",
        `• Order: ${str(props, "order_id")}`,
        `• Amount: ${str(props, "amount")}`,
      ].join("\n");

    case "app_error":
    case "builder_error":
    case "error_captured":
      return [
        "🚨 Oscar dropped something",
        `• Where: ${str(props, "where") || str(props, "location") || "unknown"}`,
        `• Error: ${str(props, "message") || str(props, "error") || "—"}`,
      ].join("\n");

    case "deploy_success":
    case "system_ok":
      return [
        "⚙️ Bob system",
        `• Event: ${event}`,
        `• Message: ${str(props, "message") || "ok"}`,
      ].join("\n");

    default:
      // Privacy-safe: event name only, no property dump
      return `📌 ${event}`;
  }
}

/** Event → Discord webhook env var. Lou = live users, Quinn = funnel. */
export const EVENT_TO_WEBHOOK: Record<string, string> = {
  // Lou: top-of-funnel arrivals only
  landing_page_viewed: "DISCORD_LIVE_USERS_WEBHOOK",
  get_started_clicked: "DISCORD_LIVE_USERS_WEBHOOK",
  builder_opened: "DISCORD_LIVE_USERS_WEBHOOK",

  // Quinn: funnel interpretation (builder_step_*, builder_closed go through interpreter)
  builder_step_viewed: "DISCORD_FUNNEL_WEBHOOK",
  builder_step_completed: "DISCORD_FUNNEL_WEBHOOK",
  builder_closed: "DISCORD_FUNNEL_WEBHOOK",
  builder_saved_draft: "DISCORD_FUNNEL_WEBHOOK",

  purchase_completed: "DISCORD_PURCHASES_WEBHOOK",
  app_error: "DISCORD_ERRORS_WEBHOOK",
  builder_error: "DISCORD_ERRORS_WEBHOOK",
  error_captured: "DISCORD_ERRORS_WEBHOOK",
  deploy_success: "DISCORD_SYSTEM_WEBHOOK",
  system_ok: "DISCORD_SYSTEM_WEBHOOK",
};

/** Send a text message to a Discord webhook. Fails silently if URL missing. */
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
