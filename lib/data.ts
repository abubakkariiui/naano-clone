import type {
  Audience,
  Booking,
  Brand,
  Campaign,
  Creator,
  Func,
  Seniority,
  Vertical,
} from "./types";

/**
 * Seeded from Naano's own published figures (naano.com/llms.txt, Q1 2026
 * marketplace data): flat fee per post from EUR 20 up to EUR 400-1,500 for high
 * tiers, ~12% average CTR on creator posts, ~EUR 18 average cost per qualified
 * click. Using their real economics rather than invented ones keeps the demo
 * honest.
 */

type Spec = {
  name: string;
  headline: string;
  vertical: Vertical;
  followers: number;
  price: number;
  /** reach as a share of followers, CTR %, qualified-lead rate % of clicks */
  reach: number;
  ctr: number;
  leadRate: number;
  rating: number;
  reviews: number;
  days: number;
  langs: string[];
  /** audience concentration in the primary vertical, 0-1 */
  focus: number;
  seniority: Partial<Record<Seniority, number>>;
  functions: Partial<Record<Func, number>>;
  countries: string[];
  bio: string;
  post: string;
};

const SPECS: Spec[] = [
  {
    name: "Thomas Higadère",
    headline: "Prospecting workflows for wealth managers · B2B & AI",
    vertical: "Sales-tech",
    followers: 34000, price: 890, reach: 0.82, ctr: 12.6, leadRate: 4.2,
    rating: 4.9, reviews: 41, days: 4, langs: ["English", "French"], focus: 0.62,
    seniority: { "Founder / C-level": 0.22, "VP / Head": 0.41, Manager: 0.28, IC: 0.09 },
    functions: { Sales: 0.58, Marketing: 0.18, Finance: 0.14, Product: 0.1 },
    countries: ["France", "Belgium", "Switzerland", "UK"],
    bio: "I write about what actually happens inside sales teams when you hand them an AI tool and walk away. Mostly unflattering, occasionally useful.",
    post: "How AI changed our prospecting workflow for wealth managers and private bankers.",
  },
  {
    name: "Robin Tempe",
    headline: "Running an entire prospecting motion through AI · Sales & AI",
    vertical: "Sales-tech",
    followers: 12000, price: 340, reach: 0.94, ctr: 14.1, leadRate: 5.6,
    rating: 4.8, reviews: 27, days: 3, langs: ["English"], focus: 0.71,
    seniority: { "Founder / C-level": 0.31, "VP / Head": 0.34, Manager: 0.25, IC: 0.1 },
    functions: { Sales: 0.66, Marketing: 0.16, Product: 0.11, Engineering: 0.07 },
    countries: ["UK", "Ireland", "Netherlands"],
    bio: "Ex-SDR turned solo operator. I run a full outbound motion alone and publish the actual numbers, including the months it does not work.",
    post: "I run my entire prospecting workflow through an AI. Here is how.",
  },
  {
    name: "Eric Djavid",
    headline: "Sales Leader · Fixing how teams pick leads",
    vertical: "Sales-tech",
    followers: 40000, price: 1150, reach: 0.76, ctr: 11.2, leadRate: 3.8,
    rating: 4.9, reviews: 58, days: 5, langs: ["English", "French"], focus: 0.54,
    seniority: { "Founder / C-level": 0.28, "VP / Head": 0.44, Manager: 0.21, IC: 0.07 },
    functions: { Sales: 0.61, Marketing: 0.2, Finance: 0.1, Product: 0.09 },
    countries: ["France", "Spain", "Italy", "Germany"],
    bio: "Twelve years leading enterprise sales teams. I care about pipeline quality over activity metrics and I will say so at length.",
    post: "Most sales teams spend 80% of their time on the wrong leads. Here is how I changed that.",
  },
  {
    name: "Marina Panova",
    headline: "The 30-day LinkedIn content system · B2B content",
    vertical: "Marketing-ops",
    followers: 34000, price: 780, reach: 0.98, ctr: 13.4, leadRate: 4.6,
    rating: 4.9, reviews: 63, days: 3, langs: ["English", "German"], focus: 0.58,
    seniority: { "Founder / C-level": 0.26, "VP / Head": 0.3, Manager: 0.32, IC: 0.12 },
    functions: { Marketing: 0.64, Sales: 0.17, Product: 0.11, People: 0.08 },
    countries: ["Germany", "Austria", "Poland", "UK"],
    bio: "I build content systems for B2B teams that do not have a content team. Templates, cadences, and the unglamorous editing work.",
    post: "How I build my 30-day LinkedIn content system, the exact playbook.",
  },
  {
    name: "Priya Raghunathan",
    headline: "RevOps · Making the funnel legible",
    vertical: "RevOps",
    followers: 8600, price: 260, reach: 1.02, ctr: 15.2, leadRate: 6.1,
    rating: 5.0, reviews: 19, days: 3, langs: ["English"], focus: 0.79,
    seniority: { "VP / Head": 0.38, Manager: 0.42, "Founder / C-level": 0.13, IC: 0.07 },
    functions: { Sales: 0.34, Marketing: 0.31, Finance: 0.22, Product: 0.13 },
    countries: ["UK", "India", "Singapore"],
    bio: "Small audience, extremely specific one. If you sell to RevOps, these are the people who sign off on it.",
    post: "Your pipeline review is a fiction if nobody owns stage definitions. A fix, in four steps.",
  },
  {
    name: "Jonas Lindqvist",
    headline: "Devtools · Shipping in public",
    vertical: "Devtools",
    followers: 21000, price: 540, reach: 0.88, ctr: 12.9, leadRate: 4.4,
    rating: 4.7, reviews: 34, days: 4, langs: ["English", "Swedish"], focus: 0.74,
    seniority: { IC: 0.44, Manager: 0.27, "VP / Head": 0.19, "Founder / C-level": 0.1 },
    functions: { Engineering: 0.72, Product: 0.18, Marketing: 0.06, Sales: 0.04 },
    countries: ["Sweden", "Norway", "Denmark", "Germany"],
    bio: "Staff engineer. I review developer tools the way an engineer actually evaluates them, which means I will find the rough edges.",
    post: "I replaced our CI pipeline in a weekend. Here is what broke and what it cost.",
  },
  {
    name: "Aya Nakamura",
    headline: "Product management · Discovery that is not theatre",
    vertical: "Product",
    followers: 17500, price: 460, reach: 0.91, ctr: 12.2, leadRate: 4.8,
    rating: 4.8, reviews: 29, days: 4, langs: ["English", "Japanese"], focus: 0.69,
    seniority: { Manager: 0.39, "VP / Head": 0.31, IC: 0.2, "Founder / C-level": 0.1 },
    functions: { Product: 0.68, Engineering: 0.15, Marketing: 0.11, Sales: 0.06 },
    countries: ["Japan", "Singapore", "Australia", "UK"],
    bio: "I write about product discovery for teams under real deadline pressure. No frameworks for their own sake.",
    post: "We killed our roadmap and replaced it with three questions. Six months on.",
  },
  {
    name: "Nada Belkacem",
    headline: "HR-tech · Hiring systems for small teams",
    vertical: "HR-tech",
    followers: 14200, price: 380, reach: 0.95, ctr: 13.8, leadRate: 5.2,
    rating: 4.9, reviews: 37, days: 3, langs: ["English", "French", "Arabic"], focus: 0.76,
    seniority: { "VP / Head": 0.36, Manager: 0.34, "Founder / C-level": 0.22, IC: 0.08 },
    functions: { People: 0.7, Marketing: 0.11, Sales: 0.1, Finance: 0.09 },
    countries: ["France", "Morocco", "UAE", "UK"],
    bio: "Head of People turned writer. I cover hiring and onboarding for teams between 10 and 200, where most HR software is a bad fit.",
    post: "Your first 10 hires do not need an ATS. Your next 40 absolutely do.",
  },
  {
    name: "Raphael Sorin",
    headline: "Fintech · Embedded finance, plainly explained",
    vertical: "Fintech",
    followers: 26000, price: 690, reach: 0.84, ctr: 11.6, leadRate: 4.1,
    rating: 4.7, reviews: 44, days: 5, langs: ["English", "French"], focus: 0.66,
    seniority: { "Founder / C-level": 0.34, "VP / Head": 0.36, Manager: 0.22, IC: 0.08 },
    functions: { Finance: 0.56, Product: 0.19, Sales: 0.14, Engineering: 0.11 },
    countries: ["France", "UK", "Luxembourg", "Germany"],
    bio: "Former payments PM. I explain embedded finance to people who have to buy it, not build it.",
    post: "Embedded payments look free until month nine. The real cost curve.",
  },
  {
    name: "Sofia Marchetti",
    headline: "Vertical SaaS · Construction-tech operator",
    vertical: "Vertical SaaS",
    followers: 6200, price: 180, reach: 1.08, ctr: 16.4, leadRate: 6.8,
    rating: 5.0, reviews: 14, days: 2, langs: ["English", "Italian"], focus: 0.84,
    seniority: { "Founder / C-level": 0.41, "VP / Head": 0.3, Manager: 0.22, IC: 0.07 },
    functions: { Product: 0.3, Sales: 0.28, Finance: 0.24, Engineering: 0.18 },
    countries: ["Italy", "Spain", "Switzerland"],
    bio: "I sell software into construction firms. Tiny audience, all of them decision makers in an industry nobody else writes about.",
    post: "Construction firms do not buy software. They buy fewer phone calls.",
  },
  {
    name: "Daniel Okonkwo",
    headline: "Devtools · Platform engineering at scale",
    vertical: "Devtools",
    followers: 48000, price: 1350, reach: 0.72, ctr: 10.4, leadRate: 3.2,
    rating: 4.8, reviews: 71, days: 6, langs: ["English"], focus: 0.51,
    seniority: { IC: 0.41, Manager: 0.28, "VP / Head": 0.22, "Founder / C-level": 0.09 },
    functions: { Engineering: 0.66, Product: 0.16, Marketing: 0.1, Sales: 0.08 },
    countries: ["US", "UK", "Nigeria", "Canada"],
    bio: "Platform engineering, Kubernetes, and the organisational reasons those projects fail. Large audience, broad by design.",
    post: "Your platform team is a product team. Staffing it like an ops team is why adoption stalled.",
  },
  {
    name: "Clara Vogt",
    headline: "Marketing-ops · Attribution without the fantasy",
    vertical: "Marketing-ops",
    followers: 11400, price: 320, reach: 0.97, ctr: 14.6, leadRate: 5.8,
    rating: 4.9, reviews: 23, days: 3, langs: ["English", "German"], focus: 0.81,
    seniority: { Manager: 0.4, "VP / Head": 0.35, IC: 0.16, "Founder / C-level": 0.09 },
    functions: { Marketing: 0.74, Sales: 0.13, Finance: 0.08, Product: 0.05 },
    countries: ["Germany", "Netherlands", "Austria"],
    bio: "I do marketing attribution for B2B companies with long sales cycles, and I am blunt about what cannot be measured.",
    post: "Last-touch attribution is not wrong, it is just answering a question you did not ask.",
  },
  {
    name: "Mateo Ferrer",
    headline: "RevOps · CRM hygiene as a growth lever",
    vertical: "RevOps",
    followers: 15800, price: 410, reach: 0.9, ctr: 13.1, leadRate: 5.0,
    rating: 4.7, reviews: 31, days: 4, langs: ["English", "Spanish"], focus: 0.72,
    seniority: { Manager: 0.41, "VP / Head": 0.33, IC: 0.17, "Founder / C-level": 0.09 },
    functions: { Sales: 0.42, Marketing: 0.28, Finance: 0.18, Product: 0.12 },
    countries: ["Spain", "Mexico", "US", "UK"],
    bio: "Salesforce and HubSpot cleanup work, mostly. Unsexy, high leverage, and I have opinions about required fields.",
    post: "We deleted 40% of our CRM fields. Forecast accuracy went up.",
  },
  {
    name: "Yuki Tanaka",
    headline: "Product-led growth · Onboarding teardowns",
    vertical: "Product",
    followers: 9800, price: 280, reach: 1.0, ctr: 15.0, leadRate: 6.2,
    rating: 5.0, reviews: 21, days: 3, langs: ["English", "Japanese"], focus: 0.77,
    seniority: { Manager: 0.36, "VP / Head": 0.3, "Founder / C-level": 0.24, IC: 0.1 },
    functions: { Product: 0.62, Marketing: 0.22, Engineering: 0.1, Sales: 0.06 },
    countries: ["Japan", "US", "Singapore"],
    bio: "I tear down B2B onboarding flows weekly. Founders send me theirs, I am not gentle about it.",
    post: "Your onboarding asks for 11 things before showing any value. Here is the reorder.",
  },
  {
    name: "Lena Fischer",
    headline: "HR-tech · Compensation and levelling",
    vertical: "HR-tech",
    followers: 22500, price: 580, reach: 0.86, ctr: 12.0, leadRate: 4.3,
    rating: 4.8, reviews: 39, days: 4, langs: ["English", "German"], focus: 0.7,
    seniority: { "VP / Head": 0.4, "Founder / C-level": 0.26, Manager: 0.26, IC: 0.08 },
    functions: { People: 0.66, Finance: 0.16, Sales: 0.1, Product: 0.08 },
    countries: ["Germany", "Switzerland", "UK", "Sweden"],
    bio: "Compensation bands, levelling frameworks, and the conversations nobody wants to have. Written for heads of people.",
    post: "Publishing salary bands did not cost us leverage. It cost us six weeks of arguments.",
  },
  {
    name: "Tobias Nilsen",
    headline: "Fintech · Treasury for startups",
    vertical: "Fintech",
    followers: 7400, price: 210, reach: 1.05, ctr: 15.8, leadRate: 6.4,
    rating: 4.9, reviews: 17, days: 2, langs: ["English", "Norwegian"], focus: 0.82,
    seniority: { "Founder / C-level": 0.44, "VP / Head": 0.28, Manager: 0.2, IC: 0.08 },
    functions: { Finance: 0.68, Product: 0.14, Sales: 0.1, Engineering: 0.08 },
    countries: ["Norway", "Sweden", "Denmark"],
    bio: "Fractional CFO. Small audience of founders and finance leads who actually control the bank account.",
    post: "Where to hold 18 months of runway when rates move. A boring, necessary post.",
  },
  {
    name: "Amara Diallo",
    headline: "Sales-tech · Enterprise deal mechanics",
    vertical: "Sales-tech",
    followers: 19200, price: 495, reach: 0.89, ctr: 12.4, leadRate: 4.7,
    rating: 4.8, reviews: 33, days: 4, langs: ["English", "French"], focus: 0.68,
    seniority: { "VP / Head": 0.42, "Founder / C-level": 0.24, Manager: 0.26, IC: 0.08 },
    functions: { Sales: 0.63, Marketing: 0.16, Finance: 0.12, Product: 0.09 },
    countries: ["France", "Senegal", "UK", "Canada"],
    bio: "Enterprise AE turned consultant. I write about multi-threading, procurement, and losing deals for reasons nobody logged.",
    post: "The deal died in procurement. It was already dead in month two, we just did not look.",
  },
  {
    name: "Krishna Iyer",
    headline: "Devtools · Observability and on-call",
    vertical: "Devtools",
    followers: 13600, price: 365, reach: 0.93, ctr: 13.6, leadRate: 5.1,
    rating: 4.7, reviews: 26, days: 3, langs: ["English"], focus: 0.75,
    seniority: { IC: 0.46, Manager: 0.29, "VP / Head": 0.18, "Founder / C-level": 0.07 },
    functions: { Engineering: 0.76, Product: 0.13, Marketing: 0.06, Sales: 0.05 },
    countries: ["India", "US", "UK", "Germany"],
    bio: "SRE. I write about on-call load, alert fatigue, and why your observability bill grew faster than your traffic.",
    post: "We cut our observability spend 60% and caught more incidents. The tradeoff we made.",
  },
  {
    name: "Elise Moreau",
    headline: "Vertical SaaS · Legal-tech buyer",
    vertical: "Vertical SaaS",
    followers: 5100, price: 145, reach: 1.12, ctr: 17.1, leadRate: 7.2,
    rating: 5.0, reviews: 11, days: 2, langs: ["English", "French"], focus: 0.87,
    seniority: { "Founder / C-level": 0.38, "VP / Head": 0.34, Manager: 0.21, IC: 0.07 },
    functions: { Finance: 0.3, Product: 0.26, Sales: 0.24, People: 0.2 },
    countries: ["France", "Belgium", "Switzerland"],
    bio: "Operations lead at a mid-size law firm. I am the person legal-tech vendors are trying to reach, writing about being sold to.",
    post: "Six legal-tech demos in a quarter. What every single one got wrong about our workflow.",
  },
  {
    name: "Oskar Nowak",
    headline: "Marketing-ops · Lifecycle and email infrastructure",
    vertical: "Marketing-ops",
    followers: 28500, price: 720, reach: 0.8, ctr: 11.4, leadRate: 3.9,
    rating: 4.6, reviews: 47, days: 5, langs: ["English", "Polish"], focus: 0.6,
    seniority: { Manager: 0.38, "VP / Head": 0.32, IC: 0.2, "Founder / C-level": 0.1 },
    functions: { Marketing: 0.68, Sales: 0.15, Product: 0.1, Engineering: 0.07 },
    countries: ["Poland", "Germany", "UK", "US"],
    bio: "Lifecycle marketing and deliverability. I have opinions about your sending domain and you will hear them.",
    post: "Your open rates are fine. Your domain reputation is why nothing converts.",
  },
];

