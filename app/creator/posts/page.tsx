"use client";

import Link from "next/link";
import { Avatar, Badge, ButtonLink, Card, Empty, Stat, cx, eur, fmtCompact, fmtInt, relTime } from "@/components/ui";
import { useCreatorData } from "@/lib/store";

export default function CreatorPosts() {
  const store = useCreatorData();
  const posts = store.offers.filter((b) => b.metrics);

  const totals = posts.reduce(
    (a, b) => ({
      impressions: a.impressions + b.metrics!.impressions,
      clicks: a.clicks + b.metrics!.clicks,
      leads: a.leads + b.metrics!.leads,
    }),
    { impressions: 0, clicks: 0, leads: 0 },
  );
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const best = Math.max(1, ...posts.map((b) => b.metrics!.impressions));

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1.5">My posts</p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          How your sponsored posts performed.
        </h1>
        <p className="mt-1.5 max-w-lg text-sm text-muted">
          Brands see these numbers too. Strong performance is what raises your rate.
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <Empty
            title="No published posts yet"
            body="Accept an offer, write the draft, and once it is live the numbers land here."
            action={<ButtonLink href="/creator">See my offers</ButtonLink>}
          />
        </Card>
      ) : (
        <>
          <Card className="grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
            <Stat label="Posts" value={posts.length} />
            <Stat label="Total reach" value={fmtCompact(totals.impressions)} />
            <Stat label="Avg CTR" value={`${ctr.toFixed(1)}%`} accent sub="benchmark 0.8%" />
            <Stat label="Leads driven" value={fmtInt(totals.leads)} />
          </Card>

          <Card className="divide-y divide-line-soft overflow-hidden">
            {posts.map((b) => {
              const campaign = store.campaigns.find((c) => c.id === b.campaignId)!;
              const brand = store.brands.find((x) => x.id === campaign.brandId)!;
              const m = b.metrics!;
              const postCtr = (m.clicks / m.impressions) * 100;
              return (
                <div key={b.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <Avatar name={brand.company} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13.5px] font-medium">{brand.company}</p>
                        <Badge tone={b.payout.paid ? "good" : "warn"}>
                          {b.payout.paid ? `Paid ${eur(b.pricePerPost)}` : "Payout pending"}
                        </Badge>
                      </div>
                      <p className="truncate text-[12px] text-muted">
                        {campaign.name}
                        {b.publishedAt && <> · published {relTime(b.publishedAt)}</>}
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
                        <p className="text-[10px] tracking-wide text-muted uppercase">CTR</p>
                        <p className="mt-0.5 font-semibold text-emerald-700">
                          {postCtr.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] tracking-wide text-muted uppercase">Leads</p>
                        <p className="mt-0.5 font-semibold">{m.leads}</p>
                      </div>
                    </div>
                  </div>

                  {b.draft?.body && (
                    <p className="mt-3 line-clamp-2 rounded-[10px] bg-canvas p-3 text-[12.5px] leading-relaxed text-ink-soft ring-1 ring-line-soft">
                      {b.draft.body}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line-soft">
                      <div
                        className={cx("h-full rounded-full bg-brand transition-[width] duration-700")}
                        style={{ width: `${(m.impressions / best) * 100}%` }}
                      />
                    </div>
                    <Link
                      href={`/creator/offers/${b.id}`}
                      className="shrink-0 text-[12px] font-medium text-brand hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}
