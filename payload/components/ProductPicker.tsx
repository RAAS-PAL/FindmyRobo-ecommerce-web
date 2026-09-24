import { loadCatalog } from "./catalog";
import { ProductPickerClient } from "./ProductPickerClient";

/**
 * SEO → Products: pick which product a row overrides, from the real
 * catalogue, instead of typing its id. (Server component: it reads the
 * catalogue, then hands a plain list to the client select.)
 */
export async function ProductPicker(props: { path: string; readOnly?: boolean }) {
  const catalog = await loadCatalog();
  return (
    <ProductPickerClient
      path={props.path}
      readOnly={props.readOnly}
      options={catalog.map((p) => ({ value: p.id, label: p.hidden ? `${p.name} (hidden)` : p.name }))}
    />
  );
}
