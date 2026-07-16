import Link from "next/link";
import { GripVertical, Package, Pencil, Plus, Users } from "lucide-react";
import { getAllProducts } from "@/lib/productStore";
import { formatBaht } from "@/data/products";
import { categories } from "@/data/categories";
import { createServiceClient } from "@/lib/supabase/service";
import ProductVisual from "@/components/ui/ProductVisual";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

/** Count of registered customers. Returns null if Supabase isn't set up yet. */
async function getCustomerCount(): Promise<number | null> {
  try {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "user");
    return error ? null : count ?? 0;
  } catch {
    return null;
  }
}

export default async function AdminProductsPage() {
  const [products, customerCount] = await Promise.all([
    getAllProducts(),
    getCustomerCount(),
  ]);
  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content">
            Products
            <span className="ml-3 font-mono text-lg font-semibold text-ink-muted">
              {products.length}
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/reorder"
            className="flex min-h-[46px] items-center gap-2 rounded-full border border-forest-100 bg-surface px-5 text-[13.5px] font-semibold text-content transition-colors hover:border-gold hover:text-gold-600"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
            Reorder products
          </Link>
          <Link
            href="/admin/products/new"
            className="flex min-h-[46px] items-center gap-2 rounded-full bg-gold px-6 text-[13.5px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </Link>
        </div>
      </div>

      {/* stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-forest-100 bg-surface p-5">
          <div className="flex items-center gap-2 text-ink-muted">
            <Users className="h-4 w-4 text-gold-600" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Registered customers
            </span>
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-content">
            {customerCount ?? "—"}
          </p>
          {customerCount === null && (
            <p className="mt-1 text-[11px] text-ink-muted">
              Connect Supabase to see signups
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-forest-100 bg-surface p-5">
          <div className="flex items-center gap-2 text-ink-muted">
            <Package className="h-4 w-4 text-gold-600" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Products listed
            </span>
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-content">
            {products.length}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-forest-100 bg-surface">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Package className="h-8 w-8 text-forest-300" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              No products yet. Add your first robot.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-forest-100 bg-cloud font-mono text-[10.5px] uppercase tracking-wider text-ink-muted">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Category</th>
                <th className="px-5 py-3 text-right font-semibold">Price</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-100/70">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-cloud/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1">
                        <ProductVisual
                          product={product}
                          className="h-full w-auto"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-content">{product.name}</p>
                        <p className="truncate font-mono text-[11px] text-ink-muted">
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-ink-muted md:table-cell">
                    {categoryName(product.category)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums text-content">
                    {formatBaht(product.price)}
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    {product.preorder ? (
                      <span className="rounded-full bg-gold/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                        Preorder
                      </span>
                    ) : (
                      <span className="rounded-full bg-forest-100/60 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                        In stock
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        aria-label={`Edit ${product.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold/15 hover:text-gold-600"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-[12px] text-ink-muted">
        Products in unavailable categories stay hidden behind the &quot;Coming
        Soon&quot; page until the category is enabled in data/categories.ts.
      </p>
    </>
  );
}
