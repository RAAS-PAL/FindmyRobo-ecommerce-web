import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { getAllProducts } from "@/lib/productStore";
import { formatBaht } from "@/data/products";
import { categories } from "@/data/categories";
import RobotIllustration from "@/components/ui/RobotIllustration";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy">
            Products
            <span className="ml-3 font-mono text-lg font-semibold text-ink-muted">
              {products.length}
            </span>
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex min-h-[46px] items-center gap-2 rounded-full bg-gold px-6 text-[13.5px] font-bold text-navy-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Package className="h-8 w-8 text-navy-300" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              No products yet. Add your first robot.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-navy-100 bg-cloud font-mono text-[10.5px] uppercase tracking-wider text-ink-muted">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Category</th>
                <th className="px-5 py-3 text-right font-semibold">Price</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/70">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-cloud/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy via-navy-800 to-navy-950 p-1">
                        <RobotIllustration
                          variant={product.variant}
                          className="h-full w-auto"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy">{product.name}</p>
                        <p className="truncate font-mono text-[11px] text-ink-muted">
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-ink-muted md:table-cell">
                    {categoryName(product.category)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums text-navy">
                    {formatBaht(product.price)}
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    {product.preorder ? (
                      <span className="rounded-full bg-gold/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                        Preorder
                      </span>
                    ) : (
                      <span className="rounded-full bg-navy-100/60 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                        In stock
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end">
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
