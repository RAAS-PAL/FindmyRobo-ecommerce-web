import type { CategorySlug } from "@/data/categories";
import { SERVICE_CATEGORY, type Product } from "@/data/products";
import { parseArea } from "@/lib/installTiers";

/**
 * The robot recommender (decided 2026-10-02: hybrid). Hard rules drop robots
 * that can't do the job (too small an area, too steep, wrong way of
 * running); a score ranks the rest; the top three are shown with the reasons.
 *
 * Every reason is built from a product's own figures (`fit`, or a mower's
 * area/slope specs), never invented: a robot whose sheet doesn't give a
 * figure gets a "to be confirmed" reason and a lower score, not a guess.
 *
 * Pure and shared: the page runs it for instant results, and the API runs it
 * again on the answers it receives, so what is saved is never the browser's
 * word for it.
 */

export type Job = "lawn" | "floor" | "cooking" | "delivery";
export type SlopeBand = "flat" | "moderate" | "steep" | "very-steep" | "unsure";
export type OperationPref = "autonomous" | "walk-behind" | "either";
export type Venue = "restaurant" | "hotel" | "office" | "hospital" | "mall" | "other";

export const JOBS: Job[] = ["lawn", "floor", "cooking", "delivery"];
export const SLOPE_BANDS: SlopeBand[] = ["flat", "moderate", "steep", "very-steep", "unsure"];
export const OPERATION_PREFS: OperationPref[] = ["autonomous", "walk-behind", "either"];
export const VENUES: Venue[] = ["restaurant", "hotel", "office", "hospital", "mall", "other"];

/** The steepest slope (%) each band means. */
export const SLOPE_PCT: Record<Exclude<SlopeBand, "unsure">, number> = {
  flat: 10,
  moderate: 30,
  steep: 50,
  "very-steep": 80,
};

export interface Answers {
  job: Job;
  /** Lawn area, or floor area to clean, m². */
  areaM2?: number;
  slope?: SlopeBand;
  operation?: OperationPref;
  venue?: Venue;
}

/** Which categories answer each job. */
export const JOB_CATEGORIES: Record<Job, CategorySlug[]> = {
  lawn: ["robot-mowers"],
  floor: ["cleaning-robots", "smart-equipment"],
  cooking: ["cooking-robots"],
  delivery: ["delivery-robots"],
};

/** One line under a result. `key` is under recommend.reasons in messages. */
export interface Reason {
  tone: "good" | "check" | "miss";
  key: string;
  values?: Record<string, number | string>;
}

export interface Match {
  product: Product;
  /** Passes every hard rule. */
  fits: boolean;
  score: number;
  reasons: Reason[];
}

const firstPercent = (spec?: string) => {
  const m = spec?.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number(m[1]) : undefined;
};

const maxArea = (p: Product) => {
  if (p.fit?.maxAreaM2) return p.fit.maxAreaM2;
  const fromSpec = parseArea(p.specs.area);
  return Number.isFinite(fromSpec) && fromSpec > 0 ? fromSpec : undefined;
};

const maxSlope = (p: Product) => p.fit?.maxSlopePct ?? firstPercent(p.specs.slope);

function scoreLawn(p: Product, a: Answers, m: Match) {
  const capacity = maxArea(p);
  if (a.areaM2) {
    if (capacity === undefined) {
      m.score -= 30;
      m.reasons.push({ tone: "check", key: "areaUnknown" });
    } else if (capacity < a.areaM2) {
      m.fits = false;
      m.score -= 50;
      m.reasons.push({ tone: "miss", key: "areaTooSmall", values: { capacity, area: a.areaM2 } });
    } else {
      // the smallest robot that covers it is the sensible buy: penalise headroom
      m.score -= Math.min(30, (capacity / a.areaM2 - 1) * 10);
      m.reasons.push({ tone: "good", key: "areaCovers", values: { capacity, area: a.areaM2 } });
    }
  }
  if (a.slope && a.slope !== "unsure") {
    const need = SLOPE_PCT[a.slope];
    const limit = maxSlope(p);
    if (limit === undefined) {
      m.score -= 10;
      m.reasons.push({ tone: "check", key: "slopeUnknown" });
    } else if (limit < need) {
      m.fits = false;
      m.score -= 50;
      m.reasons.push({ tone: "miss", key: "slopeTooSteep", values: { limit, need } });
    } else {
      m.reasons.push({ tone: "good", key: "slopeHandles", values: { limit, need } });
    }
  }
}

