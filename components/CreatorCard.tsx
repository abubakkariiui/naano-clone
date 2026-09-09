"use client";

import Link from "next/link";
import { fitTone, project } from "@/lib/fit";
import type { Creator } from "@/lib/types";
import { Avatar, Badge, Meter, cx, eur, fmtCompact } from "./ui";

export function FitPill({ score, className }: { score: number; className?: string }) {
  const tone = fitTone(score);
  return (
    <span
      className={cx(
        "tnum inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1",
        tone.cls,
        className,
      )}
      title={tone.label}
    >
      {score}% fit
    </span>
  );
}

export function CreatorCard({
  creator,
  fit,
  href,
  selected,
  onToggle,
}: {
  creator: Creator;
  fit: number | null;
  href: string;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const p = fit != null ? project(creator, fit) : null;

  return (
    <div
      className={cx(
        "group relative flex flex-col rounded-card bg-surface p-4 ring-1 transition-shadow hover:shadow-[0_1px_2px_rgba(10,10,11,0.04),0_8px_24px_-8px_rgba(10,10,11,0.12)]",
        selected ? "ring-2 ring-brand" : "ring-line",
      )}
    >
      {onToggle && (
        <button
          onClick={onToggle}
          aria-label={selected ? `Remove ${creator.name} from shortlist` : `Shortlist ${creator.name}`}
          aria-pressed={selected}
          className={cx(
            "absolute top-3.5 right-3.5 z-10 grid h-6 w-6 place-items-center rounded-md ring-1 transition-colors",
            selected
              ? "bg-brand text-white ring-brand"
              : "bg-surface text-muted ring-line hover:text-ink",
          )}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
            {selected ? <path d="M5 13l4 4L19 7" /> : <path d="M12 5v14M5 12h14" />}
          </svg>
        </button>
      )}

      <Link href={href} className="flex items-start gap-3 pr-8">
        <Avatar name={creator.name} size={42} />
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-semibold tracking-tight">{creator.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted">
            {creator.headline}
          </p>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{creator.vertical}</Badge>
        <Badge tone="neutral">{fmtCompact(creator.followers)} followers</Badge>
        {fit != null && <FitPill score={fit} />}
      </div>

      {fit != null && (
        <div className="mt-3">
          <Meter value={fit} tone={fit >= 85 ? "good" : fit >= 70 ? "brand" : "warn"} />
        </div>
      )}

      <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-line-soft pt-3">
        <div>
          <p className="text-[10.5px] tracking-wide text-muted uppercase">Per post</p>
          <p className="tnum mt-0.5 text-[14px] font-semibold">{eur(creator.pricePerPost)}</p>
        </div>
        <div>
          <p className="text-[10.5px] tracking-wide text-muted uppercase">
            {p ? "Est. leads" : "Avg leads"}
          </p>
          <p className="tnum mt-0.5 text-[14px] font-semibold">
            {p ? p.leads : creator.stats.avgLeads}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] tracking-wide text-muted uppercase">
            {p ? "Est. CPL" : "Avg reach"}
          </p>
          <p className="tnum mt-0.5 text-[14px] font-semibold">
            {p ? (p.cpl ? eur(p.cpl) : "—") : fmtCompact(creator.stats.avgImpressions)}
          </p>
        </div>
      </div>
    </div>
  );
}
