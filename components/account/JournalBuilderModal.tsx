"use client";

/**
 * Multi-step Journal Builder modal. Guided product builder flow.
 * Date range → Cover → Layout → Review. Premium Apple-like UX.
 * Focus trap, keyboard accessible, bottom-sheet on mobile.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { JournalDraft, DatePreset, CoverStyle, LayoutStyle } from "@/lib/journal-draft";
import { track } from "@/lib/analytics/posthog";

type BuilderCloseReason = "x_button" | "overlay_click" | "esc" | "completed";
type BuilderSource = "hero_cta" | "create_tile" | "other";

type Step = 1 | 2 | 3 | 4;

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "last12mo", label: "Last 12 months" },
  { id: "thisYear", label: "This year" },
  { id: "custom", label: "Custom" }
];

const COVER_OPTIONS: { id: CoverStyle; label: string; color: string }[] = [
  { id: "classicBlack", label: "Classic Black", color: "#231F20" },
  { id: "linen", label: "Linen", color: "#E8E4DC" },
  { id: "midnight", label: "Midnight", color: "#1a1a2e" },
  { id: "stone", label: "Stone", color: "#6B6B6B" },
  { id: "burgundy", label: "Burgundy", color: "#722F37" }
];

const LAYOUT_OPTIONS: { id: LayoutStyle; label: string; desc: string }[] = [
  { id: "minimal", label: "Minimal", desc: "Clean lines, plenty of whitespace" },
  { id: "detailed", label: "Detailed", desc: "More stats and notes per page" },
  { id: "photo", label: "Photo", desc: "Photo highlights alongside activities" }
];

/** Generate default title from draft (e.g. "2024 Training Journal") */
function generateTitle(draft: Partial<JournalDraft>): string {
  if (draft.datePreset === "thisYear") {
    const year = new Date().getFullYear();
    return `${year} Training Journal`;
  }
  if (draft.datePreset === "last12mo") {
    const now = new Date();
    const year = now.getFullYear();
    return `${year} Training Journal`;
  }
  if (draft.dateStart && draft.dateEnd) {
    const startYear = draft.dateStart.slice(0, 4);
    const endYear = draft.dateEnd.slice(0, 4);
    return startYear === endYear ? `${startYear} Training Journal` : `${startYear}–${endYear} Journal`;
  }
  return "My Training Journal";
}

type JournalBuilderModalProps = {
  open: boolean;
  source?: BuilderSource;
  onClose: () => void;
  onComplete?: (draft: JournalDraft) => void;
};

