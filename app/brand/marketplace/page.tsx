"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorCard } from "@/components/CreatorCard";
import { Button, Card, Empty, cx, eur, fmtCompact } from "@/components/ui";
import { fitScore } from "@/lib/fit";
import { useBrandData } from "@/lib/store";
import { VERTICALS, type Vertical } from "@/lib/types";

type SortKey = "fit" | "price_asc" | "price_desc" | "reach" | "cpl";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "fit", label: "Audience fit" },
  { key: "cpl", label: "Est. cost per lead" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
  { key: "reach", label: "Reach" },
];

const TIERS = [
  { label: "Nano · 1–10K", min: 0, max: 10000 },
  { label: "Micro · 10–25K", min: 10000, max: 25000 },
  { label: "Mid · 25–50K", min: 25000, max: 50000 },
];

export default function Marketplace() {
  const store = useBrandData();
  const router = useRouter();

  const liveCampaigns = store.campaigns;
  const [campaignId, setCampaignId] = useState(liveCampaigns[0]?.id ?? "");
  const campaign = liveCampaigns.find((c) => c.id === campaignId);

  const [q, setQ] = useState("");
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [tiers, setTiers] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sort, setSort] = useState<SortKey>("fit");

  const scored = useMemo(() => {
    const rows = store.creators.map((c) => ({
      creator: c,
      fit: campaign ? fitScore(c, campaign) : null,
    }));

    const filtered = rows.filter(({ creator: c }) => {
      if (q) {
        const hay = `${c.name} ${c.headline} ${c.vertical}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (verticals.length && !verticals.includes(c.vertical)) return false;
      if (c.pricePerPost > maxPrice) return false;
      if (tiers.length) {
        const inTier = tiers.some((i) => {
          const t = TIERS[i];
          return c.followers >= t.min && c.followers < t.max;
        });
        if (!inTier) return false;
      }
      return true;
    });

    const cplOf = (r: (typeof rows)[number]) => {
      const leads = r.creator.stats.avgLeads;
      return leads > 0 ? r.creator.pricePerPost / leads : Infinity;
    };

    return filtered.sort((a, b) => {
      switch (sort) {
        case "fit":
          return (b.fit ?? 0) - (a.fit ?? 0);
        case "cpl":
          return cplOf(a) - cplOf(b);
        case "price_asc":
          return a.creator.pricePerPost - b.creator.pricePerPost;
        case "price_desc":
          return b.creator.pricePerPost - a.creator.pricePerPost;
        case "reach":
          return b.creator.followers - a.creator.followers;
      }
    });
  }, [store.creators, campaign, q, verticals, tiers, maxPrice, sort]);

  const shortlisted = store.creators.filter((c) => store.shortlist.includes(c.id));
  const shortlistTotal = shortlisted.reduce((s, c) => s + c.pricePerPost, 0);

  const alreadyBooked = new Set(
    store.bookings.filter((b) => b.campaignId === campaignId).map((b) => b.creatorId),
  );

  const toggleVertical = (v: Vertical) =>
    setVerticals((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const sendInvites = () => {
    store.invite(campaignId, store.shortlist);
    router.push(`/brand/campaigns/${campaignId}`);
  };

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1.5">Marketplace</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Work with all the best creators.
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-muted">
            {store.creators.length} vetted B2B voices. Ranked by how much of their
            audience matches your campaign — not by follower count.
          </p>
        </div>

        {liveCampaigns.length > 0 && (
          <label className="text-[12px] font-medium text-muted">
            Score against
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1 block h-9 w-full min-w-[240px] rounded-[10px] bg-surface px-2.5 text-[13px] font-medium text-ink ring-1 ring-line"
            >
              {liveCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="lg:flex lg:gap-6">
        {/* ------------------------------------------------------- filters */}
        <aside className="mb-5 shrink-0 lg:mb-0 lg:w-[212px]">
          <div className="space-y-5 lg:sticky lg:top-6">
            <div>
              <label htmlFor="search" className="eyebrow mb-2 block">
                Search
              </label>
              <input
                id="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name or topic"
                className="h-9 w-full rounded-[10px] bg-surface px-3 text-[13px] ring-1 ring-line placeholder:text-muted"
              />
            </div>

            <div>
              <p className="eyebrow mb-2">Vertical</p>
              <div className="flex flex-wrap gap-1.5">
                {VERTICALS.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleVertical(v)}
                    aria-pressed={verticals.includes(v)}
                    className={cx(
                      "rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 transition-colors",
                      verticals.includes(v)
                        ? "bg-ink text-white ring-ink"
                        : "bg-surface text-ink-soft ring-line hover:bg-line-soft",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-2">Audience size</p>
              <div className="space-y-1.5">
                {TIERS.map((t, i) => (
                  <label key={t.label} className="flex cursor-pointer items-center gap-2 text-[12.5px]">
                    <input
                      type="checkbox"
                      checked={tiers.includes(i)}
                      onChange={() =>
                        setTiers((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
                      }
                      className="h-3.5 w-3.5 accent-[#1b4dff]"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-2">Max per post</p>
              <input
                type="range"
                min={100}
                max={1500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1b4dff]"
                aria-label="Maximum price per post"
              />
              <p className="tnum mt-1 text-[12.5px] font-medium">{eur(maxPrice)}</p>
            </div>

            {(verticals.length > 0 || tiers.length > 0 || q || maxPrice < 1500) && (
              <button
                onClick={() => {
                  setVerticals([]);
                  setTiers([]);
                  setQ("");
                  setMaxPrice(1500);
                }}
                className="text-[12px] font-medium text-brand hover:underline"
              >
                Clear all filters
              </button>
            )}

            <div className="rounded-card bg-brand-tint p-3 ring-1 ring-blue-100">
              <p className="text-[12px] font-semibold text-brand">Why fit, not followers?</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                A creator with 3K followers in your exact vertical can beat a 100K
                generalist on click-through. Fit is computed from audience overlap only.
              </p>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------- results */}
        <div className="min-w-0 flex-1">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <p className="text-[13px] text-muted">
              <span className="tnum font-medium text-ink">{scored.length}</span> creators
              {campaign && <> · scored against <span className="font-medium text-ink">{campaign.name}</span></>}
            </p>
            <label className="flex items-center gap-2 text-[12px] text-muted">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-8 rounded-lg bg-surface px-2 text-[12.5px] font-medium text-ink ring-1 ring-line"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {scored.length === 0 ? (
            <Card>
              <Empty
                title="No creators match those filters"
                body="Widen the price range or clear a vertical to see more of the marketplace."
              />
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {scored.map(({ creator, fit }) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  fit={fit}
                  href={`/brand/marketplace/${creator.id}?campaign=${campaignId}`}
                  selected={store.shortlist.includes(creator.id)}
                  onToggle={
                    alreadyBooked.has(creator.id)
                      ? undefined
                      : () => store.toggleShortlist(creator.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------- shortlist tray */}
      {shortlisted.length > 0 && (
        <div className="rise fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex -space-x-2">
              {shortlisted.slice(0, 5).map((c) => (
                <span key={c.id} className="rounded-full ring-2 ring-surface">
                  <span className="block">
                    <CreatorAvatarMini name={c.name} />
                  </span>
                </span>
              ))}
              {shortlisted.length > 5 && (
                <span className="tnum grid h-7 w-7 place-items-center rounded-full bg-line-soft text-[11px] font-semibold ring-2 ring-surface">
                  +{shortlisted.length - 5}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium">
                {shortlisted.length} creator{shortlisted.length > 1 ? "s" : ""} shortlisted
              </p>
              <p className="tnum text-[12px] text-muted">
                {eur(shortlistTotal)} total ·{" "}
                {fmtCompact(shortlisted.reduce((s, c) => s + c.stats.avgImpressions, 0))} est.
                reach
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => store.shortlist.forEach((id) => store.toggleShortlist(id))}>
                Clear
              </Button>
              <Button size="sm" onClick={sendInvites} disabled={!campaignId}>
                Invite to campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreatorAvatarMini({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((p) => p[0]).join("");
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
      {initials}
    </span>
  );
}
