/**
 * Products whose id — which is also their URL slug — was changed: old id → new id.
 *
 * The old address redirects for good (next.config.ts), and a lookup by either
 * id finds the product, whether or not the rename has run in the database yet.
 * Orders keep the id the product had when it was bought, so a past buyer
 * still counts as one after the rename.
 */
export const RENAMED_PRODUCTS: Record<string, string> = {
  // The "2" was missing, so the address read like the first LUBA Mini.
  "luba-mini-awd-1500": "luba-mini-2-awd-1500",
};

/** This id, plus the id the same product had before or has after a rename. */
export function sameProductIds(id: string): string[] {
  const ids = new Set([id]);
  for (const [oldId, newId] of Object.entries(RENAMED_PRODUCTS)) {
    if (oldId === id) ids.add(newId);
    if (newId === id) ids.add(oldId);
  }
  return [...ids];
}
