import type { CategorySlug } from "@/data/categories";

/** Visual style for the placeholder SVG illustration only — not the category. */
export type RobotVariant = "luba" | "mini" | "pool";

/**
 * Spec keys map to translated labels in messages (productDetail.specLabels.*).
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

/**
 * Product records live in data/products.json and are managed through the
 * admin panel (lib/productStore.ts). Marketing copy is stored per-locale on
 * the record itself so admin-added products need no message-file entries.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: CategorySlug;
  variant: RobotVariant;
  preorder?: boolean;
  specs: Partial<Record<SpecKey, string>>;
  tagline: LocalizedText;
  description: LocalizedText;
  features: Record<Locale, string[]>;
}

export const SPEC_KEYS: SpecKey[] = [
  "area",
  "slope",
  "cuttingWidth",
  "runtime",
  "connectivity",
  "filtration",
];

export const ROBOT_VARIANTS: RobotVariant[] = ["luba", "mini", "pool"];

export const formatBaht = (price: number) => `฿${price.toLocaleString("en-US")}`;
