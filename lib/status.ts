import type { BookingStatus } from "./types";

export type Tone = "neutral" | "brand" | "good" | "warn" | "bad";

/** One place deciding how each pipeline state reads, so both sides agree. */
export const STATUS_TONE: Record<BookingStatus, Tone> = {
  invited: "neutral",
  declined: "bad",
  accepted: "brand",
  draft_submitted: "warn",
  changes_requested: "warn",
  approved: "brand",
  scheduled: "brand",
  live: "good",
  completed: "good",
};
