/**
 * Journal draft type for the Journal Builder flow.
 * Used when saving a draft or completing the builder.
 */

export type DatePreset = "last12mo" | "thisYear" | "custom";

export type CoverStyle = "classicBlack" | "linen" | "midnight" | "stone" | "burgundy";

export type LayoutStyle = "minimal" | "detailed" | "photo";

export type JournalDraft = {
  datePreset: DatePreset;
  dateStart?: string;
  dateEnd?: string;
  coverStyle: CoverStyle;
  layout: LayoutStyle;
  title: string;
};
