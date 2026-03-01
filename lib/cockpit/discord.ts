/**
 * Discord Cockpit helpers. Format PostHog events into short Discord messages
 * and send them to the appropriate webhooks (Lou, Quinn, Frank, Oscar, Bob).
 */

/** Safely get string from unknown props. */
function str(props: Record<string, unknown>, key: string): string {
  const v = props[key];
  return typeof v === "string" ? v : v != null ? String(v) : "—";
}

/** Format event + props into a short Discord message (under ~15 lines). */
export function formatDiscordMessage(
  event: string,
  props: Record<string, unknown>
): string {
  switch (event) {
    case "builder_opened":
      return [
        "👀 Lou spotted activity",
        `• Source: ${str(props, "source")}`,
        `• Returning: ${str(props, "returning") || "—"}`,
      ].join("\n");

    case "account_page_viewed":
      return [
        "👀 Lou spotted activity",
        `• Has journals: ${str(props, "has_existing_journals")}`,
      ].join("\n");

    case "builder_step_viewed":
      return [
        "📋 Quinn funnel",
        `• Step viewed: ${str(props, "step")}`,
      ].join("\n");

    case "builder_step_completed":
      return [
        "📋 Quinn funnel",
        `• Step completed: ${str(props, "step")}`,
        `• Date preset: ${str(props, "date_preset")}`,
        `• Cover: ${str(props, "cover_style")}`,
        `• Layout: ${str(props, "layout")}`,
      ].join("\n");

    case "builder_closed": {
      const reason = str(props, "reason");
      if (reason === "completed") {
        return [
          "📋 Quinn funnel",
          `• Step: ${str(props, "step")}`,
          "• Completed flow",
        ].join("\n");
      }
      return [
        "📋 Quinn flagged a drop-off",
        `• Step: ${str(props, "step")}`,
        `• Reason: ${reason}`,
      ].join("\n");
    }

    case "builder_saved_draft":
      return [
        "📋 Quinn logged a draft",
        `• Cover: ${str(props, "cover_style")}`,
        `• Layout: ${str(props, "layout")}`,
        `• Dates: ${str(props, "date_preset")}`,
      ].join("\n");

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
      return [
        `📌 ${event}`,
        Object.entries(props)
          .slice(0, 5)
          .map(([k, v]) => `• ${k}: ${v ?? "—"}`)
          .join("\n"),
      ].join("\n");
  }
}

/** Event → Discord webhook env var. Unknown events return null. */
export const EVENT_TO_WEBHOOK: Record<string, string> = {
  builder_opened: "DISCORD_LIVE_USERS_WEBHOOK",
  account_page_viewed: "DISCORD_LIVE_USERS_WEBHOOK",
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
