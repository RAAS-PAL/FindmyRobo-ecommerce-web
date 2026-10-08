import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getProductById } from "@/lib/productStore";
import ProductForm from "@/components/admin/ProductForm";
import { getAdminLocale } from "@/lib/adminLocale";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getAdminLocale();
  const [product, t] = await Promise.all([
    getProductById(id),
    getTranslations({ locale, namespace: "admin.productPages" }),
  ]);
  if (!product) notFound();

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted transition-colors hover:text-accent-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("backToProducts")}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-content">
        {t("editTitle")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {t("editDescription")}
      </p>
      <div className="mt-8">
        <ProductForm initial={product} />
      </div>
    </>
  );
}
