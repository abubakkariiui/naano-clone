"use client";

import Link from "next/link";
import { Avatar, Badge, ButtonLink, Card, Empty, eur, relTime } from "@/components/ui";
import { useBrandData } from "@/lib/store";
import { STATUS_TONE } from "@/lib/status";
import { STATUS_LABEL } from "@/lib/types";

export default function Campaigns() {
  const store = useBrandData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1.5">Campaigns</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Manage every collaboration.
          </h1>
        </div>
        <ButtonLink href="/brand/campaigns/new">New campaign</ButtonLink>
      </div>

      {store.campaigns.length === 0 ? (
        <Card>
          <Empty
            title="No campaigns yet"
            body="A campaign holds the brief, the targeting, and every creator you book against it."
            action={<ButtonLink href="/brand/campaigns/new">Build your first brief</ButtonLink>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {store.campaigns.map((c) => {
            const bs = store.bookings.filter((b) => b.campaignId === c.id);
            const pipeline = bs.reduce((s, b) => s + (b.metrics?.pipeline ?? 0), 0);
            const needsReview = bs.filter((b) => b.status === "draft_submitted").length;

            return (
              <Card key={c.id} className="overflow-hidden">
                <Link
                  href={`/brand/campaigns/${c.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-canvas"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold tracking-tight">{c.name}</p>
                        <Badge tone={c.status === "live" ? "good" : "neutral"}>
                          {c.status === "live" ? "Live" : "Draft"}
                        </Badge>
                        {needsReview > 0 && (
                          <Badge tone="warn">
                            {needsReview} draft{needsReview > 1 ? "s" : ""} to review
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-[12.5px] text-muted">
                        {c.objective} · created {relTime(c.createdAt)} · budget {eur(c.budget)}
                      </p>
                    </div>
                    <div className="tnum text-right">
                      <p className="text-[11px] tracking-wide text-muted uppercase">Pipeline</p>
                      <p className="text-[18px] font-semibold">{eur(pipeline)}</p>
                    </div>
                  </div>
                </Link>

                {bs.length > 0 && (
                  <ul className="divide-y divide-line-soft border-t border-line-soft">
                    {bs.map((b) => {
                      const cr = store.creators.find((x) => x.id === b.creatorId)!;
                      return (
                        <li key={b.id} className="flex items-center gap-3 px-5 py-2.5">
                          <Avatar name={cr.name} size={28} />
                          <p className="min-w-0 flex-1 truncate text-[13px]">{cr.name}</p>
                          <p className="tnum hidden text-[12px] text-muted sm:block">
                            {eur(b.pricePerPost)}
                          </p>
                          <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
