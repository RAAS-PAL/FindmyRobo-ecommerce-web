import { hasPrice, SERVICE_CATEGORY, type PricedProduct, type Product } from "@/data/products";

/**
 * Installation coverage tiers.
 *
 * Each coverage band is its own product in the catalogue — that is how the
 * sales team prices them and how the quotation references them. But a customer
 * shouldn't have to browse three near-identical cards to buy one service, so
 * listings collapse them to a single entry and the coverage is chosen on the
 * product page instead.
 *
 * The tier products themselves are untouched: checkout, the quotation, and the
 * admin panel all still see three distinct products.
 */

/** "5,000 m²" → 5000; NaN when the spec is missing or unparsable. */
export const parseArea = (spec?: string) =>
  spec ? Number(spec.replace(/[^0-9]/g, "")) : NaN;

export const isInstallTier = (product: Product) =>
  product.category === SERVICE_CATEGORY && product.variant === "installation";

/** Every installation tier with a usable coverage figure, smallest first. */
export function installTiers(products: Product[]): PricedProduct[] {
  return products
    .filter(hasPrice)
    .filter((p) => isInstallTier(p) && !Number.isNaN(parseArea(p.specs.area)))
    .sort((a, b) => parseArea(a.specs.area) - parseArea(b.specs.area));
}

/**
 * The smallest tier that covers the robot's mowing area, or the largest tier
 * when the robot is bigger than anything on offer.
 *
 * A robot with no coverage spec falls through to the smallest tier rather than
 * the largest — quoting someone the 10,000 m² package for a townhouse garden
 * because a field was left blank in the admin panel is the worse failure.
 */
export function recommendedTier(
  robot: Product | undefined,
  tiers: Product[]
): Product | undefined {
  if (tiers.length === 0) return undefined;
  const area = parseArea(robot?.specs.area);
  if (Number.isNaN(area)) return tiers[0];
  return tiers.find((t) => parseArea(t.specs.area) >= area) ?? tiers[tiers.length - 1];
}

/**
 * Listing view of the catalogue: the installation tiers become one entry,
 * represented by the smallest. Everything else passes through untouched.
 */
export function collapseInstallTiers(products: Product[]): Product[] {
  const tiers = installTiers(products);
  if (tiers.length <= 1) return products;
  const representativeId = tiers[0].id;
  return products.filter((p) => !isInstallTier(p) || p.id === representativeId);
}
