"use client";

import Link from "next/link";
import { Avatar, Badge, ButtonLink, Card, Empty, Stat, cx, eur, fmtCompact, fmtInt, relTime } from "@/components/ui";
import { LINKEDIN_ADS_CPL } from "@/lib/fit";
import { useBrandData } from "@/lib/store";

export default function BrandOverview() {
  const store = useBrandData();
  const { bookings, campaigns, creators } = store;

  const withMetrics = bookings.filter((b) => b.metrics);
  const totals = withMetrics.reduce(
    (acc, b) => ({
      impressions: acc.impressions + b.metrics!.impressions,
      clicks: acc.clicks + b.metrics!.clicks,
      leads: acc.leads + b.metrics!.leads,
      pipeline: acc.pipeline + b.metrics!.pipeline,
      spend: acc.spend + b.pricePerPost,
    }),
    { impressions: 0, clicks: 0, leads: 0, pipeline: 0, spend: 0 },
  );
  const cpl = totals.leads > 0 ? totals.spend / totals.leads : null;

  // What is actually waiting on the brand right now.
  const needsReview = bookings.filter(
    (b) => b.status === "draft_submitted",
  );
  const awaitingCreator = bookings.filter((b) => b.status === "invited");

  const creatorOf = (id: string) => creators.find((c) => c.id === id)!;

  const recent = [...bookings]
    .flatMap((b) => b.events.map((e) => ({ ...e, booking: b })))
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1.5">Overview</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            {store.brands.find((b) => b.id === store.brandId)!.company}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {campaigns.filter((c) => c.status === "live").length} live campaign
            {campaigns.filter((c) => c.status === "live").length === 1 ? "" : "s"} ·{" "}
            {bookings.length} bookings
          </p>
        </div>
        <ButtonLink href="/brand/campaigns/new">New campaign</ButtonLink>
      </div>

      {/* ---------------------------------------------------------- metrics */}
      <Card className="grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
        <Stat label="Attributed pipeline" value={eur(totals.pipeline)} accent sub={`from ${withMetrics.length} live posts`} />
        <Stat label="Impressions" value={fmtCompact(totals.impressions)} sub={`${fmtInt(totals.clicks)} clicks`} />
        <Stat label="Leads" value={fmtInt(totals.leads)} sub={`${eur(totals.spend)} spend`} />
        <Stat
          label="Cost per lead"
          value={cpl ? eur(cpl) : "—"}
          sub={cpl ? `${Math.round((1 - cpl / LINKEDIN_ADS_CPL) * 100)}% under LinkedIn Ads` : "no data yet"}
        />
      </Card>

      {/* ------------------------------------------------------- your queue */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div>
              <p className="text-[14px] font-semibold">Waiting on you</p>
              <p className="text-[12px] text-muted">Drafts submitted for review</p>
            </div>
            {needsReview.length > 0 && (
              <span className="tnum rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                {needsReview.length}
              </span>
            )}
          </div>
          {needsReview.length === 0 ? (
            <Empty
              title="Nothing to review"
              body="When a creator submits a draft it lands here for approval or changes."
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {needsReview.map((b) => {
                const c = creatorOf(b.creatorId);
                return (
                  <li key={b.id}>
                    <Link
                      href={`/brand/campaigns/${b.campaignId}?booking=${b.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-canvas"
                    >
                      <Avatar name={c.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">{c.name}</p>
                        <p className="text-[12px] text-muted">
                          Draft v{b.draft?.revision} · {relTime(b.draft!.submittedAt)}
                        </p>
                      </div>
                      <Badge tone="warn">Review</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[14px] font-semibold">Awaiting creators</p>
            <p className="text-[12px] text-muted">Invites not yet answered</p>
          </div>
          {awaitingCreator.length === 0 ? (
            <Empty title="No open invites" body="Every invite has been answered." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {awaitingCreator.map((b) => {
                const c = creatorOf(b.creatorId);
                return (
                  <li key={b.id} className="flex items-center gap-2.5 px-5 py-3">
                    <Avatar name={c.name} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{c.name}</p>
                      <p className="tnum text-[11.5px] text-muted">{eur(b.pricePerPost)}</p>
                    </div>
                    <span className="text-[11px] text-muted">{relTime(b.events[0].at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ------------------------------------------------------- campaigns */}
      <div>
        <div className="mb-3.5 flex items-end justify-between">
          <h2 className="text-[15px] font-semibold">Campaigns</h2>
          <Link href="/brand/campaigns" className="text-[12.5px] font-medium text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {campaigns.map((c) => {
            const bs = bookings.filter((b) => b.campaignId === c.id);
            const live = bs.filter((b) => b.metrics);
            const pipeline = live.reduce((s, b) => s + b.metrics!.pipeline, 0);
            const committed = bs
              .filter((b) => !["declined", "invited"].includes(b.status))
              .reduce((s, b) => s + b.pricePerPost, 0);
            return (
              <Link key={c.id} href={`/brand/campaigns/${c.id}`}>
                <Card className="p-4 transition-shadow hover:shadow-[0_8px_24px_-10px_rgba(10,10,11,0.14)]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold tracking-tight">{c.name}</p>
                    <Badge tone={c.status === "live" ? "good" : "neutral"}>
                      {c.status === "live" ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-muted">
                    {c.objective} · {bs.length} creators · {relTime(c.createdAt)}
                  </p>
                  <div className="tnum mt-3.5 grid grid-cols-3 gap-2 border-t border-line-soft pt-3 text-[13px]">
                    <div>
                      <p className="text-[10.5px] tracking-wide text-muted uppercase">Pipeline</p>
                      <p className="mt-0.5 font-semibold">{eur(pipeline)}</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] tracking-wide text-muted uppercase">Committed</p>
                      <p className="mt-0.5 font-semibold">{eur(committed)}</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] tracking-wide text-muted uppercase">Budget</p>
                      <p className="mt-0.5 font-semibold">{eur(c.budget)}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------- activity */}
      <Card>
        <div className="border-b border-line px-5 py-3.5">
          <p className="text-[14px] font-semibold">Activity</p>
        </div>
        <ul className="divide-y divide-line-soft">
          {recent.map((e, i) => {
            const c = creatorOf(e.booking.creatorId);
            return (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5">
                <span
                  className={cx(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    e.by === "brand" ? "bg-ink" : e.by === "creator" ? "bg-brand" : "bg-emerald-500",
                  )}
                />
                <p className="min-w-0 flex-1 truncate text-[13px]">
                  <span className="font-medium">{e.by === "brand" ? "You" : e.by === "naano" ? "Naano" : c.name}</span>
                  <span className="text-muted"> · {e.label}</span>
                </p>
                <span className="shrink-0 text-[11.5px] text-muted">{relTime(e.at)}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
