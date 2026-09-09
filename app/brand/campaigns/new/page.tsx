"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FitPill } from "@/components/CreatorCard";
import { Avatar, Button, Card, cx, eur, fmtCompact } from "@/components/ui";
import { fitScore } from "@/lib/fit";
import { useStore } from "@/lib/store";
import {
  FUNCTIONS,
  SENIORITIES,
  VERTICALS,
  type Campaign,
  type Func,
  type Seniority,
  type Vertical,
} from "@/lib/types";

type Objective = Campaign["objective"];
const OBJECTIVES: { key: Objective; label: string; hint: string }[] = [
  { key: "Pipeline", label: "Pipeline", hint: "Qualified leads and meetings" },
  { key: "Awareness", label: "Awareness", hint: "Reach a new audience" },
  { key: "Product launch", label: "Product launch", hint: "Push a specific release" },
  { key: "Hiring", label: "Hiring", hint: "Attract candidates" },
];

/**
 * Stands in for Naano's "AI-powered brief creation". Deterministic rather than a
 * real model call: no API key to leak, no latency, and the output is shaped like
 * what a brief actually needs. The generation feel is preserved.
 */
function generateBrief(product: string, objective: Objective, audience: string) {
  const who = audience.trim() || "your buyers";
  const what = product.trim() || "the product";
  const byObjective: Record<Objective, string[]> = {
    Pipeline: [
      `${who} lose hours every week to the problem ${what} removes`,
      `${what} pays for itself inside the first month`,
      "Live in a day — no lengthy implementation project",
    ],
    Awareness: [
      `Most ${who} still solve this manually and do not know there is an option`,
      `What changed recently that makes ${what} possible`,
      "Name the category, not just the product",
    ],
    "Product launch": [
      `${what} is available today`,
      "One concrete thing it does that nothing else does",
      "Early access is open and limited",
    ],
    Hiring: [
      "What the team is actually building right now",
      "How decisions get made here, honestly",
      "Roles open and who thrives in them",
    ],
  };
  return {
    keyMessages: byObjective[objective],
    guidelines: [
      "Write in first person about your own experience",
      "Open with a specific moment, not a statistic",
      "One concrete before/after with real numbers",
      `Mention ${what} once, and late`,
    ],
    doNots: [
      "No feature lists",
      "No superlatives — nothing is revolutionary",
      "Do not name competitors",
      "No hashtags",
    ],
  };
}

