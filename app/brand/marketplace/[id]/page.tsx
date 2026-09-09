"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FitPill } from "@/components/CreatorCard";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Meter,
  SectionTitle,
  Stat,
  cx,
  eur,
  fmtCompact,
  fmtInt,
} from "@/components/ui";
import { LINKEDIN_ADS_CPL, fitBreakdown, project } from "@/lib/fit";
import { useBrandData } from "@/lib/store";
import { STATUS_LABEL } from "@/lib/types";

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const store = useBrandData();

  const creator = store.creators.find((c) => c.id === id);
  if (!creator) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        Creator not found. <Link href="/brand/marketplace" className="text-brand">Back to marketplace</Link>
      </Card>
    );
  }

  const campaignId = params.get("campaign") ?? store.campaigns[0]?.id ?? "";
  const campaign = store.campaigns.find((c) => c.id === campaignId);
  const breakdown = campaign ? fitBreakdown(creator, campaign) : null;
  const fit = breakdown?.score ?? null;
  const p = fit != null ? project(creator, fit) : null;

  const existing = store.bookings.find(
    (b) => b.creatorId === creator.id && b.campaignId === campaignId,
  );

  const invite = () => {
    store.invite(campaignId, [creator.id]);
    router.push(`/brand/campaigns/${campaignId}`);
  };

  const audienceRows = [
    { title: "Vertical", data: creator.audience.verticals },
    { title: "Seniority", data: creator.audience.seniority },
    { title: "Function", data: creator.audience.functions },
  ];

  return (
    <div>
      <Link
        href="/brand/marketplace"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Marketplace
      </Link>

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-5">
          {/* -------------------------------------------------------- header */}
          <Card className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={creator.name} size={60} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[21px] font-semibold tracking-[-0.02em]">{creator.name}</h1>
                  {creator.verified && (
                    <Badge tone="brand">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                        <path d="M12 2l2.4 1.8 3-.3 1 2.8 2.5 1.7-1 2.9 1 2.9-2.5 1.7-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3.1 16l1-2.9-1-2.9 2.5-1.7 1-2.8 3 .3z" />
                      </svg>
                      Vetted
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[13.5px] text-muted">{creator.headline}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Badge>{creator.vertical}</Badge>
                  <Badge>{fmtInt(creator.followers)} followers</Badge>
                  <Badge>★ {creator.rating.toFixed(1)} · {creator.reviews} campaigns</Badge>
                  <Badge>{creator.deliveryDays}-day turnaround</Badge>
                </div>
              </div>
            </div>
            <p className="mt-4 border-t border-line-soft pt-4 text-[13.5px] leading-relaxed text-ink-soft">
              {creator.bio}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted">
              <span>Languages · {creator.languages.join(", ")}</span>
              <span>Audience in · {creator.audience.countries.join(", ")}</span>
            </div>
          </Card>

          {/* --------------------------------------------------- fit reasons */}
          {breakdown && campaign && (
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="eyebrow mb-1">Audience fit</p>
                  <p className="text-[14px] font-medium">
                    Scored against <span className="font-semibold">{campaign.name}</span>
                  </p>
                </div>
                <FitPill score={breakdown.score} className="text-[13px]" />
              </div>
              <div className="divide-y divide-line-soft">
                {breakdown.parts.map((part) => (
                  <div key={part.label} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-[74px] shrink-0">
                      <p className="text-[12.5px] font-medium">{part.label}</p>
                      <p className="text-[11px] text-muted">
                        {Math.round(part.weight * 100)}% weight
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Meter
                        value={part.share * 100}
                        tone={part.share >= 0.7 ? "good" : part.share >= 0.45 ? "brand" : "warn"}
                      />
                      <p className="mt-1.5 text-[12px] text-muted">{part.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="border-t border-line bg-canvas px-5 py-3 text-[11.5px] leading-relaxed text-muted">
                Follower count is deliberately excluded from this score. It is the share
                of this creator&apos;s audience that matches who you are targeting.
              </p>
            </Card>
          )}

          {/* ------------------------------------------------------ audience */}
          <Card className="p-5">
            <SectionTitle eyebrow="Who follows them" title="Audience composition" />
            <div className="grid gap-5 sm:grid-cols-3">
              {audienceRows.map((row) => (
                <div key={row.title}>
                  <p className="mb-2.5 text-[12px] font-semibold">{row.title}</p>
                  <div className="space-y-2">
                    {Object.entries(row.data as Record<string, number>)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => (
                        <div key={k}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[12px] text-ink-soft">{k}</span>
                            <span className="tnum text-[11.5px] font-medium text-muted">
                              {Math.round(v * 100)}%
                            </span>
                          </div>
                          <Meter value={v * 100} tone="neutral" className="mt-1 h-1" />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* -------------------------------------------------- sample post */}
          <Card className="p-5">
            <SectionTitle eyebrow="Recent work" title="How they write" />
            <div className="rounded-[10px] bg-canvas p-4 ring-1 ring-line-soft">
              <div className="flex items-center gap-2.5">
                <Avatar name={creator.name} size={34} />
                <div>
                  <p className="text-[13px] font-semibold">{creator.name}</p>
                  <p className="text-[11px] text-muted">{creator.headline.split("·")[0].trim()}</p>
                </div>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed">{creator.samplePost}</p>
              <div className="tnum mt-3.5 flex gap-5 border-t border-line pt-3 text-[11.5px] text-muted">
                <span>{fmtCompact(creator.stats.avgImpressions)} impressions</span>
                <span>{fmtInt(creator.stats.avgClicks)} clicks</span>
                <span>{creator.stats.avgLeads} leads</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------- booking */}
        <aside className="mt-5 shrink-0 lg:mt-0 lg:w-[302px]">
          <Card className="overflow-hidden lg:sticky lg:top-6">
            <div className="border-b border-line px-5 py-4">
              <p className="eyebrow mb-1">Flat fee per post</p>
              <p className="tnum text-[30px] font-semibold leading-none tracking-tight">
                {eur(creator.pricePerPost)}
              </p>
              <p className="mt-1.5 text-[12px] text-muted">
                Set by the creator. No cost per click, no retainer.
              </p>
            </div>

            {p && (
              <>
                <div className="grid grid-cols-2 divide-x divide-line-soft border-b border-line-soft">
                  <Stat label="Est. reach" value={fmtCompact(p.impressions)} />
                  <Stat label="Est. clicks" value={fmtInt(p.clicks)} />
                </div>
                <div className="grid grid-cols-2 divide-x divide-line-soft border-b border-line">
                  <Stat label="Est. leads" value={p.leads} />
                  <Stat
                    label="Est. CPL"
                    value={p.cpl ? eur(p.cpl) : "—"}
                    accent
                    sub={p.cpl ? `vs ${eur(LINKEDIN_ADS_CPL)} LinkedIn Ads` : undefined}
                  />
                </div>
              </>
            )}

            <div className="p-4">
              {existing ? (
                <div className="rounded-[10px] bg-canvas p-3 text-center ring-1 ring-line-soft">
                  <p className="text-[12.5px] font-medium">
                    Already on this campaign
                  </p>
                  <Badge tone="brand" className="mt-1.5">
                    {STATUS_LABEL[existing.status]}
                  </Badge>
                  <Link
                    href={`/brand/campaigns/${campaignId}`}
                    className="mt-2.5 block text-[12px] font-medium text-brand hover:underline"
                  >
                    Open campaign →
                  </Link>
                </div>
              ) : (
                <>
                  <Button className="w-full" onClick={invite} disabled={!campaignId}>
                    Invite to campaign
                  </Button>
                  <button
                    onClick={() => store.toggleShortlist(creator.id)}
                    className={cx(
                      "mt-2 h-10 w-full rounded-[10px] text-sm font-medium ring-1 transition-colors",
                      store.shortlist.includes(creator.id)
                        ? "bg-brand-tint text-brand ring-blue-200"
                        : "bg-surface text-ink ring-line hover:bg-canvas",
                    )}
                  >
                    {store.shortlist.includes(creator.id) ? "Shortlisted ✓" : "Add to shortlist"}
                  </button>
                  <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted">
                    They accept or decline. You are only charged once a post goes live.
                  </p>
                </>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