function scoreFloor(p: Product, a: Answers, m: Match) {
  const operation = p.fit?.operation;
  if (a.operation && a.operation !== "either") {
    if (!operation) {
      m.score -= 20;
      m.reasons.push({ tone: "check", key: "operationUnknown" });
    } else if (operation !== a.operation) {
      m.fits = false;
      m.score -= 50;
      m.reasons.push({ tone: "miss", key: operation === "autonomous" ? "operationSelfMiss" : "operationPushMiss" });
    }
  }
  if (operation && (!a.operation || a.operation === "either" || operation === a.operation)) {
    m.reasons.push({ tone: "good", key: operation === "autonomous" ? "operationSelf" : "operationPush" });
  }
  const rate = p.fit?.cleaningRateM2h;
  if (a.areaM2) {
    if (!rate) {
      m.score -= 20;
      m.reasons.push({ tone: "check", key: "rateUnknown" });
    } else {
      const hours = Math.round((a.areaM2 / rate) * 10) / 10;
      // more than ~2 hours per clean starts to be a stretch for one machine
      m.score -= Math.max(0, hours - 2) * 10;
      m.reasons.push({ tone: "good", key: "rateHours", values: { area: a.areaM2, hours, rate } });
    }
  }
}

/**
 * Rank the catalogue for these answers. Only robots that pass every rule are
 * returned; when none do, the closest ones are (fits: false), so the page can
 * say so honestly instead of showing nothing.
 */
export function recommend(products: Product[], a: Answers, limit = 3): Match[] {
  const categories = JOB_CATEGORIES[a.job];
  const matches = products
    // the storefront list (getAllProducts) is already the visible products
    .filter((p) => p.category !== SERVICE_CATEGORY)
    .filter((p) => categories.includes(p.category))
    .map((product) => {
      const m: Match = { product, fits: true, score: 100, reasons: [] };
      if (a.job === "lawn") scoreLawn(product, a, m);
      if (a.job === "floor") scoreFloor(product, a, m);
      return m;
    });

  const fitting = matches.filter((m) => m.fits);
  return (fitting.length > 0 ? fitting : matches)
    .sort(
      (x, y) =>
        Number(y.fits) - Number(x.fits) ||
        y.score - x.score ||
        (x.product.displayOrder ?? 1000) - (y.product.displayOrder ?? 1000)
    )
    .slice(0, limit);
}

/* ---------- parsing what the browser sent ---------- */

const pick = <T extends string>(list: readonly T[], v: unknown): T | undefined =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : undefined;

/** Answers from untrusted JSON, or null when the job is missing. */
export function asAnswers(raw: unknown): Answers | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const job = pick(JOBS, r.job);
  if (!job) return null;
  const area = Number(r.areaM2);
  return {
    job,
    ...(Number.isFinite(area) && area > 0 && area <= 1_000_000 ? { areaM2: Math.round(area) } : {}),
    ...(job === "lawn" && pick(SLOPE_BANDS, r.slope) ? { slope: pick(SLOPE_BANDS, r.slope) } : {}),
    ...(job === "floor" && pick(OPERATION_PREFS, r.operation)
      ? { operation: pick(OPERATION_PREFS, r.operation) }
      : {}),
    ...(job === "delivery" && pick(VENUES, r.venue) ? { venue: pick(VENUES, r.venue) } : {}),
  };
}
