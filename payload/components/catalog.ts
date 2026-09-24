import { getAllProductsForAdmin } from "@/lib/productStore";
import { metaDescription } from "@/lib/seo";

/**
 * The product catalogue as the SEO editor needs it. Products live in Supabase
 * (edited at /admin), not in Payload, so the CMS reads them from there — hidden
 * ones included, so their text can be prepared before they go live.
 */
export interface CatalogProduct {
  id: string;
  name: string;
  hidden: boolean;
  /** Main photo — what a shared product link shows. */
  image: string | null;
  /** What the product page's search snippet is when not overridden. */
  autoDescription: { en: string; th: string };
}

export async function loadCatalog(): Promise<CatalogProduct[]> {
  try {
    return (await getAllProductsForAdmin()).map((p) => ({
      id: p.id,
      name: p.name,
      hidden: p.visible === false,
      image: p.imageUrl ?? null,
      autoDescription: {
        en: metaDescription(p.description.en),
        th: metaDescription(p.description.th ?? p.description.en),
      },
    }));
  } catch (error) {
    // The CMS must still open if the catalogue can't be read.
    console.error("CMS: could not load products for the SEO editor:", error);
    return [];
  }
}
