"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Stat,
  cx,
  eur,
  fmtDate,
} from "@/components/ui";
import { useBrandData } from "@/lib/store";

/** Contract -> Invoice -> Payout, the three states Naano surfaces. */
function PayoutTrack({
  payout,
}: {
  payout: { contract: boolean; invoice: boolean; paid: boolean };
}) {
  const steps = [
    { label: "Contract", done: payout.contract },
    { label: "Invoice", done: payout.invoice },
    { label: "Payout", done: payout.paid },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
              s.done
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-line-soft text-muted ring-line",
            )}
          >
            {s.done && (
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.2">
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="h-px w-3 bg-line" />}
        </div>
      ))}
    </div>
  );
}

export default function Payouts() {
  const store = useBrandData();

  // A contract exists from the moment a creator accepts, so that is the gate.
  const rows = store.bookings.filter((b) => b.payout.contract);
  const due = rows.filter((b) => b.payout.invoice && !b.payout.paid);
  const paid = rows.filter((b) => b.payout.paid);

  const total = (list: typeof rows) => list.reduce((s, b) => s + b.pricePerPost, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1.5">Payouts</p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Pay creators without the admin.
        </h1>
        <p className="mt-1.5 max-w-lg text-sm text-muted">
          Contracts, invoices and payouts are handled by Naano. Creators are paid within
          24h of a post going live.
        </p>
      </div>

      <Card className="grid grid-cols-3 divide-x divide-line-soft">
        <Stat label="Paid out" value={eur(total(paid))} sub={`${paid.length} posts`} />
        <Stat label="Due" value={eur(total(due))} accent sub={`${due.length} awaiting release`} />
        <Stat label="Committed" value={eur(total(rows))} sub={`${rows.length} contracts`} />
      </Card>

      {rows.length === 0 ? (
        <Card>
          <Empty
            title="Nothing to pay yet"
            body="A contract is created the moment a creator accepts an invite. Nothing is charged until a post goes live."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[14px] font-semibold">All contracts</p>
          </div>
          <ul className="divide-y divide-line-soft">
            {rows.map((b) => {
              const c = store.creators.find((x) => x.id === b.creatorId)!;
              const campaign = store.campaigns.find((x) => x.id === b.campaignId);
              return (
                <li key={b.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <Avatar name={c.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{c.name}</p>
                    <p className="truncate text-[12px] text-muted">{campaign?.name}</p>
                  </div>
                  <PayoutTrack payout={b.payout} />
                  <p className="tnum w-[76px] text-right text-[14px] font-semibold">
                    {eur(b.pricePerPost)}
                  </p>
                  <div className="w-[116px] text-right">
                    {b.payout.paid ? (
                      <Badge tone="good">
                        Paid {b.payout.paidAt ? fmtDate(b.payout.paidAt) : ""}
                      </Badge>
                    ) : b.payout.invoice ? (
                      <Button size="sm" onClick={() => store.releasePayout(b.id)}>
                        Release payout
                      </Button>
                    ) : (
                      <span className="text-[11.5px] text-muted">Awaiting post</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
