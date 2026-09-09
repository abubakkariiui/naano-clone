"use client";

import Link from "next/link";
import { useState } from "react";
import { FitPill } from "@/components/CreatorCard";
import {
  Avatar,
  Badge,
  Card,
  Empty,
  Stat,
  cx,
  eur,
  fmtCompact,
  fmtInt,
} from "@/components/ui";
import { LINKEDIN_ADS_CPL } from "@/lib/fit";
import { useBrandData } from "@/lib/store";

type SortKey = "pipeline" | "cpl" | "leads" | "reach";

export default function Results() {
  const store = useBrandData();
  const [sort, setSort] = useState<SortKey>("pipeline");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const posts = store.bookings
    .filter((b) => b.metrics)
    .filter((b) => campaignFilter === "all" || b.campaignId === campaignFilter);

  const totals = posts.reduce(
    (a, b) => ({
      impressions: a.impressions + b.metrics!.impressions,
      clicks: a.clicks + b.metrics!.clicks,
      leads: a.leads + b.metrics!.leads,
      pipeline: a.pipeline + b.metrics!.pipeline,
      spend: a.spend + b.pricePerPost,
    }),
    { impressions: 0, clicks: 0, leads: 0, pipeline: 0, spend: 0 },
  );

  const cpl = totals.leads > 0 ? totals.spend / totals.leads : null;
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const roi = totals.spend > 0 ? totals.pipeline / totals.spend : 0;

  const cplOf = (b: (typeof posts)[number]) =>
    b.metrics!.leads > 0 ? b.pricePerPost / b.metrics!.leads : Infinity;

  const sorted = [...posts].sort((a, b) => {
    switch (sort) {
      case "pipeline":
        return b.metrics!.pipeline - a.metrics!.pipeline;
      case "leads":
        return b.metrics!.leads - a.metrics!.leads;
      case "reach":
        return b.metrics!.impressions - a.metrics!.impressions;
      case "cpl":
        return cplOf(a) - cplOf(b);
    }
  });

  const maxPipeline = Math.max(1, ...posts.map((b) => b.metrics!.pipeline));

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="eyebrow mb-1.5">Results</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Track reach, clicks and leads.
          </h1>
        </div>
        <Card>
          <Empty
            title="No live posts yet"
            body="Once a creator publishes, every click is attributed back to their post and appears here."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1.5">Results</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Real teams. Measurable pipeline.
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {posts.length} published post{posts.length === 1 ? "" : "s"} · every click
            traced back to the creator who drove it.
          </p>
        </div>
        <label className="text-[12px] font-medium text-muted">
          Campaign
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="mt-1 block h-9 min-w-[220px] rounded-[10px] bg-surface px-2.5 text-[13px] font-medium text-ink ring-1 ring-line"
          >
            <option value="all">All campaigns</option>
            {store.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ------------------------------------------------------- headline */}
      <Card className="grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
        <Stat
          label="Attributed pipeline"
          value={eur(totals.pipeline)}
          accent
          sub={`${roi.toFixed(1)}× on ${eur(totals.spend)} spend`}
        />
        <Stat
          label="Impressions"
          value={fmtCompact(totals.impressions)}
          sub={`${ctr.toFixed(1)}% CTR · benchmark 0.8%`}
        />
        <Stat label="Qualified leads" value={fmtInt(totals.leads)} sub={`${fmtInt(totals.clicks)} clicks`} />
        <Stat
          label="Cost per lead"
          value={cpl ? eur(cpl) : "—"}
          sub={cpl ? `LinkedIn Ads ≈ ${eur(LINKEDIN_ADS_CPL)}` : undefined}
        />
      </Card>

      {/* --------------------------------------------- CPL vs LinkedIn Ads */}
      {cpl && (
        <Card className="p-5">
          <p className="eyebrow mb-3">Cost per lead, compared</p>
          <div className="space-y-3">
            {[
              { label: "This account", value: cpl, tone: "bg-brand" },
              { label: "Naano marketplace average", value: 18, tone: "bg-ink" },
              { label: "LinkedIn Ads (B2B SaaS)", value: LINKEDIN_ADS_CPL, tone: "bg-line" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-[190px] shrink-0 text-[12.5px] text-ink-soft">{row.label}</span>
                <div className="h-6 min-w-0 flex-1 overflow-hidden rounded-md bg-line-soft">
                  <div
                    className={cx("h-full rounded-md transition-[width] duration-700", row.tone)}
                    style={{ width: `${(row.value / LINKEDIN_ADS_CPL) * 100}%` }}
                  />
                </div>
                <span className="tnum w-[54px] shrink-0 text-right text-[13px] font-semibold">
                  {eur(row.value)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3.5 border-t border-line-soft pt-3 text-[11.5px] text-muted">
            Benchmarks: Naano marketplace data, Q1 2026 (312 campaigns). LinkedIn Ads
            range €55–90 for B2B SaaS audiences.
          </p>
        </Card>
      )}

      {/* ------------------------------------------------------ per post */}
      <div>
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[15px] font-semibold">Per post</h2>
          <div className="flex gap-1">
            {(
              [
                ["pipeline", "Pipeline"],
                ["leads", "Leads"],
                ["cpl", "CPL"],
                ["reach", "Reach"],
              ] as [SortKey, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={cx(
                  "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors",
                  sort === k ? "bg-ink text-white" : "text-muted hover:bg-line-soft hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Card className="divide-y divide-line-soft overflow-hidden">
          {sorted.map((b) => {
            const c = store.creators.find((x) => x.id === b.creatorId)!;
            const m = b.metrics!;
            const postCpl = cplOf(b);
            const beatsAds = postCpl < LINKEDIN_ADS_CPL;
            return (
              <div key={b.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar name={c.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/brand/marketplace/${c.id}?campaign=${b.campaignId}`}
                        className="truncate text-[13.5px] font-medium hover:underline"
                      >
                        {c.name}
                      </Link>
                      <FitPill score={b.fitScore} />
                      {b.status === "live" && <Badge tone="live">Live</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-muted">
                      {c.vertical} · {fmtCompact(c.followers)} followers · paid{" "}
                      {eur(b.pricePerPost)}
                    </p>
                  </div>

                  <div className="tnum grid grid-cols-4 gap-4 text-right text-[13px] sm:gap-6">
                    <div>
                      <p className="text-[10px] tracking-wide text-muted uppercase">Reach</p>
                      <p className="mt-0.5 font-semibold">{fmtCompact(m.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-wide text-muted uppercase">Clicks</p>
                      <p className="mt-0.5 font-semibold">{fmtInt(m.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-wide text-muted uppercase">Leads</p>
                      <p className="mt-0.5 font-semibold">{m.leads}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-wide text-muted uppercase">CPL</p>
                      <p
                        className={cx(
                          "mt-0.5 font-semibold",
                          beatsAds ? "text-emerald-700" : "text-amber-700",
                        )}
                      >
                        {Number.isFinite(postCpl) ? eur(postCpl) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pipeline contribution, relative to the best post. */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full bg-brand transition-[width] duration-700"
                      style={{ width: `${(m.pipeline / maxPipeline) * 100}%` }}
                    />
                  </div>
                  <span className="tnum w-[72px] shrink-0 text-right text-[12.5px] font-medium">
                    {eur(m.pipeline)}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
