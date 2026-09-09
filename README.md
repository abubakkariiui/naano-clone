# Naano, rebuilt

A rebuild of [naano.com](https://naano.com) — the B2B LinkedIn creator marketplace —
built in a day for the 8x assignment.

Both sides of the marketplace work end to end. A brand can find creators ranked by
audience fit, brief them, review and approve drafts, watch attributed pipeline come
back, and pay them. A creator can take or turn down offers, write the post against the
brief, publish, and get paid. **Same data, both directions** — you can flip sides in one
click and watch your own action land on the other side.

- **Live:** _(deployment pending)_
- **Repo:** https://github.com/abubakkariiui/naano-clone
- **Agent logs:** [`.agent-logs/`](.agent-logs/) — every prompt and final response, captured automatically
- **Capture proof:** [`CAPTURE-TEST.md`](CAPTURE-TEST.md)
- **Product recon:** [`RECON.md`](RECON.md) — what the product is, before any code

## Try it in 60 seconds

There is no signup wall — that is deliberate, see below.

1. Land on `/`, pick **Launch a campaign**.
2. **Marketplace** → note creators are ranked by *fit*, not followers. Open one; the fit
   score is broken down into the three things it is actually made of.
3. Shortlist two or three, hit **Invite to campaign**.
4. Flip the sidebar switch to **Creator**. Your invite is sitting there. Accept it.
5. Write the draft — the brief stays pinned beside you as you type. Submit.
6. Flip back to **Brand**. The draft is waiting for review. Request changes, or approve.
7. As the creator again: publish. Then **Results** on the brand side shows the post's
   reach, clicks, leads and cost per lead against a LinkedIn Ads baseline.

`Reset demo data` in the sidebar puts everything back.

## What is worth looking at

### Fit is real logic, and it is explainable

The product's central claim is that *"a creator with 3k followers in your exact vertical
can outperform a 100k generalist on click-through rate."* So the fit score
([`lib/fit.ts`](lib/fit.ts)) is computed **only** from audience overlap — vertical (50%),
seniority (28%), function (22%), plus a concentration bonus. Follower count is
deliberately excluded: if reach leaked into the score, the marketplace would just
re-rank by size and the whole thesis would collapse.

You can see it working. Score the marketplace against the devtools campaign and Krishna
Iyer (14K followers, €365/post, €14 per lead) ranks above Daniel Okonkwo (48K, €1,350,
€31 per lead).

And it explains itself. Most marketplaces show a number; this one shows the three shares
that produced it, so you can disagree with it.

### Both sides are the same rows

`Booking` is the spine of the data model. A brand sees a pipeline; a creator sees an
inbox; they are projections of the same records. That is why the role switch works and
why the audit trail on every booking has entries from both parties plus Naano.

### The numbers are theirs, not invented

Seeded from Naano's own published figures: flat fee per post from €20 to €1,500, ~12%
CTR, ~€18 cost per qualified lead, €55–90 for LinkedIn Ads, 2,000+ creators across the
eight verticals they actually list.

I got this wrong first time round — my seed produced a €4 cost per lead, which quietly
made the product's economics nonsense. Leads are now derived backwards from a target CPL
per creator, so nano creators land below the €18 average and large generalists above it.
That commit is in the history, and the reasoning is in the log.

## What I deliberately left out

- **Real auth.** OAuth is a wall in front of a link somebody has five minutes for, and it
  demonstrates nothing. Instead: two doors on the landing page and a role switch. A
  reviewer sees the two-sidedness in ten seconds instead of creating two accounts.
- **Payment rails.** Payout is modelled as the three states the product surfaces —
  contract → invoice → payout. Stripe onboarding is infrastructure, not product.
- **A server database.** State is seeded and persisted to `localStorage`, so the live link
  works for anyone instantly with no account and no shared-state surprises between
  visitors. The trade-off: your changes are yours, in your browser.
- **The marketing site.** It is the part that already works and the least interesting to
  clone. There is a landing page because the app needs framing, not because it is a
  reproduction.
- **Real LinkedIn publishing**, the Managed plan, agency surfaces, blog/SEO pages, and
  the French locale.

I also could not see the signed-in product: it is behind LinkedIn/Google/email auth, and
creating an account or entering a password is not something I will do. So the app is
reconstructed from the five brand-side steps the homepage documents about itself, the
creator-side promises on `/creators`, and `llms.txt`. `RECON.md` records exactly what was
observed and what was inferred.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · no UI kit, no chart
library — the meters, bars and icons are hand-rolled SVG and CSS, which is why the whole
app is ~120 kB of first-load JS.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

### Layout

```
app/
  page.tsx              landing, two doors into the product
  brand/                overview · marketplace · campaigns · results · payouts
  creator/              offers · posts · earnings · profile
lib/
  types.ts              Booking is the shared spine
  fit.ts                audience-fit scoring and outcome projection
  data.ts               seed, anchored to Naano's published economics
  store.tsx             actions for both sides, persisted
components/
  ui.tsx                buttons, cards, stats, meters, formatters
  AppShell.tsx          sidebar, role switch
  CreatorCard.tsx       marketplace card and fit pill
```

## Notes

Not affiliated with Naano. Built as an assignment exercise from publicly available
information about their product.
