import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- wordmark */

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M2 16 L9 2 L9 16 Z" fill="currentColor" />
        <path d="M9 16 L16 6 L16 16 Z" fill="currentColor" opacity="0.45" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight lowercase">naano</span>
    </span>
  );
}

/* ------------------------------------------------------------------ button */

type BtnProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "brand";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";
const BTN_SIZE = {
  sm: "h-8 px-3 text-[13px] rounded-lg",
  md: "h-10 px-4 text-sm rounded-[10px]",
  lg: "h-12 px-6 text-[15px] rounded-xl",
};
const BTN_VARIANT = {
  primary: "bg-ink text-white hover:bg-[#22242b]",
  brand: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-white text-ink ring-1 ring-line hover:bg-canvas",
  ghost: "text-ink-soft hover:bg-line-soft hover:text-ink",
  danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BtnProps & ComponentProps<"button">) {
  return (
    <button
      className={cx(BTN_BASE, BTN_SIZE[size], BTN_VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BtnProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(BTN_BASE, BTN_SIZE[size], BTN_VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------- card */

export function Card({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & ComponentProps<"div">) {
  return (
    <div
      className={cx("rounded-card bg-surface ring-1 ring-line", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ avatar */

const AVATAR_TINTS = [
  ["#1b4dff", "#7aa0ff"],
  ["#0f766e", "#5eead4"],
  ["#b45309", "#fcd34d"],
  ["#7e22ce", "#d8b4fe"],
  ["#be123c", "#fda4af"],
  ["#1e3a8a", "#93c5fd"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  const [from, to] = AVATAR_TINTS[hash(name) % AVATAR_TINTS.length];
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------------- badge */

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "good" | "warn" | "bad" | "live";
  className?: string;
}) {
  const tones = {
    neutral: "bg-line-soft text-ink-soft ring-line",
    brand: "bg-brand-tint text-brand ring-blue-200",
    good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warn: "bg-amber-50 text-amber-700 ring-amber-200",
    bad: "bg-red-50 text-red-700 ring-red-200",
    live: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- stat tile */

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</p>
      <p
        className={cx(
          "tnum mt-1 text-[22px] font-semibold leading-none tracking-tight",
          accent && "text-brand",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------- meter */

export function Meter({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "good" | "warn" | "neutral";
  className?: string;
}) {
  const fills = {
    brand: "bg-brand",
    good: "bg-emerald-500",
    warn: "bg-amber-500",
    neutral: "bg-ink-soft",
  };
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-line-soft", className)}>
      <div
        className={cx("h-full rounded-full transition-[width] duration-500", fills[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ empty state */

export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[15px] font-medium">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- formatters */

export const fmtInt = (n: number) => n.toLocaleString("en-GB");

export const fmtCompact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n);

export const eur = (n: number) =>
  `€${Math.round(n).toLocaleString("en-GB")}`;

export const eur2 = (n: number) =>
  `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86400000;
  if (diff < 0) {
    const d = Math.ceil(-diff / day);
    return d <= 1 ? "tomorrow" : `in ${d} days`;
  }
  if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))}m ago`;
  if (diff < day) return `${Math.round(diff / 3600000)}h ago`;
  const d = Math.round(diff / day);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
