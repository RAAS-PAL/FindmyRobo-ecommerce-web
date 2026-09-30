/**
 * Product categories — the single source of truth for store structure.
 * The nav, shop pages, and product data all derive from this, so adding
 * a new robot category here propagates everywhere.
 *
 * Order is the navbar's tab order (2026-09-30: Lawn Mowers and Cleaner first,
 * then Smart Equipment, Cooker and Delivery — the Pudu robots), then the rest.
 *
 * English name/description here are fallback/reference copy; the UI reads
 * translated versions from messages/{locale}.json under `categories.*`
 * (`nav` is the shorter navbar label). Category pages live at /shop/[slug]
 * (see categoryHref).
 */

export type CategorySlug =
  | "robot-mowers"
  | "cleaning-robots"
  | "smart-equipment"
  | "cooking-robots"
  | "delivery-robots"
  | "pool-cleaners"
  | "services";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** false = shown as "Coming Soon" in the shop, no products yet */
  available: boolean;
  /** Has its own tab in the navbar. */
  nav: boolean;
}

export const categories: Category[] = [
  {
    slug: "robot-mowers",
    name: "Robotic Lawn Mowers",
    description: "Wire-free AWD mowers for every Thai garden",
    available: true,
    nav: true,
  },
  {
    slug: "cleaning-robots",
    name: "Cleaning Robots",
    description: "Gausium Phantas, autonomous floor cleaning for commercial spaces",
    available: true,
    nav: true,
  },
  {
    slug: "smart-equipment",
    name: "Smart Equipment",
    description: "Aventurier A1-Basic and A1-Youth",
    available: true,
    nav: true,
  },
  {
    slug: "cooking-robots",
    name: "Cooking Robots",
    description: "The T-Chef TC-E10A cooking robot",
    available: true,
    nav: true,
  },
  {
    slug: "delivery-robots",
    name: "Delivery Robots",
    description: "Pudu delivery robots for business",
    available: true,
    nav: true,
  },
  {
    slug: "pool-cleaners",
    name: "Pool Cleaners",
    description: "Effortless crystal-clear pools",
    // Not sold yet — flip to true when the category goes live.
    available: false,
    nav: false,
  },
  {
    slug: "services",
    name: "Services",
    description: "Professional installation and in-home demos",
    available: true,
    nav: false,
  },
];

export const categoryHref = (slug: CategorySlug) => `/shop/${slug}`;

export const getCategory = (slug: CategorySlug): Category =>
  categories.find((c) => c.slug === slug)!;

/** The categories with a navbar tab, in tab order. */
export const navCategories = categories.filter((c) => c.nav);
