# Recon — what Naano actually is

Sources: naano.com homepage, `/creators`, `/register`, `/llms.txt`, `/pricing.md`, FAQ.

## The product in one line

A two-sided marketplace where **B2B brands book vetted LinkedIn creators for
sponsored posts at a flat price per post**, and every post is tracked back to
clicks, leads and pipeline.

`/register` puts the split in the product's own words: **"One platform. Two sides."**
First question asked at signup is *"who are you here as?"* — creator or brand. The
two sides barely share a surface, so they are modelled as two distinct apps over one
dataset.

## What I could and could not see

| | |
|---|---|
| Public | Marketing site, creator-side pitch, pricing, benchmarks, role-selection step of signup, auth options |
| Gated | The entire signed-in app. Auth is LinkedIn OAuth / Google OAuth / email. |

I could not create an account, so the signed-in UI is reconstructed from the flow the
product documents about itself rather than copied pixel-for-pixel. The homepage
enumerates its own five brand-side steps in order, which is the strongest available
specification:

1. **Find creators your buyers trust** — creator cards with a **Fit %** (92%, 88%, 84%
   in their own mockup). Explicitly "audience fit comes before follower count".
2. **Build a campaign brief in minutes** — AI-assisted. Objectives and key messages,
   creator guidelines, tracking links ready.
3. **Manage every collaboration** — per-creator status: `Draft ready` → `Scheduled` → `Live`.
4. **Track reach, clicks, and leads** — attributed pipeline (€48.2K, +24%), views,
   leads.
5. **Pay creators without the admin** — `Contract` → `Invoice` → `Payout`, "Handled by
   Naano".

Creator side (`/creators`): "Get paid to post on LinkedIn." Choose deals from B2B
brands you already use, post in your own voice, **paid within 24h**, no negotiating,
no admin. ~€500 average per deal.

## Data model

```
User        role: 'brand' | 'creator'
Creator     name, headline, vertical, followers, pricePerPost, avatar,
            audience: { seniority[], functions[], countries[] },
            stats: { avgImpressions, avgClicks, avgLeads, ctr },
            rating, deliveryDays, verified
Brand       company, logo, website, vertical
Campaign    brandId, name, objective, status: draft|live|completed,
            budget, keyMessages[], guidelines[], doNots[],
            trackingBase, targetVerticals[], startDate
Booking     campaignId, creatorId, pricePerPost,          <- the join, and the heart
            status: invited|accepted|declined|draft_submitted|
                    approved|scheduled|live|completed,
            draft: { body, revision, submittedAt },
            postUrl, publishedAt,
            metrics: { impressions, clicks, leads, pipeline },
            payout: { contract, invoice, paid }
```

`Booking` is the spine — every screen on both sides is a different projection of it.
The brand sees a pipeline of bookings across creators; the creator sees a list of
offers. Same rows.

**Fit score** is the one piece of real product logic worth getting right, since the
product's whole pitch is that fit beats follower count. Computed from overlap between
a campaign's target verticals/seniority/functions and a creator's audience, not from
reach — so a 3k-follower creator in the exact vertical outranks a 100k generalist,
which is precisely the claim `llms.txt` makes.

## Real numbers to seed with (first-party, from llms.txt)

- Pricing: flat fee per post, from **€20**; high tier **€400–€1,500**. Self-Serve
  **€0/mo**, Managed **€700/mo**.
- Benchmarks, Naano marketplace data Q1 2026 (312 campaigns): **€18 CPL** vs €55–90
  LinkedIn Ads; **12% CTR** vs 0.8% LinkedIn Sponsored Content; 3–5× reach from a
  personal post vs a company page.
- Scale: 2,000+ vetted creators, 100 countries. Verticals: sales-tech, RevOps,
  devtools, product, HR-tech, fintech, martech/marketing-ops, vertical SaaS.

Seeding with the real figures rather than invented ones means the demo's economics
are honest.

## Design language

Light and airy: white surfaces, sky/cloud photographic hero, near-black primary
buttons, electric blue (`#1a4dff`-ish) as the accent on the auth split-screen,
lowercase `naano` wordmark, generous radii, tight modern sans, small-caps section
eyebrows (`ONE PLATFORM, FROM BRIEF TO RESULTS`). The app itself should be quieter
than the marketing site — dense but calm.

## Build order, and what I am leaving out

**Building** — the five documented steps, both sides, end to end:
discovery with real fit scoring → brief builder → booking pipeline → creator inbox
with draft submit/approve → attribution dashboard → payout states.

**Leaving out, deliberately:**

- **Real auth.** OAuth adds nothing to a judged rebuild and adds a wall in front of
  the live link. Instead: instant demo entry as either side, and a role switch. A
  reviewer can invite a creator as a brand, flip sides, and accept the offer as that
  creator — the two-sidedness becomes visible in ten seconds instead of requiring two
  accounts.
- **Payment rails.** Payout is modelled as state (contract → invoice → paid), which is
  what the product surfaces anyway. Stripe onboarding is infrastructure, not product.
- **The marketing site.** It is the part that already converts and the least
  interesting to rebuild. A landing page exists to frame the app, not to be a clone.
- **Real LinkedIn posting.** Draft, approve and schedule are real; publishing is
  simulated.
- **Managed plan / agency surfaces, blog, SEO pages, i18n (FR).**
