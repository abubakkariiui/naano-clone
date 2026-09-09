"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar, Badge, Wordmark, cx } from "./ui";

const BRAND_NAV = [
  { href: "/brand", label: "Overview", icon: "grid" },
  { href: "/brand/marketplace", label: "Marketplace", icon: "search" },
  { href: "/brand/campaigns", label: "Campaigns", icon: "layers" },
  { href: "/brand/results", label: "Results", icon: "chart" },
  { href: "/brand/payouts", label: "Payouts", icon: "wallet" },
];

const CREATOR_NAV = [
  { href: "/creator", label: "Offers", icon: "inbox" },
  { href: "/creator/posts", label: "My posts", icon: "layers" },
  { href: "/creator/earnings", label: "Earnings", icon: "wallet" },
  { href: "/creator/profile", label: "Profile", icon: "user" },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    search: "M11 3a8 8 0 105.3 14L21 21M11 3a8 8 0 00-8 8",
    layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    wallet: "M3 7h18v12H3zM3 7l2-3h12l2 3M16 13h2",
    inbox: "M3 12h5l1 3h6l1-3h5M3 12l2-7h14l2 7v7H3z",
    user: "M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5M12 3a4 4 0 100 8 4 4 0 000-8",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** The role switch is the product's defining feature made visible in one click. */
function RoleSwitch() {
  const { role, setRole } = useStore();
  const router = useRouter();

  const flip = (next: "brand" | "creator") => {
    setRole(next);
    router.push(next === "brand" ? "/brand" : "/creator");
  };

  return (
    <div className="flex rounded-[10px] bg-line-soft p-0.5" role="tablist" aria-label="Switch side">
      {(["brand", "creator"] as const).map((r) => (
        <button
          key={r}
          role="tab"
          aria-selected={role === r}
          onClick={() => flip(r)}
          className={cx(
            "h-7 rounded-lg px-2.5 text-[12px] font-medium capitalize transition-colors",
            role === r ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

export function AppShell({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "brand" | "creator";
}) {
  const pathname = usePathname();
  const store = useStore();
  const nav = side === "brand" ? BRAND_NAV : CREATOR_NAV;
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = store.brands.find((b) => b.id === store.brandId)!;
  const me = store.creators.find((c) => c.id === store.creatorId)!;

  // Counts that matter: what is waiting on you, on this side.
  const pending =
    side === "brand"
      ? store.bookings.filter((b) => b.status === "draft_submitted").length
      : store.bookings.filter((b) => b.creatorId === store.creatorId && b.status === "invited").length;

  return (
    <div className="min-h-dvh lg:flex">
      {/* ---------------------------------------------------------- sidebar */}
      <aside
        className={cx(
          "z-40 shrink-0 border-line bg-surface lg:block lg:w-[236px] lg:border-r",
          mobileOpen ? "fixed inset-0 block" : "hidden",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-4 lg:h-16">
            <Link href="/" className="text-ink">
              <Wordmark />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-muted lg:hidden"
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" fill="none">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="px-3 pb-3">
            <RoleSwitch />
          </div>

          <nav className="flex-1 space-y-0.5 px-2">
            {nav.map((item) => {
              const active =
                item.href === `/${side}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const badge = pending > 0 && (
                (side === "brand" && item.href === "/brand/campaigns") ||
                (side === "creator" && item.href === "/creator")
              );
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cx(
                    "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                    active ? "bg-line-soft text-ink" : "text-ink-soft hover:bg-line-soft hover:text-ink",
                  )}
                >
                  <Icon name={item.icon} className="h-[17px] w-[17px]" />
                  {item.label}
                  {badge && (
                    <span className="tnum ml-auto rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {pending}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-line p-3">
            {side === "brand" ? (
              <div className="flex items-center gap-2.5">
                <Avatar name={brand.company} size={32} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{brand.company}</p>
                  <p className="text-[11px] text-muted">{brand.plan}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Avatar name={me.name} size={32} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{me.name}</p>
                  <p className="text-[11px] text-muted">{me.followers.toLocaleString("en-GB")} followers</p>
                </div>
              </div>
            )}
            <button
              onClick={store.reset}
              className="mt-2.5 w-full rounded-lg px-2 py-1.5 text-left text-[11.5px] text-muted transition-colors hover:bg-line-soft hover:text-ink"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- main */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-ink">
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Wordmark />
          <div className="ml-auto">
            <Badge tone={side === "brand" ? "brand" : "good"}>{side}</Badge>
          </div>
        </header>
        <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
