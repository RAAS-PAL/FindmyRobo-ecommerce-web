/**
 * Product categories — the single source of truth for store structure.
 * The nav, shop pages, and product data all derive from this, so adding
 * a new robot category here propagates everywhere.
 *
 * English name/description here are fallback/reference copy; the UI reads
 * translated versions from messages/{locale}.json under `categories.*`.
 * Category pages live at /shop/[slug] (see categoryHref).
 */

export type CategorySlug =
  | "robot-mowers"
  | "pool-cleaners"
  | "cleaning-robots"
  | "delivery-robots"
  | "services";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** false = shown as "Coming Soon" in nav and shop, no products yet */
  available: boolean;
}

export const categories: Category[] = [
  {
    slug: "robot-mowers",
    name: "Robot Mowers",
    description: "Wire-free AWD mowers for every Thai garden",
    available: true,
  },
  {
    slug: "pool-cleaners",
    name: "Pool Cleaners",
    description: "Effortless crystal-clear pools",
    available: true,
  },
  {
    slug: "cleaning-robots",
    name: "Cleaning Robots",
    description: "Floor and window robots for the home",
    available: true,
  },
  {
    slug: "delivery-robots",
    name: "Delivery Robots",
    description: "Autonomous delivery for business",
    available: true,
  },
  {
    slug: "services",
    name: "Services",
    description: "Professional installation and in-home demos",
    available: true,
  },
];

export const categoryHref = (slug: CategorySlug) => `/shop/${slug}`;

export const getCategory = (slug: CategorySlug): Category =>
  categories.find((c) => c.slug === slug)!;
