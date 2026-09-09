"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Empty,
  Stat,
  cx,
  eur,
  fmtDate,
  relTime,
} from "@/components/ui";
import { useCreatorData } from "@/lib/store";
import { STATUS_TONE } from "@/lib/status";
import { STATUS_LABEL, type Booking } from "@/lib/types";

const DECLINE_REASONS = [
  "Not a fit for my audience",
  "Already working with a competitor",
  "No capacity right now",
  "Rate is too low for this scope",
];

export default function CreatorOffers() {
  const store = useCreatorData();
  const { me, offers } = store;
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState(DECLINE_REASONS[0]);

  const invited = offers.filter((b) => b.status === "invited");
  const inProgress = offers.filter((b) =>
    ["accepted", "draft_submitted", "changes_requested", "approved", "scheduled"].includes(b.status),
  );
  const done = offers.filter((b) => ["live", "completed"].includes(b.status));

  const earned = offers
    .filter((b) => b.payout.paid)
    .reduce((s, b) => s + b.pricePerPost, 0);
  const pending = offers
    .filter((b) => b.payout.contract && !b.payout.paid)
    .reduce((s, b) => s + b.pricePerPost, 0);

  const campaignOf = (b: Booking) => store.campaigns.find((c) => c.id === b.campaignId);
  const brandOf = (b: Booking) => {
    const c = campaignOf(b);
    return store.brands.find((x) => x.id === c?.brandId);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1.5">Offers</p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Get paid to post on LinkedIn.
        </h1>
        <p className="mt-1.5 max-w-lg text-sm text-muted">
          Choose deals from B2B brands you actually use. Post in your own voice, get paid
          within 24h. No negotiating, no admin.
        </p>
      </div>

      <Card className="grid grid-cols-3 divide-x divide-line-soft">
        <Stat label="Earned" value={eur(earned)} sub={`${offers.filter((b) => b.payout.paid).length} posts paid`} />
        <Stat label="Pending" value={eur(pending)} accent sub="released 24h after posting" />
        <Stat label="Your rate" value={eur(me.pricePerPost)} sub="per post, set by you" />
      </Card>

      {/* ------------------------------------------------------ new offers */}
      <div>
        <div className="mb-3.5 flex items-center gap-2">
          <h2 className="text-[15px] font-semibold">New offers</h2>
          {invited.length > 0 && (
            <span className="tnum rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
              {invited.length}
            </span>
          )}
        </div>

        {invited.length === 0 ? (
          <Card>
            <Empty
              title="No new offers"
              body="Brands whose targeting matches your audience will show up here. Keep your rate and verticals current."
              action={<ButtonLink href="/creator/profile" variant="secondary">Review my profile</ButtonLink>}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {invited.map((b) => {
              const campaign = campaignOf(b)!;
              const brand = brandOf(b)!;
              return (
                <Card key={b.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <Avatar name={brand.company} size={42} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-semibold tracking-tight">
                            {brand.company}
                          </p>
                          <Badge tone="brand">{campaign.objective}</Badge>
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted">{campaign.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-[22px] font-semibold leading-none">
                          {eur(b.pricePerPost)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted">one post</p>
                      </div>
                    </div>

                    <div className="mt-3.5 rounded-[10px] bg-canvas p-3 ring-1 ring-line-soft">
                      <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                        What they want said
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {campaign.keyMessages.slice(0, 3).map((m, i) => (
                          <li key={i} className="flex gap-1.5 text-[12.5px] leading-snug text-ink-soft">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted">
                      <span>Invited {relTime(b.events[0].at)}</span>
                      <span>Your usual turnaround · {me.deliveryDays} days</span>
                      <span>Paid within 24h of posting</span>
                    </div>

                    {decliningId === b.id ? (
                      <div className="rise mt-3.5 rounded-[10px] bg-canvas p-3 ring-1 ring-line">
                        <p className="mb-2 text-[12.5px] font-medium">
                          Why are you turning this down?
                        </p>
                        <div className="space-y-1.5">
                          {DECLINE_REASONS.map((r) => (
                            <label key={r} className="flex cursor-pointer items-center gap-2 text-[12.5px]">
                              <input
                                type="radio"
                                name={`reason-${b.id}`}
                                checked={reason === r}
                                onChange={() => setReason(r)}
                                className="accent-[#1b4dff]"
                              />
                              {r}
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              store.respond(b.id, false, reason);
                              setDecliningId(null);
                            }}
                          >
                            Confirm decline
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDecliningId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-3.5">
                        <Button onClick={() => store.respond(b.id, true)}>Accept offer</Button>
                        <ButtonLink href={`/creator/offers/${b.id}`} variant="secondary">
                          Read the full brief
                        </ButtonLink>
                        <Button variant="ghost" onClick={() => setDecliningId(b.id)}>
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------- in progress */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="mb-3.5 text-[15px] font-semibold">In progress</h2>
          <Card className="divide-y divide-line-soft overflow-hidden">
            {inProgress.map((b) => {
              const campaign = campaignOf(b)!;
              const brand = brandOf(b)!;
              const next =
                b.status === "accepted"
                  ? "Write your draft"
                  : b.status === "changes_requested"
                    ? "Changes requested"
                    : b.status === "draft_submitted"
                      ? "Waiting on the brand"
                      : b.status === "approved"
                        ? "Ready to publish"
                        : b.scheduledFor
                          ? `Posts ${fmtDate(b.scheduledFor)}`
                          : "";
              const actionable = ["accepted", "changes_requested", "approved", "scheduled"].includes(
                b.status,
              );
              return (
                <Link
                  key={b.id}
                  href={`/creator/offers/${b.id}`}
                  className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas"
                >
                  <Avatar name={brand.company} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{brand.company}</p>
                    <p className="truncate text-[12px] text-muted">{campaign.name}</p>
                  </div>
                  <p className="tnum text-[13.5px] font-semibold">{eur(b.pricePerPost)}</p>
                  <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                  <span
                    className={cx(
                      "w-[150px] text-right text-[12px]",
                      actionable ? "font-medium text-brand" : "text-muted",
                    )}
                  >
                    {next} {actionable && "→"}
                  </span>
                </Link>
              );
            })}
          </Card>
        </div>
      )}

      {/* ----------------------------------------------------------- done */}
      {done.length > 0 && (
        <div>
          <h2 className="mb-3.5 text-[15px] font-semibold">Published</h2>
          <Card className="divide-y divide-line-soft overflow-hidden">
            {done.map((b) => {
              const brand = brandOf(b)!;
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar name={brand.company} size={30} />
                  <p className="min-w-0 flex-1 truncate text-[13px]">{brand.company}</p>
                  {b.metrics && (
                    <p className="tnum hidden text-[12px] text-muted sm:block">
                      {b.metrics.leads} leads
                    </p>
                  )}
                  <p className="tnum text-[13px] font-semibold">{eur(b.pricePerPost)}</p>
                  <Badge tone={b.payout.paid ? "good" : "warn"}>
                    {b.payout.paid ? "Paid" : "Payout pending"}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
