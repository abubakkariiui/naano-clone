"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FitPill } from "@/components/CreatorCard";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Empty,
  SectionTitle,
  Stat,
  cx,
  eur,
  fmtCompact,
  fmtDate,
  fmtInt,
  relTime,
} from "@/components/ui";
import { useBrandData } from "@/lib/store";
import { STATUS_TONE } from "@/lib/status";
import { STATUS_LABEL, type Booking } from "@/lib/types";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const store = useBrandData();

  const campaign = store.campaigns.find((c) => c.id === id);
  const [openId, setOpenId] = useState<string | null>(params.get("booking"));
  const [feedback, setFeedback] = useState("");

  if (!campaign) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        Campaign not found.{" "}
        <Link href="/brand/campaigns" className="text-brand">
          All campaigns
        </Link>
      </Card>
    );
  }

  const bookings = store.bookings.filter((b) => b.campaignId === campaign.id);
  const creatorOf = (cid: string) => store.creators.find((c) => c.id === cid)!;
  const live = bookings.filter((b) => b.metrics);
  const totals = live.reduce(
    (a, b) => ({
      impressions: a.impressions + b.metrics!.impressions,
      clicks: a.clicks + b.metrics!.clicks,
      leads: a.leads + b.metrics!.leads,
      pipeline: a.pipeline + b.metrics!.pipeline,
    }),
    { impressions: 0, clicks: 0, leads: 0, pipeline: 0 },
  );
  const committed = bookings
    .filter((b) => !["declined", "invited"].includes(b.status))
    .reduce((s, b) => s + b.pricePerPost, 0);

  const trackingLink = (b: Booking) =>
    `${campaign.trackingBase}/${campaign.id.slice(-4)}-${creatorOf(b.creatorId).name.split(" ")[0].toLowerCase()}`;

  const approve = (b: Booking) => {
    store.approveDraft(b.id);
    setOpenId(null);
  };
  const reject = (b: Booking) => {
    if (!feedback.trim()) return;
    store.requestChanges(b.id, feedback.trim());
    setFeedback("");
    setOpenId(null);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/brand/campaigns"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Campaigns
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={campaign.status === "live" ? "good" : "neutral"}>
              {campaign.status === "live" ? "Live" : "Draft"}
            </Badge>
            <span className="text-[12px] text-muted">{campaign.objective}</span>
          </div>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em]">{campaign.name}</h1>
        </div>
        <ButtonLink href={`/brand/marketplace?campaign=${campaign.id}`} variant="secondary">
          Add creators
        </ButtonLink>
      </div>

      <Card className="grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
        <Stat label="Attributed pipeline" value={eur(totals.pipeline)} accent />
        <Stat label="Impressions" value={fmtCompact(totals.impressions)} sub={`${fmtInt(totals.clicks)} clicks`} />
        <Stat label="Leads" value={fmtInt(totals.leads)} />
        <Stat
          label="Committed"
          value={eur(committed)}
          sub={`of ${eur(campaign.budget)} budget`}
        />
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_290px]">
        {/* ------------------------------------------------------- pipeline */}
        <div className="min-w-0">
          <SectionTitle
            eyebrow="Collaborations"
            title={`${bookings.length} creator${bookings.length === 1 ? "" : "s"}`}
          />
          {bookings.length === 0 ? (
            <Card>
              <Empty
                title="No creators booked yet"
                body="Find creators whose audience matches this brief, then invite them."
                action={
                  <ButtonLink href={`/brand/marketplace?campaign=${campaign.id}`}>
                    Browse the marketplace
                  </ButtonLink>
                }
              />
            </Card>
          ) : (
            <Card className="divide-y divide-line-soft overflow-hidden">
              {bookings.map((b) => {
                const c = creatorOf(b.creatorId);
                const isOpen = openId === b.id;
                return (
                  <div key={b.id}>
                    <div className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                      <Avatar name={c.name} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/brand/marketplace/${c.id}?campaign=${campaign.id}`}
                            className="truncate text-[13.5px] font-medium hover:underline"
                          >
                            {c.name}
                          </Link>
                          <FitPill score={b.fitScore} />
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {eur(b.pricePerPost)} ·{" "}
                          {b.status === "scheduled" && b.scheduledFor
                            ? `posts ${fmtDate(b.scheduledFor)}`
                            : b.events.length > 0
                              ? relTime(b.events[b.events.length - 1].at)
                              : "—"}
                        </p>
                      </div>

                      {b.metrics && (
                        <div className="tnum hidden gap-4 text-right text-[12px] sm:flex">
                          <div>
                            <p className="text-[10px] text-muted uppercase">Reach</p>
                            <p className="font-medium">{fmtCompact(b.metrics.impressions)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase">Leads</p>
                            <p className="font-medium">{b.metrics.leads}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase">Pipeline</p>
                            <p className="font-medium">{eur(b.metrics.pipeline)}</p>
                          </div>
                        </div>
                      )}

                      <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>

                      {(b.status === "draft_submitted" || b.draft) && (
                        <Button
                          size="sm"
                          variant={b.status === "draft_submitted" ? "primary" : "secondary"}
                          onClick={() => setOpenId(isOpen ? null : b.id)}
                        >
                          {b.status === "draft_submitted" ? "Review draft" : isOpen ? "Hide" : "View"}
                        </Button>
                      )}
                    </div>

                    {/* --------------------------------------- draft review */}
                    {isOpen && b.draft && (
                      <div className="rise border-t border-line-soft bg-canvas px-4 py-4">
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                          <p className="text-[12px] font-semibold">
                            Draft v{b.draft.revision}
                            <span className="ml-2 font-normal text-muted">
                              submitted {relTime(b.draft.submittedAt)}
                            </span>
                          </p>
                          {b.feedback && <Badge tone="warn">Changes requested</Badge>}
                        </div>

                        <div className="rounded-[10px] bg-surface p-4 ring-1 ring-line">
                          <div className="mb-3 flex items-center gap-2.5">
                            <Avatar name={c.name} size={32} />
                            <div>
                              <p className="text-[12.5px] font-semibold">{c.name}</p>
                              <p className="text-[11px] text-muted">
                                {fmtCompact(c.followers)} followers · sponsored
                              </p>
                            </div>
                          </div>
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">
                            {b.draft.body || "(no body captured for this draft)"}
                          </p>
                          <p className="mt-3 border-t border-line-soft pt-2.5 font-mono text-[11.5px] text-brand">
                            {trackingLink(b)}
                          </p>
                        </div>

                        {b.status === "draft_submitted" && (
                          <div className="mt-3.5">
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={2}
                              placeholder="What needs to change? (required to request changes)"
                              className="w-full resize-y rounded-[10px] bg-surface p-3 text-[13px] ring-1 ring-line placeholder:text-muted"
                            />
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              <Button size="sm" onClick={() => approve(b)}>
                                Approve draft
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => reject(b)}
                                disabled={!feedback.trim()}
                              >
                                Request changes
                              </Button>
                            </div>
                          </div>
                        )}

                        {b.status !== "draft_submitted" && b.feedback && (
                          <p className="mt-3 rounded-[10px] bg-amber-50 p-3 text-[12.5px] text-amber-900 ring-1 ring-amber-100">
                            <span className="font-semibold">Your note:</span> {b.feedback}
                          </p>
                        )}

                        {/* Audit trail: who did what, when. */}
                        <ol className="mt-4 space-y-1.5 border-t border-line pt-3">
                          {b.events.map((e, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11.5px]">
                              <span
                                className={cx(
                                  "h-1.5 w-1.5 shrink-0 rounded-full",
                                  e.by === "brand" ? "bg-ink" : e.by === "creator" ? "bg-brand" : "bg-emerald-500",
                                )}
                              />
                              <span className="text-ink-soft">{e.label}</span>
                              <span className="ml-auto text-muted">{relTime(e.at)}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>
          )}
        </div>

        {/* ---------------------------------------------------------- brief */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-4">
            <p className="eyebrow mb-2.5">The brief</p>
            <BriefBlock title="Key messages" items={campaign.keyMessages} />
            <BriefBlock title="Guidelines" items={campaign.guidelines} />
            <BriefBlock title="Do not" items={campaign.doNots} tone="bad" />
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2.5">Targeting</p>
            <dl className="space-y-2.5 text-[12.5px]">
              {[
                ["Verticals", campaign.targetVerticals],
                ["Seniority", campaign.targetSeniority],
                ["Function", campaign.targetFunctions],
              ].map(([label, vals]) => (
                <div key={label as string}>
                  <dt className="text-[11px] tracking-wide text-muted uppercase">{label as string}</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {(vals as string[]).length === 0 ? (
                      <span className="text-muted">Any</span>
                    ) : (
                      (vals as string[]).map((v) => <Badge key={v}>{v}</Badge>)
                    )}
                  </dd>
                </div>
              ))}
              {campaign.landingUrl && (
                <div>
                  <dt className="text-[11px] tracking-wide text-muted uppercase">Landing page</dt>
                  <dd className="mt-1 truncate font-mono text-[11.5px] text-brand">
                    {campaign.landingUrl}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function BriefBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "bad";
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3.5 last:mb-0">
      <p className="mb-1.5 text-[12px] font-semibold">{title}</p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5 text-[12.5px] leading-snug text-ink-soft">
            <span className={cx("mt-1.5 h-1 w-1 shrink-0 rounded-full", tone === "bad" ? "bg-red-400" : "bg-muted")} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
