/**
 * Stateful interpreter for builder funnel events.
 *
 * Quinn only: interprets meaningful builder behavior (friction, milestones, drop-offs).
 * Lou is NOT emitted here — Lou handles top-of-funnel events (landing_page_viewed,
 * get_started_clicked, builder_opened) directly from the webhook route.
 *
 * State is stored in memory, keyed by session_id. Sessions are short-lived.
 */

type SessionState = {
  lastStep: number | null;
  cover: string | null;
  layout: string | null;
};

/** Human-readable labels for cover style IDs, matching JournalBuilderModal. */
const COVER_LABELS: Record<string, string> = {
  classicBlack: "Classic Black",
  linen: "Linen",
  midnight: "Midnight",
  stone: "Stone",
  burgundy: "Burgundy",
};

/** Human-readable labels for layout IDs. */
const LAYOUT_LABELS: Record<string, string> = {
  minimal: "Minimal",
  detailed: "Detailed",
  photo: "Photo",
};

const sessions = new Map<string, SessionState>();

function getSession(id: string): SessionState {
  if (!sessions.has(id)) {
    sessions.set(id, { lastStep: null, cover: null, layout: null });
  }
  return sessions.get(id)!;
}

/**
 * Interpret a funnel event and return a short Quinn message, or null to suppress.
 *
 * Quinn emits only for:
 * - First cover chosen
 * - First layout chosen
 * - Step goes backward
 * - builder_closed when not completed
 *
 * Does NOT emit for: step increases ("Moving along nicely"), every step completion.
 */
export function interpretFunnelEvent(
  eventName: string,
  sessionId: string,
  props: Record<string, unknown>
): string | null {
  const session = getSession(sessionId);

  // ── Step viewed: only emit when they go backward ──────────────────────────
  if (eventName === "builder_step_viewed") {
    const step = Number(props.step);
    if (!Number.isFinite(step)) return null;

    const prev = session.lastStep;
    if (prev !== null && prev === step) return null; // Same step — ignore

    session.lastStep = step;

    // Only Quinn speaks when they back up; step increases are silent
    if (prev !== null && step < prev) {
      return "📋 Quinn: They backed up a step.";
    }
    return null;
  }

  // ── Step completed: only emit for first cover or first layout (milestones) ──
  if (eventName === "builder_step_completed") {
    const messages: string[] = [];

    const coverStyle = typeof props.cover_style === "string" ? props.cover_style : null;
    if (coverStyle && !session.cover) {
      session.cover = coverStyle;
      const label = COVER_LABELS[coverStyle] ?? coverStyle;
      messages.push(`📋 Quinn: ${label} cover chosen.`);
    }

    const layout = typeof props.layout === "string" ? props.layout : null;
    if (layout && !session.layout) {
      session.layout = layout;
      const label = LAYOUT_LABELS[layout] ?? layout;
      messages.push(`📋 Quinn: ${label} layout chosen.`);
    }

    return messages.length > 0 ? messages.join("\n") : null;
  }

  // ── Builder closed without completing ─────────────────────────────────────
  if (eventName === "builder_closed") {
    const reason = typeof props.reason === "string" ? props.reason : "";
    const step = session.lastStep ?? Number(props.step);

    sessions.delete(sessionId);

    if (reason === "completed") return null;

    return `📋 Quinn: They left after reaching Step ${step}.`;
  }

  return null;
}
