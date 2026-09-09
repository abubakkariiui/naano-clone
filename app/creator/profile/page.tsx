"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Meter,
  SectionTitle,
  cx,
  eur,
  fmtCompact,
  fmtInt,
} from "@/components/ui";
import { useCreatorData } from "@/lib/store";

export default function CreatorProfilePage() {
  const store = useCreatorData();
  const me = store.me;
  const [switching, setSwitching] = useState(false);

  const rows = [
    { title: "Vertical", data: me.audience.verticals },
    { title: "Seniority", data: me.audience.seniority },
    { title: "Function", data: me.audience.functions },
  ];

  // How many live campaigns currently target this creator's strongest vertical.
  const demand = store.campaigns.filter((c) =>
    c.targetVerticals.includes(me.vertical),
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1.5">Profile</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            How brands see you.
          </h1>
        </div>
        <Button variant="secondary" onClick={() => setSwitching((s) => !s)}>
          {switching ? "Close" : "Switch creator"}
        </Button>
      </div>

      {/* Demo affordance: see the creator side as any of the seeded creators. */}
      {switching && (
        <Card className="rise p-4">
          <p className="mb-1 text-[13px] font-semibold">View as another creator</p>
          <p className="mb-3 text-[12px] text-muted">
            A demo shortcut, not a real feature — it lets you see the creator side from any
            profile in the marketplace.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {store.creators.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  store.setCreatorId(c.id);
                  setSwitching(false);
                }}
                className={cx(
                  "flex items-center gap-2.5 rounded-[10px] p-2.5 text-left ring-1 transition-colors",
                  c.id === me.id ? "bg-brand-tint ring-brand" : "bg-surface ring-line hover:bg-canvas",
                )}
              >
                <Avatar name={c.name} size={30} />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium">{c.name}</p>
                  <p className="tnum truncate text-[11px] text-muted">
                    {eur(c.pricePerPost)} · {fmtCompact(c.followers)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={me.name} size={60} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{me.name}</h2>
              <Badge tone="brand">Vetted</Badge>
            </div>
            <p className="mt-1 text-[13.5px] text-muted">{me.headline}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge>{me.vertical}</Badge>
              <Badge>{fmtInt(me.followers)} followers</Badge>
              <Badge>★ {me.rating.toFixed(1)} · {me.reviews} campaigns</Badge>
              <Badge>{me.deliveryDays}-day turnaround</Badge>
            </div>
          </div>
        </div>
        <p className="mt-4 border-t border-line-soft pt-4 text-[13.5px] leading-relaxed text-ink-soft">
          {me.bio}
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_290px]">
        <Card className="p-5">
          <SectionTitle eyebrow="What brands filter on" title="Your audience" />
          <div className="grid gap-5 sm:grid-cols-3">
            {rows.map((row) => (
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
          <p className="mt-4 border-t border-line-soft pt-3.5 text-[11.5px] leading-relaxed text-muted">
            Concentration is an asset here. A tightly focused audience scores higher on
            campaign fit than a large diffuse one, which is why smaller creators win
            briefs on this marketplace.
          </p>
        </Card>

        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-line px-4 py-3.5">
              <p className="eyebrow mb-1">Your rate</p>
              <p className="tnum text-[28px] font-semibold leading-none">
                {eur(me.pricePerPost)}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted">per post, flat. No commission.</p>
            </div>
            <div className="space-y-2.5 p-4 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Avg impressions</span>
                <span className="tnum font-medium">{fmtCompact(me.stats.avgImpressions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Avg clicks</span>
                <span className="tnum font-medium">{fmtInt(me.stats.avgClicks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Avg leads</span>
                <span className="tnum font-medium">{me.stats.avgLeads}</span>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-2.5">
                <span className="text-muted">Effective CPL for brands</span>
                <span className="tnum font-medium">
                  {eur(me.pricePerPost / Math.max(1, me.stats.avgLeads))}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-1.5">Demand</p>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              {demand > 0 ? (
                <>
                  <span className="font-semibold">{demand}</span> live campaign
                  {demand === 1 ? "" : "s"} currently targeting {me.vertical}.
                </>
              ) : (
                <>No live campaigns are targeting {me.vertical} right now.</>
              )}
            </p>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-1.5">Languages &amp; reach</p>
            <p className="text-[12.5px] text-ink-soft">{me.languages.join(", ")}</p>
            <p className="mt-1 text-[12.5px] text-muted">
              Audience in {me.audience.countries.join(", ")}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
