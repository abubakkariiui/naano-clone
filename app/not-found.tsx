import Link from "next/link";
import { ButtonLink, Wordmark } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-[420px] text-center">
        <Link href="/" className="inline-block text-ink">
          <Wordmark />
        </Link>
        <p className="mt-8 text-[15px] font-medium">That page does not exist.</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          The link may be stale, or you may have landed on a campaign or creator that was
          removed from your demo data.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/brand/marketplace">Browse the marketplace</ButtonLink>
          <ButtonLink href="/creator" variant="secondary">
            Creator side
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
