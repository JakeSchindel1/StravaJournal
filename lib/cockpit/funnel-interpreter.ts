/**
 * Stateful interpreter for builder funnel events.
 *
 * Instead of forwarding raw analytics events to Discord, this module tracks
 * what's happening in a session and translates meaningful changes into short,
 * observational messages from Quinn (our funnel persona).
 *
 * State is stored in memory, keyed by session_id. This is intentionally simple —
 * sessions are short-lived and the state only needs to survive for the duration
 * of a single builder session. Note: on serverless platforms (e.g. Vercel),
 * warm function instances are reused, so this works well in practice. If you
 * need guaranteed persistence across cold starts, swap the Map for Redis/Supabase.
 */

type SessionState = {
  lastStep: number | null; // Most recent step this session visited
  cover: string | null;    // Cover style chosen (null until step 2 is completed)
  layout: string | null;   // Layout chosen (null until step 3 is completed)
};

/** Human-readable labels for cover style IDs, matching JournalBuilderModal. */
const COVER_LABELS: Record<string, string> = {
  classicBlack: "Classic Black",
  linen: "Linen",
  midnight: "Midnight",
  stone: "Stone",
  burgundy: "Burgundy",
};

// In-memory session store. Sessions are cleaned up on builder_closed.
const sessions = new Map<string, SessionState>();

function getSession(id: string): SessionState {
  if (!sessions.has(id)) {
    sessions.set(id, { lastStep: null, cover: null, layout: null });
  }
  return sessions.get(id)!;
}

/**
 * Interpret a funnel event and return a short, conversational Discord message
 * for Quinn, or null if the event should be silently ignored.
 *
 * Handles: builder_step_viewed, builder_step_completed, builder_closed
 *
 * Rules:
 *  1. Repeated views of the same step are ignored (anti-spam).
 *  2. Step increase  → "Moving along nicely."
 *  3. Cover defined  → "${cover} cover picked."
 *  4. Layout defined → "Layout locked in."
 *  5. Step decrease  → "They went back to reconsider something."
 *  6. Closed early   → "Session ended during Step ${step}."
 */
export function interpretFunnelEvent(
  eventName: string,
  sessionId: string,
  props: Record<string, unknown>
): string | null {
  const session = getSession(sessionId);

  // ── Rule 1, 2, 5: Detect meaningful step changes ──────────────────────────
  if (eventName === "builder_step_viewed") {
    const step = Number(props.step);
    if (!Number.isFinite(step)) return null;

    const prev = session.lastStep;

    // Same step as before — ignore (deduplication / spam prevention)
    if (prev !== null && prev === step) return null;

    session.lastStep = step;

    // First time we see this session — nothing to compare against yet
    if (prev === null) return null;

    if (step > prev) return "📋 Quinn: Moving along nicely.";
    if (step < prev) return "📋 Quinn: They went back to reconsider something.";
    return null;
  }

  // ── Rules 3, 4: Detect when cover or layout first become defined ───────────
  if (eventName === "builder_step_completed") {
    const messages: string[] = [];

    // Cover is sent on step 2 completion
    const coverStyle = typeof props.cover_style === "string" ? props.cover_style : null;
    if (coverStyle && !session.cover) {
      session.cover = coverStyle;
      const label = COVER_LABELS[coverStyle] ?? coverStyle;
      messages.push(`📋 Quinn: ${label} cover picked.`);
    }

    // Layout is sent on step 3 completion
    const layout = typeof props.layout === "string" ? props.layout : null;
    if (layout && !session.layout) {
      session.layout = layout;
      messages.push("📋 Quinn: Layout locked in.");
    }

    return messages.length > 0 ? messages.join("\n") : null;
  }

  // ── Rule 6: Session ended early ────────────────────────────────────────────
  if (eventName === "builder_closed") {
    const reason = typeof props.reason === "string" ? props.reason : "";
    const step = session.lastStep ?? Number(props.step);

    // Clean up now — the builder is done regardless of reason
    sessions.delete(sessionId);

    // Completed sessions don't need a drop-off message
    if (reason === "completed") return null;

    return `📋 Quinn: Session ended during Step ${step}.`;
  }

  return null;
}
