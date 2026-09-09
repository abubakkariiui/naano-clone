import type { Campaign, Creator, Func, Seniority, Vertical } from "./types";

/**
 * Audience fit, 0-100.
 *
 * Deliberately independent of follower count. Naano's own claim is that "a
 * creator with 3k followers in your exact vertical can outperform a 100k
 * generalist on click-through rate", so reach must not leak into this number --
 * otherwise the marketplace just re-ranks by size and the thesis is lost.
 *
 * Fit is the share of a creator's audience that matches what the campaign is
 * targeting, across three dimensions.
 */
const WEIGHTS = { vertical: 0.5, seniority: 0.28, functions: 0.22 };

function overlap<K extends string>(
  weights: Partial<Record<K, number>>,
  targets: K[],
): number {
  if (targets.length === 0) return 0.6; // nothing specified: neutral, not perfect
  return targets.reduce((sum, t) => sum + (weights[t] ?? 0), 0);
}

export interface FitBreakdown {
  score: number;
  parts: { label: string; share: number; weight: number; detail: string }[];
}

export function fitBreakdown(creator: Creator, campaign: Campaign): FitBreakdown {
  const v = overlap<Vertical>(creator.audience.verticals, campaign.targetVerticals);
  const s = overlap<Seniority>(creator.audience.seniority, campaign.targetSeniority);
  const f = overlap<Func>(creator.audience.functions, campaign.targetFunctions);

  const raw = v * WEIGHTS.vertical + s * WEIGHTS.seniority + f * WEIGHTS.functions;

  // Concentration bonus: a tightly focused audience converts better than a
  // diffuse one at the same nominal overlap.
  const concentration = Math.max(...Object.values(creator.audience.verticals as Record<string, number>));
  const score = Math.round(Math.min(99, raw * 100 * (0.9 + concentration * 0.18)));

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return {
    score,
    parts: [
      {
        label: "Vertical",
        share: v,
        weight: WEIGHTS.vertical,
        detail: campaign.targetVerticals.length
          ? `${pct(v)} of audience in ${campaign.targetVerticals.join(", ")}`
          : "No vertical targeted",
      },
      {
        label: "Seniority",
        share: s,
        weight: WEIGHTS.seniority,
        detail: campaign.targetSeniority.length
          ? `${pct(s)} at ${campaign.targetSeniority.join(", ")}`
          : "No seniority targeted",
      },
      {
        label: "Function",
        share: f,
        weight: WEIGHTS.functions,
        detail: campaign.targetFunctions.length
          ? `${pct(f)} in ${campaign.targetFunctions.join(", ")}`
          : "No function targeted",
      },
    ],
  };
}

export function fitScore(creator: Creator, campaign: Campaign): number {
  return fitBreakdown(creator, campaign).score;
}

/**
 * Expected outcome of one post, scaled by how well the audience matches. A
 * post to the wrong audience gets impressions but not leads, which is the
 * whole reason fit is the primary sort.
 */
export function project(creator: Creator, fit: number) {
  const f = fit / 100;
  const impressions = Math.round(creator.stats.avgImpressions * (0.75 + f * 0.35));
  const clicks = Math.round(creator.stats.avgClicks * (0.5 + f * 0.7));
  const leads = Math.round(creator.stats.avgLeads * (0.35 + f * 0.85));
  const cpl = leads > 0 ? creator.pricePerPost / leads : null;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  return { impressions, clicks, leads, cpl, ctr };
}

/** LinkedIn Ads comparison, from Naano's published Q1 2026 benchmark: EUR 55-90 CPL. */
export const LINKEDIN_ADS_CPL = 72;

export function fitTone(score: number) {
  if (score >= 85) return { label: "Excellent fit", cls: "text-emerald-700 bg-emerald-50 ring-emerald-200" };
  if (score >= 70) return { label: "Strong fit", cls: "text-blue-700 bg-blue-50 ring-blue-200" };
  if (score >= 55) return { label: "Moderate fit", cls: "text-amber-700 bg-amber-50 ring-amber-200" };
  return { label: "Weak fit", cls: "text-slate-600 bg-slate-100 ring-slate-200" };
}
