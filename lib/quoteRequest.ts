import type { CategorySlug } from "@/data/categories";
import { isStockCondition, type StockCondition } from "@/data/lineup";

/**
 * The quote form — on the homepage hero, and in the quote panel that every
 * "interested" button opens. Contact details plus the robot the visitor wants,
 * then the follow-up that robot needs. Checkout shipping stays separate.
 */

/** Order is how the form lists them: the navbar's category order. */
export const QUOTE_INTERESTS = [
  "lawn-mowing",
  "commercial-cleaning",
  "smart-equipment",
  "cooking",
  "pudu-delivery",
] as const;
export type QuoteInterest = (typeof QUOTE_INTERESTS)[number];

/** Which "robot" answer a product or model of each category gives. */
export const CATEGORY_INTEREST: Partial<Record<CategorySlug, QuoteInterest>> = {
  "robot-mowers": "lawn-mowing",
  "cleaning-robots": "commercial-cleaning",
  "smart-equipment": "smart-equipment",
  "cooking-robots": "cooking",
  "delivery-robots": "pudu-delivery",
};

export const PUDU_VENUES = [
  "restaurant",
  "hotel",
  "hospital",
  "office",
  "mall",
  "other",
] as const;
export type PuduVenue = (typeof PUDU_VENUES)[number];

/** The optional note is free text — capped so it can't swamp the sales email. */
export const QUOTE_NOTE_MAX = 1000;

export interface QuoteRequest {
  fullName: string;
  /** Optional — homeowners buying a mower usually have none. */
  company: string;
  email: string;
  phone: string;
  interest: QuoteInterest | "";
  /** Lawn area in square metres. Only used for lawn-mowing. */
  areaM2: string;
  /** Pudu venue. Only used for pudu-delivery. */
  venue: PuduVenue | "";
  /** Tables or rooms the Pudu robot should serve. */
  servingCount: string;
  /** Floors the Pudu robot should cover. */
  floors: string;
  /** Optional — anything else the visitor wants to tell us, in their words. */
  note: string;
  /** Catalogue product the visitor came from, when they pressed its button. */
  productId: string;
  /** A model not in the catalogue yet (data/lineup.ts), when they pressed its button. */
  modelId: string;
  /** For a service (demo, installation): the robot it is for. */
  forId: string;
  /**
   * New or pre-owned, when the lineup model is sold that way. Required only
   * when the model is sold as both; a single-condition model is filled in
   * by the server.
   */
  condition: StockCondition | "";
}

export type QuoteField = keyof QuoteRequest;

export const EMPTY_QUOTE: QuoteRequest = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  interest: "",
  areaM2: "",
  venue: "",
  servingCount: "",
  floors: "",
  note: "",
  productId: "",
  modelId: "",
  forId: "",
  condition: "",
};

export const PHONE_RE = /^(\+66[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|0\d{1,2}[\s-]?\d{3}[\s-]?\d{4})$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function positiveNumber(value: string): boolean {
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0;
}

function positiveInteger(value: string): boolean {
  const n = Number(value.trim());
  return Number.isInteger(n) && n > 0;
}

export function isQuoteInterest(value: string): value is QuoteInterest {
  return (QUOTE_INTERESTS as readonly string[]).includes(value);
}

export function isPuduVenue(value: string): value is PuduVenue {
  return (PUDU_VENUES as readonly string[]).includes(value);
}

/**
 * Field → error key. Contact errors match `checkout.errors.*`.
 * Robot follow-ups use `heroQuote.errors.*`.
 *
 * `productChosen`: the visitor came from a product's (or lineup model's)
 * button, so that answers "which robot" and the interest choice is not asked.
 * `needsCondition`: the model is sold both new and pre-owned, so they pick one.
 */
export function validateQuote(
  form: QuoteRequest,
  { productChosen = false, needsCondition = false }: { productChosen?: boolean; needsCondition?: boolean } = {}
): Partial<Record<QuoteField, string>> {
  const errors: Partial<Record<QuoteField, string>> = {};
  if (!form.fullName.trim()) errors.fullName = "required";
  if (!form.email.trim()) errors.email = "required";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "email";
  if (!form.phone.trim()) errors.phone = "required";
  else if (!PHONE_RE.test(form.phone.trim())) errors.phone = "phone";
  if (!form.interest && !productChosen) errors.interest = "required";
  if (needsCondition && !form.condition) errors.condition = "required";

  if (form.interest === "lawn-mowing") {
    if (!form.areaM2.trim()) errors.areaM2 = "required";
    else if (!positiveNumber(form.areaM2)) errors.areaM2 = "area";
  }

  if (form.interest === "pudu-delivery") {
    if (!form.venue) errors.venue = "required";
    if (!form.servingCount.trim()) errors.servingCount = "required";
    else if (!positiveInteger(form.servingCount)) errors.servingCount = "count";
    if (!form.floors.trim()) errors.floors = "required";
    else if (!positiveInteger(form.floors)) errors.floors = "count";
  }

  return errors;
}

export function asQuote(raw: unknown): QuoteRequest {
  const v = (raw ?? {}) as Record<string, unknown>;
  const str = (key: string) => (typeof v[key] === "string" ? v[key].trim() : "");
  const interest = str("interest");
  const venue = str("venue");
  const condition = str("condition");
  return {
    fullName: str("fullName"),
    company: str("company"),
    email: str("email"),
    phone: str("phone"),
    interest: isQuoteInterest(interest) ? interest : "",
    areaM2: str("areaM2"),
    venue: isPuduVenue(venue) ? venue : "",
    servingCount: str("servingCount"),
    floors: str("floors"),
    note: str("note").slice(0, QUOTE_NOTE_MAX),
    productId: str("productId"),
    modelId: str("modelId"),
    forId: str("forId"),
    condition: isStockCondition(condition) ? condition : "",
  };
}
