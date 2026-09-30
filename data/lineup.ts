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
 * `id` is also the anchor on the category page (/shop/<category>#<id>) and
 * what the quote form sends; keep ids stable.
 */
export interface LineupModel {
  id: string;
  category: CategorySlug;
  brand: string;
  name: string;
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
    image: "/models/gausium-phantas.webp",
  },
  { id: "aventurier-a1-basic", category: "smart-equipment", brand: "Aventurier", name: "A1-Basic" },
  { id: "aventurier-a1-youth", category: "smart-equipment", brand: "Aventurier", name: "A1-Youth" },
  { id: "t-chef-tc-e10a", category: "cooking-robots", brand: "T-Chef", name: "TC-E10A" },
  { id: "pudu-1", category: "delivery-robots", brand: "Pudu", name: "Pudu1" },
  { id: "pudu-2", category: "delivery-robots", brand: "Pudu", name: "Pudu2" },
  { id: "pudu-bella", category: "delivery-robots", brand: "Pudu", name: "Bella" },
  { id: "pudu-ketty", category: "delivery-robots", brand: "Pudu", name: "Ketty" },
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
