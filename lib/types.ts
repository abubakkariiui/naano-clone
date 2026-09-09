export type Role = "brand" | "creator";

export type Vertical =
  | "Sales-tech"
  | "RevOps"
  | "Devtools"
  | "Product"
  | "HR-tech"
  | "Fintech"
  | "Marketing-ops"
  | "Vertical SaaS";

export const VERTICALS: Vertical[] = [
  "Sales-tech",
  "RevOps",
  "Devtools",
  "Product",
  "HR-tech",
  "Fintech",
  "Marketing-ops",
  "Vertical SaaS",
];

export type Seniority = "Founder / C-level" | "VP / Head" | "Manager" | "IC";
export const SENIORITIES: Seniority[] = ["Founder / C-level", "VP / Head", "Manager", "IC"];

export type Func = "Sales" | "Marketing" | "Engineering" | "Product" | "People" | "Finance";
export const FUNCTIONS: Func[] = ["Sales", "Marketing", "Engineering", "Product", "People", "Finance"];

/** Audience make-up as weights that sum to ~1 within each dimension. */
export interface Audience {
  verticals: Partial<Record<Vertical, number>>;
  seniority: Partial<Record<Seniority, number>>;
  functions: Partial<Record<Func, number>>;
  countries: string[];
}

export interface Creator {
  id: string;
  name: string;
  headline: string;
  vertical: Vertical;
  followers: number;
  /** Flat fee per post, set by the creator. Naano's model: from EUR 20. */
  pricePerPost: number;
  avatarSeed: string;
  audience: Audience;
  stats: { avgImpressions: number; avgClicks: number; avgLeads: number };
  rating: number;
  reviews: number;
  deliveryDays: number;
  verified: boolean;
  languages: string[];
  bio: string;
  samplePost: string;
}

export interface Brand {
  id: string;
  company: string;
  website: string;
  vertical: Vertical;
  plan: "Self-Serve" | "Managed";
}

export type CampaignStatus = "draft" | "live" | "completed";

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  objective: "Pipeline" | "Awareness" | "Product launch" | "Hiring";
  status: CampaignStatus;
  budget: number;
  keyMessages: string[];
  guidelines: string[];
  doNots: string[];
  targetVerticals: Vertical[];
  targetSeniority: Seniority[];
  targetFunctions: Func[];
  trackingBase: string;
  createdAt: string;
  landingUrl: string;
}

/**
 * The spine of the product. Every screen on both sides is a projection of this.
 * Brands see a pipeline of bookings; creators see the same rows as offers.
 */
export type BookingStatus =
  | "invited"
  | "declined"
  | "accepted"
  | "draft_submitted"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "live"
  | "completed";

export const BOOKING_FLOW: BookingStatus[] = [
  "invited",
  "accepted",
  "draft_submitted",
  "approved",
  "scheduled",
  "live",
  "completed",
];

export interface Booking {
  id: string;
  campaignId: string;
  creatorId: string;
  pricePerPost: number;
  fitScore: number;
  status: BookingStatus;
  draft?: { body: string; revision: number; submittedAt: string };
  feedback?: string;
  postUrl?: string;
  publishedAt?: string;
  scheduledFor?: string;
  metrics?: { impressions: number; clicks: number; leads: number; pipeline: number };
  payout: { contract: boolean; invoice: boolean; paid: boolean; paidAt?: string };
  events: { at: string; label: string; by: Role | "naano" }[];
}

export interface AppState {
  role: Role;
  brandId: string;
  creatorId: string;
  creators: Creator[];
  brands: Brand[];
  campaigns: Campaign[];
  bookings: Booking[];
  shortlist: string[];
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  invited: "Invited",
  declined: "Declined",
  accepted: "Accepted",
  draft_submitted: "Draft ready",
  changes_requested: "Changes requested",
  approved: "Approved",
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
};
