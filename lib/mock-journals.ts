/**
 * Mock journal data for /account. Replace with real API data when wired.
 */

import type { JournalDraft } from "./journal-draft";

export type JournalStatus = "Draft" | "Ready to print" | "Shipped";

export type Journal = {
  id: string;
  title: string;
  dateRangeLabel: string;
  activityCount: number;
  distanceLabel: string;
  status: JournalStatus;
  price: string | null;
  coverImageUrl: string | null;
};

export const MOCK_JOURNALS: Journal[] = [
  {
    id: "1",
    title: "2024 Running Journal",
    dateRangeLabel: "Jan–Dec 2024",
    activityCount: 312,
    distanceLabel: "1,842 mi",
    status: "Ready to print",
    price: "$39.99",
    coverImageUrl: null
  },
  {
    id: "2",
    title: "2023 Training Log",
    dateRangeLabel: "Jan–Dec 2023",
    activityCount: 287,
    distanceLabel: "1,521 mi",
    status: "Shipped",
    price: null,
    coverImageUrl: null
  },
  {
    id: "3",
    title: "Q1 2024 Cycling",
    dateRangeLabel: "Jan–Mar 2024",
    activityCount: 89,
    distanceLabel: "2,100 mi",
    status: "Draft",
    price: "$34.99",
    coverImageUrl: null
  }
];

/** Convert a JournalDraft to a Journal for display in the list (mock behavior). */
export function journalFromDraft(draft: JournalDraft, id: string): Journal {
  const dateLabel =
    draft.datePreset === "custom" && draft.dateStart && draft.dateEnd
      ? `${draft.dateStart} – ${draft.dateEnd}`
      : draft.datePreset === "thisYear"
        ? `${new Date().getFullYear()}`
        : "Last 12 months";
  return {
    id,
    title: draft.title,
    dateRangeLabel: dateLabel,
    activityCount: 0,
    distanceLabel: "—",
    status: "Draft",
    price: "$39.99",
    coverImageUrl: null
  };
}
