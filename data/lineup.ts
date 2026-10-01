import type { CategorySlug } from "@/data/categories";

/**
 * Models we sell that are not in the product catalogue (Admin → Products) yet,
 * so they have no product page: the navbar menus and the category pages list
 * them from here, and "Get a quote" on one sends its name to sales.
 *
 * A category shows these only while it has no catalogue products of its own.
 * Once a model is added in Admin (with its own page, specs and photos), add all
 * of that category's models there and drop its entries here.
 *
 * Names are as supplied by the business (2026-09-30). Nothing else about a
 * model goes here until the manufacturer's spec sheet backs it
 * (see data/techAnatomy.ts for the sourcing rule).
 *
 * `conditions` is how that model is sold (business, 2026-10-01): new only,
 * pre-owned only, or both. The cards, menus, product page and quote form
 * all read it from here.
 *
 * `id` is also the anchor on the category page (/shop/<category>#<id>) and
 * what the quote form sends; keep ids stable.
 */

/** "new" is unused stock; "pre-owned" is a unit that has been used. */
export type StockCondition = "new" | "pre-owned";

export const STOCK_CONDITIONS = ["new", "pre-owned"] as const;

export function isStockCondition(value: string): value is StockCondition {
  return (STOCK_CONDITIONS as readonly string[]).includes(value);
}

/** "either" when the model is sold both new and pre-owned. */
export function conditionKind(
  conditions: readonly StockCondition[]
): "new" | "pre-owned" | "either" | null {
  const hasNew = conditions.includes("new");
  const hasUsed = conditions.includes("pre-owned");
  if (hasNew && hasUsed) return "either";
  if (hasNew) return "new";
  if (hasUsed) return "pre-owned";
  return null;
}

export interface LineupModel {
  id: string;
  category: CategorySlug;
  brand: string;
  name: string;
  /** How this model is sold. Order is new, then pre-owned. */
  conditions: StockCondition[];
  /** Its product page, once it has one (data/modelPages.ts). */
  page?: string;
  /** A /public image path, once there is a photo: a transparent cut-out,
   *  trimmed close (it is shown `object-contain` on a light tile). */
  image?: string;
}

export const lineup: LineupModel[] = [
  {
    id: "gausium-phantas",
    category: "cleaning-robots",
    brand: "Gausium",
    name: "Phantas",
    conditions: ["new", "pre-owned"],
    image: "/models/gausium-phantas.webp",
    page: "/products/gausium-phantas",
  },
  { id: "aventurier-a1-basic", category: "smart-equipment", brand: "Aventurier", name: "A1-Basic", conditions: ["new"] },
  {
    id: "aventurier-a1-youth",
    category: "smart-equipment",
    brand: "Aventurier",
    name: "A1-Youth",
    conditions: ["new"],
    image: "/models/aventurier/youth/hero.webp",
    page: "/products/aventurier-a1-youth",
  },
  {
    id: "t-chef-tc-e10a",
    category: "cooking-robots",
    brand: "T-Chef",
    name: "TC-E10A",
    conditions: ["new", "pre-owned"],
    image: "/models/t-chef-tc-e10a.webp",
    page: "/products/t-chef-tc-e10a",
  },
  { id: "pudu-1", category: "delivery-robots", brand: "Pudu", name: "Pudu1", conditions: ["pre-owned"] },
  { id: "pudu-2", category: "delivery-robots", brand: "Pudu", name: "Pudu2", conditions: ["pre-owned"] },
  { id: "pudu-bella", category: "delivery-robots", brand: "Pudu", name: "Bella", conditions: ["pre-owned"] },
  { id: "pudu-ketty", category: "delivery-robots", brand: "Pudu", name: "Ketty", conditions: ["pre-owned"] },
];

export const getLineupModel = (id: string): LineupModel | undefined =>
  lineup.find((model) => model.id === id);

export const lineupFor = (category: CategorySlug): LineupModel[] =>
  lineup.filter((model) => model.category === category);

/** "Pudu Bella" — the brand is part of how people ask for it — but plain
 *  "Pudu1" when the name already starts with the brand. */
export const lineupModelName = (model: LineupModel) =>
  model.name.toLowerCase().startsWith(model.brand.toLowerCase())
    ? model.name
    : `${model.brand} ${model.name}`;