function EditableList({
  label,
  hint,
  items,
  onChange,
  tone = "neutral",
}: {
  label: string;
  hint: string;
  items: string[];
  onChange: (next: string[]) => void;
  tone?: "neutral" | "bad";
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  };
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold">{label}</p>
        <p className="text-[11.5px] text-muted">{hint}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className={cx(
              "group flex items-start gap-2 rounded-[10px] px-3 py-2 text-[13px] ring-1",
              tone === "bad" ? "bg-red-50/60 ring-red-100" : "bg-canvas ring-line-soft",
            )}
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
            <span className="min-w-0 flex-1 leading-snug">{it}</span>
            <button
              onClick={() => onChange(items.filter((_, x) => x !== i))}
              className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink focus-visible:opacity-100"
              aria-label={`Remove: ${it}`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add another…"
          className="h-9 min-w-0 flex-1 rounded-[10px] bg-surface px-3 text-[13px] ring-1 ring-line placeholder:text-muted"
        />
        <Button variant="secondary" size="sm" onClick={add} className="h-9">
          Add
        </Button>
      </div>
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}
          aria-pressed={value.includes(o)}
          className={cx(
            "rounded-full px-3 py-1.5 text-[12.5px] font-medium ring-1 transition-colors",
            value.includes(o)
              ? "bg-ink text-white ring-ink"
              : "bg-surface text-ink-soft ring-line hover:bg-line-soft",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function NewCampaign() {
  const store = useStore();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  const [name, setName] = useState("");
  const [objective, setObjective] = useState<Objective>("Pipeline");
  const [landingUrl, setLandingUrl] = useState("");
  const [product, setProduct] = useState("");
  const [audienceNote, setAudienceNote] = useState("");
  const [budget, setBudget] = useState(4000);

  const [keyMessages, setKeyMessages] = useState<string[]>([]);
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [doNots, setDoNots] = useState<string[]>([]);

  const [targetVerticals, setTargetVerticals] = useState<Vertical[]>([]);
  const [targetSeniority, setTargetSeniority] = useState<Seniority[]>([]);
  const [targetFunctions, setTargetFunctions] = useState<Func[]>([]);

  const draftCampaign = useMemo<Campaign>(
    () => ({
      id: "preview",
      brandId: store.brandId,
      name,
      objective,
      status: "draft",
      budget,
      keyMessages,
      guidelines,
      doNots,
      targetVerticals,
      targetSeniority,
      targetFunctions,
      trackingBase: "https://mrdn.io/r",
      landingUrl,
      createdAt: new Date().toISOString(),
    }),
    [store.brandId, name, objective, budget, keyMessages, guidelines, doNots, targetVerticals, targetSeniority, targetFunctions, landingUrl],
  );

  // Re-ranks as targeting changes, so the consequence of a choice is immediate.
  const matches = useMemo(
    () =>
      store.creators
        .map((c) => ({ creator: c, fit: fitScore(c, draftCampaign) }))
        .sort((a, b) => b.fit - a.fit)
        .slice(0, 5),
    [store.creators, draftCampaign],
  );

  const runGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const b = generateBrief(product, objective, audienceNote);
      setKeyMessages(b.keyMessages);
      setGuidelines(b.guidelines);
      setDoNots(b.doNots);
      setGenerating(false);
      setStep(1);
    }, 900);
  };

  const create = () => {
    const id = store.createCampaign({
      name: name.trim() || "Untitled campaign",
      objective,
      budget,
      keyMessages,
      guidelines,
      doNots,
      targetVerticals,
      targetSeniority,
      targetFunctions,
      trackingBase: "https://mrdn.io/r",
      landingUrl,
    });
    router.push(`/brand/marketplace?campaign=${id}`);
  };

  const STEPS = ["Basics", "Brief", "Targeting"];
  const canAdvance = step === 0 ? name.trim().length > 0 : true;

  return (
    <div className="mx-auto max-w-[900px]">
      <p className="eyebrow mb-1.5">New campaign</p>
      <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
        Build a campaign brief in minutes.
      </h1>

      {/* ------------------------------------------------------- stepper */}
      <div className="mt-6 mb-5 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cx(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                i === step
                  ? "bg-ink text-white"
                  : i < step
                    ? "bg-line-soft text-ink hover:bg-line"
                    : "text-muted",
              )}
            >
              <span className="tnum">{i + 1}</span>
              {s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-line" />}
          </div>
        ))}
      </div>

      {/* --------------------------------------------------- step 0: basics */}
      {step === 0 && (
        <Card className="rise p-5">
          <div className="space-y-5">
            <label className="block">
              <span className="text-[13px] font-semibold">Campaign name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q3 pipeline push — AI sales agent"
                className="mt-1.5 h-10 w-full rounded-[10px] bg-surface px-3 text-sm ring-1 ring-line placeholder:text-muted"
              />
            </label>

            <div>
              <span className="text-[13px] font-semibold">Objective</span>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-4">
                {OBJECTIVES.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setObjective(o.key)}
                    className={cx(
                      "rounded-[10px] p-3 text-left ring-1 transition-colors",
                      objective === o.key
                        ? "bg-brand-tint ring-2 ring-brand"
                        : "bg-surface ring-line hover:bg-canvas",
                    )}
                  >
                    <p className="text-[13px] font-medium">{o.label}</p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{o.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-semibold">What are you promoting?</span>
                <input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Meridian, an AI sales agent"
                  className="mt-1.5 h-10 w-full rounded-[10px] bg-surface px-3 text-sm ring-1 ring-line placeholder:text-muted"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-semibold">Who should see it?</span>
                <input
                  value={audienceNote}
                  onChange={(e) => setAudienceNote(e.target.value)}
                  placeholder="Heads of Sales at Series A–B SaaS"
                  className="mt-1.5 h-10 w-full rounded-[10px] bg-surface px-3 text-sm ring-1 ring-line placeholder:text-muted"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-semibold">Landing page</span>
                <input
                  value={landingUrl}
                  onChange={(e) => setLandingUrl(e.target.value)}
                  placeholder="https://meridian.io/ai-agent"
                  className="mt-1.5 h-10 w-full rounded-[10px] bg-surface px-3 text-sm ring-1 ring-line placeholder:text-muted"
                />
                <span className="mt-1.5 block text-[11.5px] text-muted">
                  Tracked links are generated per creator.
                </span>
              </label>
              <label className="block">
                <span className="text-[13px] font-semibold">
                  Budget <span className="tnum font-normal text-muted">{eur(budget)}</span>
                </span>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={250}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-3 w-full accent-[#1b4dff]"
                />
                <span className="mt-1 block text-[11.5px] text-muted">
                  Roughly {Math.floor(budget / 450)} mid-tier posts.
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-line-soft pt-4">
            <Button variant="brand" onClick={runGenerate} disabled={!canAdvance || generating}>
              {generating ? (
                <>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 3a9 9 0 109 9" strokeLinecap="round" />
                  </svg>
                  Writing brief…
                </>
              ) : (
                <>Generate brief with AI</>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setStep(1)} disabled={!canAdvance}>
              Write it myself
            </Button>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- step 1: brief */}
      {step === 1 && (
        <Card className="rise p-5">
          <div className="space-y-6">
            <EditableList
              label="Key messages"
              hint="What every post should land"
              items={keyMessages}
              onChange={setKeyMessages}
            />
            <EditableList
              label="Creator guidelines"
              hint="How to write it"
              items={guidelines}
              onChange={setGuidelines}
            />
            <EditableList
              label="Do not"
              hint="Hard limits"
              items={doNots}
              onChange={setDoNots}
              tone="bad"
            />
          </div>
          <div className="mt-6 flex justify-between border-t border-line-soft pt-4">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)}>Continue to targeting</Button>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------- step 2: targeting */}
      {step === 2 && (
        <div className="rise grid gap-5 lg:grid-cols-[1fr_300px]">
          <Card className="p-5">
            <div className="space-y-5">
              <div>
                <p className="text-[13px] font-semibold">Verticals</p>
                <p className="mb-2 text-[11.5px] text-muted">
                  Which markets should the audience sit in?
                </p>
                <Chips options={VERTICALS} value={targetVerticals} onChange={setTargetVerticals} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Seniority</p>
                <p className="mb-2 text-[11.5px] text-muted">Who signs off?</p>
                <Chips options={SENIORITIES} value={targetSeniority} onChange={setTargetSeniority} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Function</p>
                <p className="mb-2 text-[11.5px] text-muted">Which team do they sit in?</p>
                <Chips options={FUNCTIONS} value={targetFunctions} onChange={setTargetFunctions} />
              </div>
            </div>
            <div className="mt-6 flex justify-between border-t border-line-soft pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={create}>Create and find creators</Button>
            </div>
          </Card>

          {/* Live consequence of the targeting choices. */}
          <Card className="overflow-hidden lg:sticky lg:top-6 lg:self-start">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[13px] font-semibold">Top matches</p>
              <p className="text-[11.5px] text-muted">
                {targetVerticals.length + targetSeniority.length + targetFunctions.length === 0
                  ? "Pick targeting to rank the marketplace"
                  : "Updates as you change targeting"}
              </p>
            </div>
            <ul className="divide-y divide-line-soft">
              {matches.map(({ creator, fit }) => (
                <li key={creator.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <Avatar name={creator.name} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{creator.name}</p>
                    <p className="tnum text-[11px] text-muted">
                      {eur(creator.pricePerPost)} · {fmtCompact(creator.followers)}
                    </p>
                  </div>
                  <FitPill score={fit} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
