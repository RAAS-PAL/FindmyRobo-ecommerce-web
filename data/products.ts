import type { CategorySlug } from "@/data/categories";

/**
 * Visual style for the placeholder SVG illustration only — not the category.
 * "install" and "demo" are used by service products (see the "services"
 * category), which are sold alongside robots.
 */
export type RobotVariant = "luba" | "mini" | "pool" | "install" | "demo";

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
  | { type: "feature"; heading: LocalizedText; body: LocalizedText; image?: string }
  | {
      type: "cardGrid";
      heading?: LocalizedText;
      cards: { image: string; caption: LocalizedText }[];
    }
  | { type: "imageText"; image: string; body: LocalizedText; imageSide: "left" | "right" }
  | { type: "video"; heading?: LocalizedText; url: string; caption?: LocalizedText };

export const PAGE_BLOCK_TYPES = [
  "banner",
  "feature",
  "cardGrid",
  "imageText",
  "video",
] as const;

/** One group in the detailed specifications table (e.g. "Cutting System"). */
export interface SpecGroup {
  title: LocalizedText;
  rows: { label: LocalizedText; value: LocalizedText }[];
}

/**
 * Optional rich detail-page content. When absent the product page falls back
 * to the compact layout (description + features + the small specs band).
 */
export interface ProductPage {
  /** Review/demo video near the top (YouTube URL or /path or https mp4). */
  videoUrl?: string;
  videoCaption?: LocalizedText;
  /** Ordered marketing sections rendered below the fold. */
  blocks?: PageBlock[];
  /** Grouped specification table; replaces the compact specs band when set. */
  specGroups?: SpecGroup[];
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
  price: number;
  category: CategorySlug;
  variant: RobotVariant;
  /**
   * Optional product photo (absolute URL or /public path). When set it is
   * shown everywhere instead of the stylized `variant` illustration, which
   * remains the fallback.
   */
  imageUrl?: string;
  /**
   * Extra gallery photos (absolute URLs or /public paths), shown after
   * `imageUrl` in the product-page gallery. `imageUrl` stays the single image
   * used in cards, so this is only read by the detail page.
   */
  images?: string[];
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
  "luba",
  "mini",
  "pool",
  "install",
  "demo",
];

/** Category whose products are services (installation, demos) rather than robots. */
export const SERVICE_CATEGORY = "services" as const;

export const formatBaht = (price: number) => `฿${price.toLocaleString("en-US")}`;
