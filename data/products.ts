import type { CategorySlug } from "@/data/categories";
import type { StockCondition } from "@/data/conditions";

/**
 * The type of product (database column `variant`), never a model name: it
 * picks the stand-in drawing when a product has no photo, and marks the two
 * kinds of service product ("installation" and "demo", in the "services"
 * category) that checkout and the demo panel look for. Anything tied to one
 * model (its hover video, its parts diagram) is set on the product itself.
 *
 * Until supabase/variant-to-product-type.sql has run, rows may still carry
 * the old values; lib/productStore.ts reads those as the new ones.
 */
export type RobotVariant =
  | "mower"
  | "pool"
  | "cleaner"
  | "equipment"
  | "cooking"
  | "delivery"
  | "installation"
  | "demo";

/**
 * Facts the robot recommender matches on (lib/recommend.ts), as numbers.
 * Each must come from the manufacturer's spec sheet; leave a field out when
 * the sheet doesn't give it — the recommender then says "to be confirmed"
 * rather than guessing. Mowers fall back to their `area` and `slope` specs.
 */
export interface RobotFit {
  /** Largest area it is rated for, m² (a mower's lawn area). */
  maxAreaM2?: number;
  /** Steepest slope it handles, % (mowers). */
  maxSlopePct?: number;
  /** Floor it cleans per hour at best, m²/h (floor cleaners). */
  cleaningRateM2h?: number;
  /** Floor cleaners: drives itself, or is pushed by staff. */
  operation?: "autonomous" | "walk-behind";
}

/** Robots with an interactive parts diagram (data/techAnatomy.ts). */
export type AnatomyModel = "luba-3" | "luba-mini-2";

export const ANATOMY_MODELS: AnatomyModel[] = ["luba-3", "luba-mini-2"];

/**
 * Quick specs. No longer rendered on the product page — that shows only the
 * page-builder spec table — but `area` still drives which installation tier
 * the checkout offers for a robot (see components/checkout/CheckoutClient.tsx),
 * so it must stay filled in.
 * Values are display-ready strings (SI units, same in both locales).
 * PLACEHOLDER values based on public Mammotion/Spino specs — replace with
 * confirmed data from suppliers before launch.
 */
export type SpecKey =
  | "area"
  | "slope"
  | "cuttingWidth"
  | "runtime"
  | "connectivity"
  | "filtration";

export type Locale = "en" | "th";

export type LocalizedText = Record<Locale, string>;

/* ---------- per-product detail page (admin page builder) ---------- */

/**
 * One content section on a product detail page. Blocks are ordered, optional,
 * and freely mixed per robot — a product with few photos simply uses fewer
 * image-based blocks. All copy is bilingual; all images are URLs.
 */
export type PageBlock =
  | { type: "banner"; image: string }
  | {
      type: "feature";
      heading: LocalizedText;
      body: LocalizedText;
      image?: string;
      /** Small line above the heading. Full-screen pages only (see
       *  ShowcaseContent): there each feature with a photo is a section. */
      eyebrow?: LocalizedText;
    }
  | {
      type: "cardGrid";
      heading?: LocalizedText;
      cards: { image: string; caption: LocalizedText }[];
    }
  | {
      /** Horizontal, swipeable cards (image + title + body) — e.g. a feature
       *  walkthrough. Scrolls left/right on the product page. */
      type: "showcase";
      heading?: LocalizedText;
      cards: { image: string; title: LocalizedText; body: LocalizedText }[];
    }
  | { type: "imageText"; image: string; body: LocalizedText; imageSide: "left" | "right" }
  | { type: "video"; heading?: LocalizedText; url: string; caption?: LocalizedText }
  | {
      /** The interactive "under the hood" anatomy of one model
       *  (data/techAnatomy.ts). Renders nothing without a model: a diagram
       *  must be of the product's own model, never a sibling's. */
      type: "anatomy";
      model?: AnatomyModel;
    };

export const PAGE_BLOCK_TYPES = [
  "banner",
  "feature",
  "cardGrid",
  "showcase",
  "imageText",
  "video",
  "anatomy",
] as const;

/** One group in the detailed specifications table (e.g. "Cutting System"). */
export interface SpecGroup {
  title: LocalizedText;
  rows: { label: LocalizedText; value: LocalizedText }[];
}

/** One item packed in the box, shown in the "What's in the box" grid. */
export interface BoxItem {
  /** Photo of the item (absolute URL or /public path). */
  image: string;
  name: LocalizedText;
  /** Quantity included; defaults to 1 when unset. */
  qty?: number;
}

/** One question/answer pair shown in the product FAQ accordion. */
export interface FaqItem {
  question: LocalizedText;
  answer: LocalizedText;
}

/** One key figure under a full-screen page's header, e.g. "2–4 h" / Runtime. */
export interface ShowcaseFigure {
  value: string;
  label: LocalizedText;
}

/** One body colour, for a robot sold in more than one. */
export interface ShowcaseColor {
  label: LocalizedText;
  /** Swatch fill shown next to the colour name, e.g. "#85909c". */
  swatch: string;
  /** Transparent cut-out of the robot in this colour. */
  image: string;
}

/**
 * Content for the full-screen product page (components/product/ShowcasePage):
 * a dark studio header with the robot, its key figures, one full-width photo
 * per feature section, then the spec table. A product that has this gets that
 * design; one without keeps the standard page (gallery beside the details).
 * Edited in Admin → Products → "Full-screen page".
 */
