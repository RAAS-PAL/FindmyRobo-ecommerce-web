import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductById } from "@/lib/productStore";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted transition-colors hover:text-gold-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to products
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-content">
        Edit Product
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Changes go live on the storefront as soon as you save.
      </p>
      <div className="mt-8">
        <ProductForm initial={product} />
      </div>
    </>
  );
}
