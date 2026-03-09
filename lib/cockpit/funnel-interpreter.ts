/**
 * Stateful interpreter for builder funnel events.
 *
 * Quinn only: interprets meaningful builder behavior (milestones, friction, drop-offs).
 * Lou is NOT emitted here — Lou handles top-of-funnel events directly in the webhook route.
 *
 * Session state is stored in-memory, keyed by session_id. Sessions are cleaned up
 * automatically after 15 minutes of inactivity — no background timers needed.
 */

import { getCockpitTag } from "./cockpit-tag";

type SessionState = {
  sessionId: string;
  lastStep?: number;
  highestStep?: number;
  cover?: string;
  layout?: string;
  firstSeenAt: number;
  lastActivityAt: number;
  hesitationCount: number;
  stepVisitCounts: Record<number, number>;
  emittedFlags: {
    coverChosen?: boolean;
    layoutChosen?: boolean;
    hesitationOnStep2?: boolean;
    hesitationOnStep3?: boolean;
    abandonmentSent?: boolean;
  };
};

/** What the interpreter returns. Speaker is always "quinn" — never "lou". */
export type InterpretedMessage = {
  speaker: "quinn";
  message: string;
} | null;

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

/** How long (in seconds) idle on step 2 or 3 before flagging as a stall. */
const STALL_SECONDS = 30;

/** Sessions inactive longer than this are pruned. */
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

const sessions = new Map<string, SessionState>();

function getSession(id: string): SessionState {
  if (!sessions.has(id)) {
    const now = Date.now();
    sessions.set(id, {
      sessionId: id,
      firstSeenAt: now,
      lastActivityAt: now,
      hesitationCount: 0,
      stepVisitCounts: {},
      emittedFlags: {},
    });
  }
  return sessions.get(id)!;
}

/** Lightweight cleanup — removes sessions idle for more than 15 minutes. */
function cleanupSessions(): void {
  const cutoff = Date.now() - SESSION_TIMEOUT_MS;
  for (const [id, session] of sessions) {
    if (session.lastActivityAt < cutoff) sessions.delete(id);
  }
}

/** Convenience wrapper so every return site has the right speaker label. */
function quinn(message: string): InterpretedMessage {
  return { speaker: "quinn", message };
}

/**
 * Interpret a funnel event and return a Quinn message, or null to suppress.
 *
 * Quinn detects:
 *   - First cover chosen / cover changed after selection
 *   - First layout chosen / layout changed after selection
 *   - Step backward
 *   - Hesitation (step visited 3+ times, or stall on step 2/3 for 30+ seconds)
 *   - Abandonment (builder_closed before completion)
 *
 * Never emits Lou-style arrival messages.
 */
export function interpretFunnelEvent(
  eventName: string,
  sessionId: string,
  properties: Record<string, unknown>,
  distinctId: string | null = null
): InterpretedMessage {
  cleanupSessions();

  const session = getSession(sessionId);
  const tag = getCockpitTag({ properties, distinctId });
  // Convenience suffix so every message just appends `t` without an if-check
  const t = tag ? ` ${tag}` : "";
  const now = Date.now();

  // ── builder_step_viewed ──────────────────────────────────────────────────
  if (eventName === "builder_step_viewed") {
    const step = Number(properties.step);
    if (!Number.isFinite(step)) return null;

    const prev = session.lastStep;

    // Stall detection: idle >30s on the PREVIOUS step (2 or 3), before any updates
    const idleSecs = (now - session.lastActivityAt) / 1000;
    const prevIsStallStep = prev === 2 || prev === 3;
    const prevHesitFlag = prev === 2
      ? "hesitationOnStep2"
      : prev === 3
      ? "hesitationOnStep3"
      : null;
    const wasStalled =
      idleSecs > STALL_SECONDS &&
      prevIsStallStep &&
      prevHesitFlag !== null &&
      !session.emittedFlags[prevHesitFlag];

    // Now update session for the new step
    session.lastActivityAt = now;
    session.stepVisitCounts[step] = (session.stepVisitCounts[step] ?? 0) + 1;
    session.lastStep = step;
    if (session.highestStep === undefined || step > session.highestStep) {
      session.highestStep = step;
    }

    // Stall message takes priority (it happened on the step they just left)
    if (wasStalled && prevHesitFlag && prev !== undefined) {
      session.emittedFlags[prevHesitFlag] = true;
      const msg =
        prev === 2
          ? `📋 Quinn: They paused on layout for a bit.${t}`
          : `📋 Quinn: They paused on Step ${prev} for a bit.${t}`;
      return quinn(msg);
    }

    // Step went backward
    if (prev !== undefined && step < prev) {
      return quinn(`📋 Quinn: They backed up a step.${t}`);
    }

    // Same step visited 3+ times — only emit once per step per session
    const visits = session.stepVisitCounts[step] ?? 0;
    if (step === 2 && visits >= 3 && !session.emittedFlags.hesitationOnStep2) {
      session.emittedFlags.hesitationOnStep2 = true;
      return quinn(`📋 Quinn: They seem stuck on cover selection.${t}`);
    }
    if (step === 3 && visits >= 3 && !session.emittedFlags.hesitationOnStep3) {
      session.emittedFlags.hesitationOnStep3 = true;
      return quinn(`📋 Quinn: They're circling around Step 3.${t}`);
    }

    return null;
  }

  // ── builder_step_completed ───────────────────────────────────────────────
  if (eventName === "builder_step_completed") {
    session.lastActivityAt = now;

    // Cover milestone or cover change
    const coverStyle = typeof properties.cover_style === "string" ? properties.cover_style : null;
    if (coverStyle) {
      if (!session.emittedFlags.coverChosen) {
        // First cover chosen
        session.cover = coverStyle;
        session.emittedFlags.coverChosen = true;
        const label = COVER_LABELS[coverStyle] ?? coverStyle;
        return quinn(`📋 Quinn: ${label} cover chosen.${t}`);
      }
      if (session.cover !== coverStyle) {
        // Changed their mind on the cover after already choosing
        session.cover = coverStyle;
        return quinn(`📋 Quinn: They changed their mind on the cover.${t}`);
      }
    }

    // Layout milestone or layout change
    const layout = typeof properties.layout === "string" ? properties.layout : null;
    if (layout) {
      if (!session.emittedFlags.layoutChosen) {
        // First layout chosen
        session.layout = layout;
        session.emittedFlags.layoutChosen = true;
        const label = LAYOUT_LABELS[layout] ?? layout;
        return quinn(`📋 Quinn: ${label} layout chosen.${t}`);
      }
      if (session.layout !== layout) {
        // Changed their mind on the layout after already choosing
        session.layout = layout;
        return quinn(`📋 Quinn: They're hesitating on layout.${t}`);
      }
    }

    return null;
  }

  // ── builder_saved_draft ──────────────────────────────────────────────────
  if (eventName === "builder_saved_draft") {
    session.lastActivityAt = now;
    return quinn(`📋 Quinn: They saved a draft.${t}`);
  }

  // ── builder_closed ───────────────────────────────────────────────────────
  if (eventName === "builder_closed") {
    const completed =
      properties.completed === true || properties.reason === "completed";
    const step = session.lastStep ?? Number(properties.step);

    // Always clean up the session when the builder closes
    sessions.delete(sessionId);

    if (completed) return null;

    return quinn(`📋 Quinn: They left after reaching Step ${step}.${t}`);
  }

  return null;
}