export interface ShowcaseContent {
  /** Short line above the name, e.g. "Gausium · Commercial cleaning robot". */
  eyebrow: LocalizedText;
  /** Transparent cut-out for the header; the product's main image if unset. */
  heroImage?: string;
  /** Up to four, in order. */
  figures: ShowcaseFigure[];
  /** Two or more colours: the header shows the robot in each, named. */
  colors?: ShowcaseColor[];
}

export const MAX_SHOWCASE_FIGURES = 4;

/**
 * Optional rich detail-page content. When absent the product page falls back
 * to the compact layout (description + features + the small specs band).
 */
export interface ProductPage {
  /** Full-screen page design; see ShowcaseContent. */
  showcase?: ShowcaseContent;
  /** Review/demo video near the top (YouTube URL or /path or https mp4). */
  videoUrl?: string;
  videoCaption?: LocalizedText;
  /** Ordered marketing sections rendered below the fold. */
  blocks?: PageBlock[];
  /** Grouped specification table; replaces the compact specs band when set. */
  specGroups?: SpecGroup[];
  /** "What's in the box" items, rendered after the specification table. */
  boxItems?: BoxItem[];
  /** Frequently-asked questions, rendered as an accordion near the page bottom. */
  faqs?: FaqItem[];
}

/**
 * Product records live in the Supabase `products` table (see
 * supabase/products-schema.sql) and are managed through the admin panel via
 * lib/productStore.ts. Marketing copy is stored per-locale on the record
 * itself so admin-added products need no message-file entries.
 */
export interface Product {
  id: string;
  /** Admin-controlled storefront position; lower values appear first. */
  displayOrder?: number;
  name: string;
  /** Whole baht; null while the price is not known yet ("Price on request",
   *  and the product can't go in the cart). */
  price: number | null;
  category: CategorySlug;
  variant: RobotVariant;
  /**
   * Optional product photo (absolute URL or /public path). When set it is
   * shown everywhere instead of the stylized `variant` illustration, which
   * remains the fallback.
   */
  imageUrl?: string;
  /**
   * Optional separate image for the large home-page feature card
   * (components/ui/FeaturedProductCard.tsx) — typically a lifestyle photo.
   * Falls back to `imageUrl` when unset, so the product page and shop cards
   * keep using the plain product render (`imageUrl`) while the home card can
   * show a scene instead.
   */
  homeImage?: string;
  /**
   * Extra gallery photos (absolute URLs or /public paths), shown after
   * `imageUrl` in the product-page gallery. `imageUrl` stays the single image
   * used in cards, so this is only read by the detail page.
   */
  images?: string[];
  /**
   * Optional short clip that plays on hover over the product card (muted,
   * looped). Absolute URL or /public path. When unset the card just shows the
   * image. Keep these small (a few MB) — they load on hover, not on page load.
   */
  hoverVideo?: string;
  preorder?: boolean;
  /**
   * Whether the product appears on the storefront. false hides it from every
   * customer-facing surface (shop, category, search, direct URL, checkout)
   * while keeping the record in the database. Absent is treated as visible.
   */
  visible?: boolean;
  /**
   * Warehouse SKU for 3PL fulfilment (Sokochan). Must match the code registered
   * in the warehouse — it is sent as order_items[].item_sku when an order is
   * pushed. Services (installation, demos) are never shipped and carry no SKU.
   */
  sku?: string;
  /**
   * Manufacturer, e.g. "Mammotion". Emitted as `brand` in the product page's
   * structured data, where Google can verify it — so it is stored per product
   * rather than assumed. Absent means the database default applies (see
   * supabase/add-product-brand.sql); the storefront treats absent as
   * DEFAULT_BRAND below.
   */
  brand?: string;
  /** How it is sold: new, pre-owned, or both (the `conditions` column;
   *  rows saved before it existed read as new). */
  conditions: StockCondition[];
  /** Recommender facts; see RobotFit. */
  fit?: RobotFit;
  specs: Partial<Record<SpecKey, string>>;
  tagline: LocalizedText;
  description: LocalizedText;
  features: Record<Locale, string[]>;
  /** Optional rich detail page (admin page builder). */
  page?: ProductPage;
}

export const SPEC_KEYS: SpecKey[] = [
  "area",
  "slope",
  "cuttingWidth",
  "runtime",
  "connectivity",
  "filtration",
];

export const ROBOT_VARIANTS: RobotVariant[] = [
  "mower",
  "pool",
  "cleaner",
  "equipment",
  "cooking",
  "delivery",
  "installation",
  "demo",
];

/** Category whose products are services (installation, demos) rather than robots. */
export const SERVICE_CATEGORY = "services" as const;

/**
 * Brand assumed when a product row predates add-product-brand.sql or the admin
 * left the field blank. Mirrors the column default in that migration — keep
 * the two in step. Every robot in the launch lineup is Mammotion.
 */
export const DEFAULT_BRAND = "Mammotion";

/** A product whose price is set — the only kind the cart and checkout take. */
export type PricedProduct = Product & { price: number };

export const hasPrice = (product: Product): product is PricedProduct =>
  product.price !== null;

export const formatBaht = (price: number) => `฿${price.toLocaleString("en-US")}`;

/**
 * How to name a product to people: "Gausium Phantas", "Pudu Bella" — the
 * brand is part of how people ask for these — but plain "Pudu1" when the name
 * already starts with it. Mammotion's own robots and the services keep their
 * names as they are ("LUBA 3 AWD 5000").
 */
export function productLabel(product: Pick<Product, "name" | "brand" | "category">): string {
  const brand = product.brand;
  if (!brand || brand === DEFAULT_BRAND || product.category === SERVICE_CATEGORY) {
    return product.name;
  }
  return product.name.toLowerCase().startsWith(brand.toLowerCase())
    ? product.name
    : `${brand} ${product.name}`;
}
