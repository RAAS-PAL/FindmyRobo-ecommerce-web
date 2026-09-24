import type { GlobalAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

/**
 * After a global is published, regenerate the storefront so the change is
 * live on the next visit — the same scope a product save uses in /admin.
 *
 * Draft saves are skipped: they must not change the live site. And outside a
 * Next.js request (migrations, the seed, the CLI) there is nothing to
 * revalidate, and revalidatePath throws — so that is swallowed.
 */
export const revalidateSite: GlobalAfterChangeHook = ({ doc }) => {
  if ((doc as { _status?: string })._status === "draft") return doc;
  try {
    revalidatePath("/", "layout");
  } catch {
    /* not inside a Next.js request */
  }
  return doc;
};