/** Spread the remaining audience share across plausible adjacent verticals. */
function buildAudience(spec: Spec): Audience {
  const others: Vertical[] = (
    {
      "Sales-tech": ["RevOps", "Marketing-ops"],
      RevOps: ["Sales-tech", "Marketing-ops"],
      Devtools: ["Product", "Vertical SaaS"],
      Product: ["Devtools", "Marketing-ops"],
      "HR-tech": ["Vertical SaaS", "Product"],
      Fintech: ["Vertical SaaS", "RevOps"],
      "Marketing-ops": ["Sales-tech", "Product"],
      "Vertical SaaS": ["Fintech", "HR-tech"],
    } as Record<Vertical, Vertical[]>
  )[spec.vertical];

  const rest = 1 - spec.focus;
  return {
    verticals: {
      [spec.vertical]: spec.focus,
      [others[0]]: +(rest * 0.62).toFixed(3),
      [others[1]]: +(rest * 0.38).toFixed(3),
    },
    seniority: spec.seniority,
    functions: spec.functions,
    countries: spec.countries,
  };
}

export const CREATORS: Creator[] = SPECS.map((s, i) => {
  const impressions = Math.round(s.followers * s.reach);
  const clicks = Math.round(impressions * (s.ctr / 100));
  const leads = Math.round(clicks * (s.leadRate / 100));
  return {
    id: `c${i + 1}`,
    name: s.name,
    headline: s.headline,
    vertical: s.vertical,
    followers: s.followers,
    pricePerPost: s.price,
    avatarSeed: s.name,
    audience: buildAudience(s),
    stats: { avgImpressions: impressions, avgClicks: clicks, avgLeads: leads },
    rating: s.rating,
    reviews: s.reviews,
    deliveryDays: s.days,
    verified: true,
    languages: s.langs,
    bio: s.bio,
    samplePost: s.post,
  };
});

