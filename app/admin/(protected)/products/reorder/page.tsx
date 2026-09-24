import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ProductReorder from "@/components/admin/ProductReorder";
import { getAllProductsForAdmin } from "@/lib/productStore";
import { getAdminLocale } from "@/lib/adminLocale";

export const dynamic = "force-dynamic";

export default async function ReorderProductsPage() {
  const locale = await getAdminLocale();
  const [products, t] = await Promise.all([
    getAllProductsForAdmin(),
    getTranslations({ locale, namespace: "admin.reorder" }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-gold-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("backToProducts")}
      </Link>
      <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {t("description")}
      </p>
      <ProductReorder products={products} />
    </div>
  );
}