export function JournalBuilderModal({ open, source = "other", onClose, onComplete }: JournalBuilderModalProps) {
  const pathname = usePathname();
  const [step, setStep] = useState<Step>(1);
  const [closing, setClosing] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePreset>("last12mo");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [coverStyle, setCoverStyle] = useState<CoverStyle>("classicBlack");
  const [layout, setLayout] = useState<LayoutStyle>("minimal");
  const [title, setTitle] = useState("My Training Journal");

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const prevOpenRef = useRef(false);
  const lastStepRef = useRef<Step | null>(null);

  const buildDraft = useCallback((): JournalDraft => ({
    datePreset,
    ...(datePreset === "custom" && { dateStart, dateEnd }),
    coverStyle,
    layout,
    title: title.trim() || generateTitle({ datePreset, dateStart, dateEnd })
  }), [datePreset, dateStart, dateEnd, coverStyle, layout, title]);

  /** Close modal with reason for analytics. Fires builder_closed once, then resets state. */
  const closeModal = useCallback(
    (reason: BuilderCloseReason) => {
      track("builder_closed", { reason, step });
      setClosing(true);
      setTimeout(() => {
        setStep(1);
        setDatePreset("last12mo");
        setDateStart("");
        setDateEnd("");
        setCoverStyle("classicBlack");
        setLayout("minimal");
        setTitle("My Training Journal");
        lastStepRef.current = null;
        setClosing(false);
        triggerRef.current?.focus();
        onClose();
      }, 200);
    },
    [onClose, step]
  );

  const handleSaveDraft = useCallback(() => {
    const draft = buildDraft();
    track("builder_saved_draft", {
      date_preset: draft.datePreset,
      cover_style: draft.coverStyle,
      layout: draft.layout,
    });
    onComplete?.(draft);
    closeModal("completed");
  }, [buildDraft, onComplete, closeModal]);

  // Step 1 validation: if custom, need valid date range (end >= start)
  const isStep1Valid = datePreset !== "custom" || (!!dateStart && !!dateEnd && dateEnd >= dateStart);

  // Update generated title when moving to step 4
  useEffect(() => {
    if (step === 4 && title === "My Training Journal") {
      setTitle(generateTitle({ datePreset, dateStart, dateEnd }));
    }
  }, [step, datePreset, dateStart, dateEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) triggerRef.current = document.activeElement as HTMLElement | null;
  }, [open]);

  // builder_opened: fire once when modal transitions false -> true
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      track("builder_opened", { source, path: pathname ?? "/" });
    }
    prevOpenRef.current = open;
  }, [open, source, pathname]);

  // builder_step_viewed: fire once per step entry (avoid double-fire)
  useEffect(() => {
    if (!open) return;
    if (lastStepRef.current !== step) {
      lastStepRef.current = step;
      track("builder_step_viewed", { step });
    }
  }, [open, step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal("esc");
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeModal]);

  // Focus trap + focus first element on open
  useEffect(() => {
    if (!open || !modalRef.current) return;
    const el = modalRef.current;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener("keydown", handleTab);
    return () => el.removeEventListener("keydown", handleTab);
  }, [open, step]);

  if (!open) return null;

  const dateLabel =
    datePreset === "custom" && dateStart && dateEnd
      ? `${dateStart} – ${dateEnd}`
      : DATE_PRESETS.find((d) => d.id === datePreset)?.label ?? "";
  const coverLabel = COVER_OPTIONS.find((c) => c.id === coverStyle)?.label ?? "";
  const layoutLabel = LAYOUT_OPTIONS.find((l) => l.id === layout)?.label ?? "";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-[#231F20]/40 p-0 sm:p-4 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-builder-title"
      onClick={() => closeModal("overlay_click")}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-lg rounded-t-2xl border border-[#E5E5E5] sm:rounded-2xl bg-white p-6 sm:p-8 shadow-float max-h-[90vh] overflow-y-auto transition-transform duration-200 ${
          closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100 animate-modal-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="journal-builder-title" className="heading text-xl font-semibold text-[#231F20]">
            Create your journal
          </h2>
          <button
            type="button"
            onClick={() => closeModal("x_button")}
            className="rounded-full p-1.5 text-[#6B6B6B] transition hover:bg-[#F0F0F0] hover:text-[#231F20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 active:scale-[0.98]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex flex-1 gap-2">
            {([1, 2, 3, 4] as const).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  s <= step ? "bg-[#231F20]" : "bg-[#E5E5E5]"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#6B6B6B]">Step {step} of 4</span>
        </div>

        {/* Step 1: Date range */}
        {step === 1 && (
          <div>
            <h3 className="mb-4 text-sm font-medium text-[#231F20]">Choose dates</h3>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDatePreset(opt.id)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 active:scale-[0.98] ${
                    datePreset === opt.id
                      ? "border border-[#231F20] bg-[#231F20] text-white"
                      : "border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#231F20]/50 hover:bg-[#F5F5F5]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {datePreset === "custom" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="date-start" className="mb-1 block text-xs font-medium text-[#6B6B6B]">
                    Start date
                  </label>
                  <input
                    id="date-start"
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E5E5] px-4 py-2.5 text-sm text-[#231F20] focus:border-[#231F20] focus:outline-none focus:ring-1 focus:ring-[#231F20]"
                  />
                </div>
                <div>
                  <label htmlFor="date-end" className="mb-1 block text-xs font-medium text-[#6B6B6B]">
                    End date
                  </label>
                  <input
                    id="date-end"
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    min={dateStart}
                    className="w-full rounded-xl border border-[#E5E5E5] px-4 py-2.5 text-sm text-[#231F20] focus:border-[#231F20] focus:outline-none focus:ring-1 focus:ring-[#231F20]"
                  />
                </div>
                {dateStart && dateEnd && dateEnd < dateStart && (
                  <p className="text-sm text-amber-700">End date must be on or after start date.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Cover */}
        {step === 2 && (
          <div>
            <h3 className="mb-4 text-sm font-medium text-[#231F20]">Pick a cover</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COVER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCoverStyle(opt.id)}
                  className={`group flex flex-col items-center gap-2 rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 active:scale-[0.98] ${
                    coverStyle === opt.id
                      ? "border-[#231F20] shadow-[0_0_0_1px_#231F20]"
                      : "border-[#E5E5E5] hover:border-[#231F20]/30 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]"
                  }`}
                >
                  <div
                    className="h-14 w-10 rounded-lg border border-[#E5E5E5] transition group-hover:shadow-sm"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-center text-xs font-medium text-[#231F20]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Layout */}
        {step === 3 && (
          <div>
            <h3 className="mb-4 text-sm font-medium text-[#231F20]">Choose layout</h3>
            <div className="space-y-3">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayout(opt.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 active:scale-[0.98] ${
                    layout === opt.id
                      ? "border-[#231F20] bg-[#F5F5F5]"
                      : "border-[#E5E5E5] hover:border-[#231F20]/30 hover:bg-[#FAFAFA]"
                  }`}
                >
                  <LayoutPreview type={opt.id} />
                  <div>
                    <span className="block text-sm font-medium text-[#231F20]">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-[#6B6B6B]">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h3 className="mb-4 text-sm font-medium text-[#231F20]">Review</h3>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
              <div className="flex gap-4">
                <div
                  className="h-24 w-16 flex-shrink-0 rounded-lg border border-[#E5E5E5]"
                  style={{
                    backgroundColor: COVER_OPTIONS.find((c) => c.id === coverStyle)?.color ?? "#231F20"
                  }}
                />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="heading w-full border-0 bg-transparent text-base font-semibold text-[#231F20] focus:outline-none focus:ring-0"
                    placeholder="Journal title"
                  />
                  <p className="mt-1 text-sm text-[#6B6B6B]">{dateLabel}</p>
                  <p className="mt-0.5 text-sm text-[#6B6B6B]">
                    {coverLabel} · {layoutLabel}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#231F20]">$39.99</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer: Back / Next / Submit */}
        <div className="mt-8 flex justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="rounded-full border border-[#E5E5E5] px-6 py-2.5 text-sm font-medium text-[#231F20] transition hover:bg-[#F5F5F5] active:scale-[0.98]"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                const currentStep = step;
                const props: Record<string, unknown> = { step: currentStep };
                if (currentStep >= 1) props.date_preset = datePreset;
                if (currentStep >= 2) props.cover_style = coverStyle;
                if (currentStep >= 3) props.layout = layout;
                track("builder_step_completed", props);
                setStep((s) => (s + 1) as Step);
              }}
              disabled={!isStep1Valid}
              className="button-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
            >
              Next
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-full border border-[#E5E5E5] px-6 py-2.5 text-sm font-medium text-[#231F20] transition hover:bg-[#F5F5F5] active:scale-[0.98]"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="button-primary cursor-not-allowed opacity-60 px-6 py-2.5 text-sm active:scale-[0.98] transition-transform"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small preview diagram for layout options */
function LayoutPreview({ type }: { type: LayoutStyle }) {
  const base = "flex h-12 w-16 items-center justify-center rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]";
  if (type === "minimal") {
    return (
      <div className={base}>
        <svg viewBox="0 0 48 36" className="h-8 w-10 text-[#231F20]/30" fill="currentColor">
          <rect x="4" y="4" width="40" height="4" rx="1" />
          <rect x="4" y="12" width="32" height="4" rx="1" />
          <rect x="4" y="20" width="36" height="4" rx="1" />
          <rect x="4" y="28" width="28" height="4" rx="1" />
        </svg>
      </div>
    );
  }
  if (type === "detailed") {
    return (
      <div className={base}>
        <svg viewBox="0 0 48 36" className="h-8 w-10 text-[#231F20]/30" fill="currentColor">
          <rect x="4" y="2" width="40" height="6" rx="1" />
          <rect x="4" y="10" width="12" height="4" rx="1" />
          <rect x="18" y="10" width="26" height="4" rx="1" />
          <rect x="4" y="16" width="12" height="4" rx="1" />
          <rect x="18" y="16" width="26" height="4" rx="1" />
          <rect x="4" y="24" width="40" height="6" rx="1" />
        </svg>
      </div>
    );
  }
  if (type === "photo") {
    return (
      <div className={base}>
        <svg viewBox="0 0 48 36" className="h-8 w-10 text-[#231F20]/30" fill="currentColor">
          <rect x="4" y="4" width="18" height="14" rx="1" />
          <rect x="26" y="4" width="18" height="8" rx="1" />
          <rect x="26" y="14" width="18" height="4" rx="1" />
          <rect x="4" y="20" width="40" height="4" rx="1" />
          <rect x="4" y="26" width="40" height="4" rx="1" />
        </svg>
      </div>
    );
  }
  return null;
}
