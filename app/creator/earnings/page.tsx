"use client";

import { Avatar, Badge, Card, Empty, Stat, cx, eur, fmtDate } from "@/components/ui";
import { useCreatorData } from "@/lib/store";

export default function Earnings() {
  const store = useCreatorData();
  const { me, offers } = store;

  const contracted = offers.filter((b) => b.payout.contract);
  const paid = contracted.filter((b) => b.payout.paid);
  const pending = contracted.filter((b) => !b.payout.paid);

  const sum = (list: typeof contracted) => list.reduce((s, b) => s + b.pricePerPost, 0);
  const avg = paid.length > 0 ? sum(paid) / paid.length : me.pricePerPost;

  // Naano takes no cut from the creator -- the flat fee is what they receive.
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1.5">Earnings</p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          What you have made on Naano.
        </h1>
        <p className="mt-1.5 max-w-lg text-sm text-muted">
          Your flat fee is what you receive. Payouts are released within 24h of a post
          going live — Naano handles the contract and the invoice.
        </p>
      </div>

      <Card className="grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
        <Stat label="Paid out" value={eur(sum(paid))} sub={`${paid.length} posts`} />
        <Stat label="Pending" value={eur(sum(pending))} accent sub={`${pending.length} in flight`} />
        <Stat label="Avg per post" value={eur(avg)} />
        <Stat label="Your rate" value={eur(me.pricePerPost)} sub="set by you" />
      </Card>

      {contracted.length === 0 ? (
        <Card>
          <Empty
            title="No earnings yet"
            body="Accepting an offer creates the contract. You are paid within 24h of the post going live."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[14px] font-semibold">Payout history</p>
          </div>
          <ul className="divide-y divide-line-soft">
            {[...contracted]
              .sort((a, b) => {
                const at = a.payout.paidAt ?? a.publishedAt ?? a.events[0].at;
                const bt = b.payout.paidAt ?? b.publishedAt ?? b.events[0].at;
                return +new Date(bt) - +new Date(at);
              })
              .map((b) => {
                const campaign = store.campaigns.find((c) => c.id === b.campaignId)!;
                const brand = store.brands.find((x) => x.id === campaign.brandId)!;
                const stage = b.payout.paid
                  ? "Paid"
                  : b.payout.invoice
                    ? "Invoice raised"
                    : "Contract signed";
                return (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <Avatar name={brand.company} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{brand.company}</p>
                      <p className="truncate text-[12px] text-muted">{campaign.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-muted">{stage}</p>
                      <p className="text-[11.5px] text-muted">
                        {b.payout.paidAt ? fmtDate(b.payout.paidAt) : "—"}
                      </p>
                    </div>
                    <p
                      className={cx(
                        "tnum w-[84px] text-right text-[15px] font-semibold",
                        b.payout.paid ? "text-ink" : "text-muted",
                      )}
                    >
                      {eur(b.pricePerPost)}
                    </p>
                    <Badge tone={b.payout.paid ? "good" : "warn"}>
                      {b.payout.paid ? "Cleared" : "Pending"}
                    </Badge>
                  </li>
                );
              })}
          </ul>
          <div className="flex items-center justify-between border-t border-line bg-canvas px-5 py-3">
            <p className="text-[12.5px] text-muted">
              Naano takes no commission from creators.
            </p>
            <p className="tnum text-[14px] font-semibold">{eur(sum(contracted))} total</p>
          </div>
        </Card>
      )}
    </div>
  );
}
