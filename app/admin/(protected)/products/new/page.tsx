import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
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
        Add Product
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Fill in both English and Thai copy — the storefront shows whichever
        language the customer is browsing in.
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </>
  );
}