export const BRANDS: Brand[] = [
  { id: "b1", company: "Meridian", website: "meridian.io", vertical: "Sales-tech", plan: "Self-Serve" },
];

export const DEMO_CREATOR_ID = "c2"; // Robin Tempe -- has offers waiting

const now = new Date();
const iso = (dayOffset: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString();
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "cam1",
    brandId: "b1",
    name: "Q3 pipeline push — AI sales agent",
    objective: "Pipeline",
    status: "live",
    budget: 6000,
    keyMessages: [
      "Reps lose 8 hours a week to CRM admin, not to selling",
      "Meridian drafts the follow-up, logs the call, updates the stage",
      "Live in a day, no RevOps project required",
    ],
    guidelines: [
      "Write in first person about your own workflow",
      "One concrete before/after with real numbers",
      "Mention the free trial once, at the end",
    ],
    doNots: [
      "No feature lists",
      "Do not call it 'revolutionary' or 'game-changing'",
      "No competitor comparisons by name",
    ],
    targetVerticals: ["Sales-tech", "RevOps"],
    targetSeniority: ["VP / Head", "Manager"],
    targetFunctions: ["Sales"],
    trackingBase: "https://mrdn.io/r",
    landingUrl: "https://meridian.io/ai-agent",
    createdAt: iso(-24),
  },
  {
    id: "cam2",
    brandId: "b1",
    name: "Devtools launch — Meridian API",
    objective: "Product launch",
    status: "draft",
    budget: 3500,
    keyMessages: ["The API is the product", "Two-line integration, no SDK required"],
    guidelines: ["Show real code", "Be honest about limitations"],
    doNots: ["No marketing adjectives"],
    targetVerticals: ["Devtools", "Product"],
    targetSeniority: ["IC", "Manager"],
    targetFunctions: ["Engineering"],
    trackingBase: "https://mrdn.io/r",
    landingUrl: "https://meridian.io/api",
    createdAt: iso(-3),
  },
];

