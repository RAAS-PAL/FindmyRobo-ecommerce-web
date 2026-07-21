import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ProductForm from "@/components/admin/ProductForm";
import { getAdminLocale } from "@/lib/adminLocale";

export default async function NewProductPage() {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.productPages" });

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted transition-colors hover:text-gold-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("backToProducts")}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-content">
        {t("newTitle")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {t("newDescription")}
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </>
  );
}
