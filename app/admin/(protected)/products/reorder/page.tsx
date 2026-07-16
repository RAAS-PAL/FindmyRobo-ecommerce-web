import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductReorder from "@/components/admin/ProductReorder";
import { getAllProducts } from "@/lib/productStore";

export const dynamic = "force-dynamic";

export default async function ReorderProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-gold-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to products
      </Link>
      <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
        Catalog
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content">
        Reorder products
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Drag products into the storefront order you want, then save. You can
        also use the arrow buttons for precise keyboard-friendly changes.
      </p>
      <ProductReorder products={products} />
    </div>
  );
}