const ev = (at: string, label: string, by: "brand" | "creator" | "naano") => ({ at, label, by });

export const BOOKINGS: Booking[] = [
  {
    id: "bk1",
    campaignId: "cam1",
    creatorId: "c1",
    pricePerPost: 890,
    fitScore: 88,
    status: "completed",
    draft: { body: "", revision: 2, submittedAt: iso(-18) },
    postUrl: "https://linkedin.com/posts/thomas-higadere-meridian",
    publishedAt: iso(-14),
    metrics: { impressions: 42800, clicks: 5390, leads: 226, pipeline: 18400 },
    payout: { contract: true, invoice: true, paid: true, paidAt: iso(-13) },
    events: [
      ev(iso(-22), "Invited to campaign", "brand"),
      ev(iso(-21), "Accepted the offer", "creator"),
      ev(iso(-19), "Draft submitted", "creator"),
      ev(iso(-19), "Changes requested", "brand"),
      ev(iso(-18), "Draft resubmitted", "creator"),
      ev(iso(-17), "Draft approved", "brand"),
      ev(iso(-14), "Published on LinkedIn", "creator"),
      ev(iso(-13), "Payout released", "naano"),
    ],
  },
  {
    id: "bk2",
    campaignId: "cam1",
    creatorId: "c5",
    pricePerPost: 260,
    fitScore: 95,
    status: "live",
    draft: { body: "", revision: 1, submittedAt: iso(-9) },
    postUrl: "https://linkedin.com/posts/priya-raghunathan-meridian",
    publishedAt: iso(-5),
    metrics: { impressions: 9120, clicks: 1386, leads: 84, pipeline: 11200 },
    payout: { contract: true, invoice: true, paid: true, paidAt: iso(-4) },
    events: [
      ev(iso(-12), "Invited to campaign", "brand"),
      ev(iso(-12), "Accepted the offer", "creator"),
      ev(iso(-9), "Draft submitted", "creator"),
      ev(iso(-8), "Draft approved", "brand"),
      ev(iso(-5), "Published on LinkedIn", "creator"),
      ev(iso(-4), "Payout released", "naano"),
    ],
  },
  {
    id: "bk3",
    campaignId: "cam1",
    creatorId: "c13",
    pricePerPost: 410,
    fitScore: 84,
    status: "draft_submitted",
    draft: {
      body:
        "Two years ago our CRM had 214 fields. Reps filled in six of them.\n\nWe deleted 40% and forecast accuracy went up, which sounds like a paradox until you realise nobody was reading the other 208.\n\nWhat changed: we made stage definitions the only required thing, then let Meridian handle the rest — it drafts the follow-up, logs the call and moves the stage without anyone typing.\n\nThe honest caveat: this only works if your stages mean something. If they do not, fix that first, no tool saves you.\n\nWe ran it for a quarter before I would write about it. Free trial if you want to poke at it.",
      revision: 1,
      submittedAt: iso(-1),
    },
    payout: { contract: true, invoice: false, paid: false },
    events: [
      ev(iso(-4), "Invited to campaign", "brand"),
      ev(iso(-4), "Accepted the offer", "creator"),
      ev(iso(-1), "Draft submitted", "creator"),
    ],
  },
  {
    id: "bk4",
    campaignId: "cam1",
    creatorId: "c17",
    pricePerPost: 495,
    fitScore: 86,
    status: "scheduled",
    draft: { body: "", revision: 1, submittedAt: iso(-6) },
    scheduledFor: iso(2),
    payout: { contract: true, invoice: false, paid: false },
    events: [
      ev(iso(-8), "Invited to campaign", "brand"),
      ev(iso(-8), "Accepted the offer", "creator"),
      ev(iso(-6), "Draft submitted", "creator"),
      ev(iso(-5), "Draft approved", "brand"),
      ev(iso(-5), "Scheduled", "creator"),
    ],
  },
  {
    id: "bk5",
    campaignId: "cam1",
    creatorId: "c2",
    pricePerPost: 340,
    fitScore: 91,
    status: "invited",
    payout: { contract: false, invoice: false, paid: false },
    events: [ev(iso(-1), "Invited to campaign", "brand")],
  },
  {
    id: "bk6",
    campaignId: "cam1",
    creatorId: "c3",
    pricePerPost: 1150,
    fitScore: 79,
    status: "declined",
    feedback: "Already working with a competitor this quarter.",
    payout: { contract: false, invoice: false, paid: false },
    events: [
      ev(iso(-6), "Invited to campaign", "brand"),
      ev(iso(-5), "Declined the offer", "creator"),
    ],
  },
];
