"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BOOKINGS, BRANDS, CAMPAIGNS, CREATORS, DEMO_CREATOR_ID } from "./data";
import { fitScore, project } from "./fit";
import type { AppState, Booking, Campaign, Role } from "./types";

const STORAGE_KEY = "naano.state.v1";

const initial: AppState = {
  role: "brand",
  brandId: "b1",
  creatorId: DEMO_CREATOR_ID,
  creators: CREATORS,
  brands: BRANDS,
  campaigns: CAMPAIGNS,
  bookings: BOOKINGS,
  shortlist: [],
};

interface Store extends AppState {
  ready: boolean;
  setRole: (r: Role) => void;
  setCreatorId: (id: string) => void;
  reset: () => void;
  toggleShortlist: (creatorId: string) => void;
  createCampaign: (c: Omit<Campaign, "id" | "brandId" | "createdAt" | "status">) => string;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  invite: (campaignId: string, creatorIds: string[]) => void;
  respond: (bookingId: string, accept: boolean, reason?: string) => void;
  submitDraft: (bookingId: string, body: string) => void;
  requestChanges: (bookingId: string, feedback: string) => void;
  approveDraft: (bookingId: string) => void;
  schedule: (bookingId: string, when: string) => void;
  publish: (bookingId: string) => void;
  releasePayout: (bookingId: string) => void;
}

const Ctx = createContext<Store | null>(null);

const nowIso = () => new Date().toISOString();
const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);

  // Hydrate after mount so server and client markup match. Reading
  // localStorage during render would either throw on the server or produce a
  // hydration mismatch, so a mount effect is the only correct place for it --
  // the `ready` flag makes the one-frame seed render explicit, not accidental.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppState>;
        // Creators are code, not user data -- always take the current seed.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ ...initial, ...saved, creators: CREATORS });
      }
    } catch {
      /* private mode, cleared storage, blocked cookies: fall back to seed */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const persisted = { ...state, creators: undefined };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* storage unavailable: the app still works, it just will not persist */
    }
  }, [state, ready]);

  const patchBooking = useCallback(
    (id: string, fn: (b: Booking) => Booking) => {
      setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? fn(b) : b)) }));
    },
    [],
  );

  const addEvent = (b: Booking, label: string, by: "brand" | "creator" | "naano"): Booking => ({
    ...b,
    events: [...b.events, { at: nowIso(), label, by }],
  });

  const value = useMemo<Store>(() => {
    return {
      ...state,
      ready,
      setRole: (role) => setState((s) => ({ ...s, role })),
      setCreatorId: (creatorId) => setState((s) => ({ ...s, creatorId })),
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* nothing to clear */
        }
        setState(initial);
      },
      toggleShortlist: (creatorId) =>
        setState((s) => ({
          ...s,
          shortlist: s.shortlist.includes(creatorId)
            ? s.shortlist.filter((x) => x !== creatorId)
            : [...s.shortlist, creatorId],
        })),

      createCampaign: (c) => {
        const id = uid("cam");
        setState((s) => ({
          ...s,
          campaigns: [
            ...s.campaigns,
            { ...c, id, brandId: s.brandId, status: "live", createdAt: nowIso() },
          ],
        }));
        return id;
      },

      updateCampaign: (id, patch) =>
        setState((s) => ({
          ...s,
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      invite: (campaignId, creatorIds) =>
        setState((s) => {
          const campaign = s.campaigns.find((c) => c.id === campaignId);
          if (!campaign) return s;
          const existing = new Set(
            s.bookings.filter((b) => b.campaignId === campaignId).map((b) => b.creatorId),
          );
          const fresh = creatorIds
            .filter((cid) => !existing.has(cid))
            .map<Booking>((cid) => {
              const creator = s.creators.find((c) => c.id === cid)!;
              return {
                id: uid("bk"),
                campaignId,
                creatorId: cid,
                pricePerPost: creator.pricePerPost,
                fitScore: fitScore(creator, campaign),
                status: "invited",
                payout: { contract: false, invoice: false, paid: false },
                events: [{ at: nowIso(), label: "Invited to campaign", by: "brand" }],
              };
            });
          return { ...s, bookings: [...s.bookings, ...fresh], shortlist: [] };
        }),

      respond: (id, accept, reason) =>
        patchBooking(id, (b) =>
          addEvent(
            {
              ...b,
              status: accept ? "accepted" : "declined",
              feedback: accept ? b.feedback : reason,
              payout: accept ? { ...b.payout, contract: true } : b.payout,
            },
            accept ? "Accepted the offer" : "Declined the offer",
            "creator",
          ),
        ),

      submitDraft: (id, body) =>
        patchBooking(id, (b) => {
          const revision = (b.draft?.revision ?? 0) + 1;
          return addEvent(
            {
              ...b,
              status: "draft_submitted",
              feedback: undefined,
              draft: { body, revision, submittedAt: nowIso() },
            },
            revision > 1 ? `Draft resubmitted (v${revision})` : "Draft submitted",
            "creator",
          );
        }),

      requestChanges: (id, feedback) =>
        patchBooking(id, (b) =>
          addEvent({ ...b, status: "changes_requested", feedback }, "Changes requested", "brand"),
        ),

      approveDraft: (id) =>
        patchBooking(id, (b) => addEvent({ ...b, status: "approved" }, "Draft approved", "brand")),

      schedule: (id, when) =>
        patchBooking(id, (b) =>
          addEvent({ ...b, status: "scheduled", scheduledFor: when }, "Scheduled", "creator"),
        ),

      publish: (id) =>
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) => {
            if (b.id !== id) return b;
            const creator = s.creators.find((c) => c.id === b.creatorId)!;
            const p = project(creator, b.fitScore);
            // Real posts do not land on the projection. Vary it.
            const jitter = 0.86 + Math.random() * 0.3;
            const impressions = Math.round(p.impressions * jitter);
            const clicks = Math.round(p.clicks * jitter);
            const leads = Math.round(p.leads * jitter);
            return addEvent(
              {
                ...b,
                status: "live",
                publishedAt: nowIso(),
                postUrl: `https://linkedin.com/posts/${creator.name.toLowerCase().replace(/[^a-z]+/g, "-")}-naano`,
                metrics: { impressions, clicks, leads, pipeline: leads * 135 },
                payout: { ...b.payout, invoice: true },
              },
              "Published on LinkedIn",
              "creator",
            );
          }),
        })),

      releasePayout: (id) =>
        patchBooking(id, (b) =>
          addEvent(
            { ...b, payout: { contract: true, invoice: true, paid: true, paidAt: nowIso() } },
            "Payout released",
            "naano",
          ),
        ),
    };
  }, [state, ready, patchBooking]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

/** Convenience selectors. */
export function useBrandData() {
  const s = useStore();
  const campaigns = s.campaigns.filter((c) => c.brandId === s.brandId);
  const ids = new Set(campaigns.map((c) => c.id));
  return { ...s, campaigns, bookings: s.bookings.filter((b) => ids.has(b.campaignId)) };
}

export function useCreatorData() {
  const s = useStore();
  return {
    ...s,
    me: s.creators.find((c) => c.id === s.creatorId)!,
    offers: s.bookings.filter((b) => b.creatorId === s.creatorId),
  };
}
