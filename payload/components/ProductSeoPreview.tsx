import { loadCatalog } from "./catalog";
import { ProductSeoPreviewClient } from "./SeoPreview";

/** SEO → Products row: the Google result and share card for that product. */
export async function ProductSeoPreview(props: { path: string }) {
  return <ProductSeoPreviewClient path={props.path} catalog={await loadCatalog()} />;
}
