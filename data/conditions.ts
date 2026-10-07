/**
 * How a robot is sold (the product's `conditions`, set in Admin → Products):
 * new only, pre-owned only, or both (business, 2026-10-01). Second-hand stock
 * is labelled "Pre-owned" wherever it appears.
 */

/** "new" is unused stock; "pre-owned" is a unit that has been used. */
export type StockCondition = "new" | "pre-owned";

export const STOCK_CONDITIONS = ["new", "pre-owned"] as const;

export function isStockCondition(value: string): value is StockCondition {
  return (STOCK_CONDITIONS as readonly string[]).includes(value);
}

/** "either" when the robot is sold both new and pre-owned. */
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

/** Worth a label on cards and menus: anything sold pre-owned. Brand-new only
 *  is the norm (every mower), so it carries no label there. */
export const showsCondition = (conditions: readonly StockCondition[]) =>
  conditions.includes("pre-owned");
