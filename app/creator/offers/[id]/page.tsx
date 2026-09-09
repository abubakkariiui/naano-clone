"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Stat,
  cx,
  eur,
  fmtCompact,
  fmtDate,
  relTime,
} from "@/components/ui";
import { useCreatorData } from "@/lib/store";
import { STATUS_TONE } from "@/lib/status";
import { STATUS_LABEL } from "@/lib/types";

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const store = useCreatorData();

  const booking = store.bookings.find((b) => b.id === id);
  const campaign = store.campaigns.find((c) => c.id === booking?.campaignId);
  const brand = store.brands.find((b) => b.id === campaign?.brandId);

  const [body, setBody] = useState(booking?.draft?.body ?? "");
  const [when, setWhen] = useState("");

  if (!booking || !campaign || !brand) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        Offer not found.{" "}
        <Link href="/creator" className="text-brand">
          Back to offers
        </Link>
      </Card>
    );
  }

  const me = store.me;
  const canWrite = ["accepted", "changes_requested"].includes(booking.status);
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  const trackingLink = `${campaign.trackingBase}/${campaign.id.slice(-4)}-${me.name
    .split(" ")[0]
    .toLowerCase()}`;

  return (
    <div className="space-y-5">
      <Link
        href="/creator"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Offers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={brand.company} size={48} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{brand.company}</h1>
              <Badge tone={STATUS_TONE[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
            </div>
            <p className="mt-0.5 text-[13.5px] text-muted">
              {campaign.name} · {campaign.objective}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="tnum text-[26px] font-semibold leading-none">{eur(booking.pricePerPost)}</p>
          <p className="mt-1 text-[11.5px] text-muted">paid within 24h of posting</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_290px]">
        <div className="min-w-0 space-y-5">
          {/* ------------------------------------------ feedback, if any */}
          {booking.status === "changes_requested" && booking.feedback && (
            <Card className="border-l-4 border-l-amber-400 bg-amber-50/40 p-4">
              <p className="text-[12px] font-semibold text-amber-900">
                {brand.company} asked for changes
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-amber-900">
                {booking.feedback}
              </p>
            </Card>
          )}

          {/* ------------------------------------------------- composer */}
          {canWrite ? (
            <Card className="p-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="text-[14px] font-semibold">
                  {booking.draft ? `Revise your draft (v${booking.draft.revision})` : "Write your post"}
                </p>
                <p className="tnum text-[11.5px] text-muted">{words} words</p>
              </div>

              <div className="rounded-[10px] bg-canvas p-3 ring-1 ring-line-soft">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <Avatar name={me.name} size={32} />
                  <div>
                    <p className="text-[12.5px] font-semibold">{me.name}</p>
                    <p className="text-[11px] text-muted">
                      {fmtCompact(me.followers)} followers · this post will be marked sponsored
                    </p>
                  </div>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  placeholder="Open with a specific moment, not a statistic…"
                  className="w-full resize-y rounded-lg bg-surface p-3 text-[13.5px] leading-relaxed ring-1 ring-line placeholder:text-muted"
                />
                <p className="mt-2 font-mono text-[11.5px] text-brand">{trackingLink}</p>
                <p className="mt-1 text-[11px] text-muted">
                  Your tracked link. Paste it as the CTA — every click is attributed to you.
                </p>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <Button
                  onClick={() => store.submitDraft(booking.id, body)}
                  disabled={words < 20}
                >
                  {booking.draft ? "Resubmit for review" : "Submit for review"}
                </Button>
                {words < 20 && (
                  <p className="self-center text-[12px] text-muted">
                    Write at least 20 words before submitting.
                  </p>
                )}
              </div>
            </Card>
          ) : (
            booking.draft && (
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold">Your draft (v{booking.draft.revision})</p>
                  <p className="text-[11.5px] text-muted">
                    submitted {relTime(booking.draft.submittedAt)}
                  </p>
                </div>
                <div className="rounded-[10px] bg-canvas p-4 ring-1 ring-line-soft">
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">
                    {booking.draft.body || "(no body captured)"}
                  </p>
                  <p className="mt-3 border-t border-line pt-2.5 font-mono text-[11.5px] text-brand">
                    {trackingLink}
                  </p>
                </div>
              </Card>
            )
          )}

          {/* ---------------------------------------- publish / schedule */}
          {booking.status === "approved" && (
            <Card className="p-4">
              <p className="text-[14px] font-semibold">Approved — ready to go</p>
              <p className="mt-1 text-[13px] text-muted">
                Publish now, or schedule it for when your audience is most active.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <Button onClick={() => store.publish(booking.id)}>Publish now</Button>
                <span className="text-[12px] text-muted">or</span>
                <input
                  type="date"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="h-10 rounded-[10px] bg-surface px-3 text-[13px] ring-1 ring-line"
                />
                <Button
                  variant="secondary"
                  disabled={!when}
                  onClick={() => store.schedule(booking.id, new Date(when).toISOString())}
                >
                  Schedule
                </Button>
              </div>
            </Card>
          )}

          {booking.status === "scheduled" && booking.scheduledFor && (
            <Card className="p-4">
              <p className="text-[14px] font-semibold">
                Scheduled for {fmtDate(booking.scheduledFor)}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                It will publish automatically. You can still push it out early.
              </p>
              <Button className="mt-3.5" onClick={() => store.publish(booking.id)}>
                Publish now instead
              </Button>
            </Card>
          )}

          {booking.metrics && (
            <Card className="grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
              <Stat label="Impressions" value={fmtCompact(booking.metrics.impressions)} />
              <Stat label="Clicks" value={booking.metrics.clicks.toLocaleString("en-GB")} />
              <Stat label="Leads" value={booking.metrics.leads} accent />
              <Stat
                label="Your fee"
                value={eur(booking.pricePerPost)}
                sub={booking.payout.paid ? "paid" : "pending"}
              />
            </Card>
          )}

          {/* -------------------------------------------------- timeline */}
          <Card className="p-4">
            <p className="mb-3 text-[13px] font-semibold">History</p>
            <ol className="space-y-2">
              {booking.events.map((e, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[12.5px]">
                  <span
                    className={cx(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      e.by === "creator" ? "bg-brand" : e.by === "brand" ? "bg-ink" : "bg-emerald-500",
                    )}
                  />
                  <span className="text-ink-soft">{e.label}</span>
                  <span className="ml-auto text-muted">{relTime(e.at)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* ------------------------------------------------------ the brief */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-4">
            <p className="eyebrow mb-2.5">The brief</p>

            <p className="mb-1.5 text-[12px] font-semibold">Key messages</p>
            <ul className="mb-3.5 space-y-1">
              {campaign.keyMessages.map((m, i) => (
                <li key={i} className="flex gap-1.5 text-[12.5px] leading-snug text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                  {m}
                </li>
              ))}
            </ul>

            <p className="mb-1.5 text-[12px] font-semibold">Guidelines</p>
            <ul className="mb-3.5 space-y-1">
              {campaign.guidelines.map((m, i) => (
                <li key={i} className="flex gap-1.5 text-[12.5px] leading-snug text-ink-soft">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {m}
                </li>
              ))}
            </ul>

            <p className="mb-1.5 text-[12px] font-semibold">Do not</p>
            <ul className="space-y-1">
              {campaign.doNots.map((m, i) => (
                <li key={i} className="flex gap-1.5 text-[12.5px] leading-snug text-ink-soft">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-3 w-3 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  {m}
                </li>
              ))}
            </ul>

            {campaign.landingUrl && (
              <div className="mt-3.5 border-t border-line-soft pt-3">
                <p className="text-[11px] tracking-wide text-muted uppercase">Landing page</p>
                <p className="mt-1 truncate font-mono text-[11.5px] text-brand">
                  {campaign.landingUrl}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2">Your voice stays yours</p>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              The brand approves the message, not the wording. If a guideline does not work
              for your audience, say so in the draft notes — you are not obliged to take
              the deal.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
