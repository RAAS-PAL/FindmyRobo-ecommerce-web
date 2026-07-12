import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Calendar, Check, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import FadeIn from "@/components/ui/FadeIn";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ServicePurchasePanel from "@/components/cart/ServicePurchasePanel";
import ProductCard from "@/components/ui/ProductCard";
import RobotIllustration from "@/components/ui/RobotIllustration";
import {
  formatBaht,
  SERVICE_CATEGORY,
  type Locale,
  type SpecKey,
} from "@/data/products";
import { getAllProducts, getProductById } from "@/lib/productStore";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return routing.locales.flatMap((locale) =>
    products.map((p) => ({ locale, id: p.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return { title: `${product.name} — RoboStore TH` };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const product = await getProductById(id);
  if (!product) notFound();

  const t = await getTranslations("productDetail");
  const tp = await getTranslations("products");
  const tc = await getTranslations("categories");

  const specEntries = Object.entries(product.specs) as [SpecKey, string][];
  const features = product.features[locale as Locale] ?? product.features.en;
  const allProducts = await getAllProducts();
  const isService = product.category === SERVICE_CATEGORY;
  // Robots a service can be attached to (everything that isn't itself a service).
  const robotOptions = allProducts
    .filter((p) => p.category !== SERVICE_CATEGORY)
    .map((p) => ({ id: p.id, name: p.name }));
  const related = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) =>
      (b.category === product.category ? 1 : 0) - (a.category === product.category ? 1 : 0)
    )
    .slice(0, 3);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
          <Link href="/" className="transition-colors hover:text-gold-600">
            {t("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href="/shop" className="transition-colors hover:text-gold-600">
            {t("shop")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link
            href={`/shop/${product.category}`}
            className="transition-colors hover:text-gold-600"
          >
            {tc(`${product.category}.name`)}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-forest">{product.name}</span>
        </nav>

        {/* top: gallery + info */}
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* gallery placeholder */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest to-forest-800 p-10 sm:p-16">
              {product.preorder && (
                <span className="absolute right-5 top-5 rounded-full bg-gold px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-forest-950">
                  {tp("preorder")}
                </span>
              )}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[80px]"
                aria-hidden="true"
              />
              <RobotIllustration
                variant={product.variant}
                className="relative mx-auto h-64 w-auto drop-shadow-[0_24px_40px_rgba(6,31,21,0.7)] sm:h-80"
              />
            </div>
          </FadeIn>

          {/* info */}
          <FadeIn delay={0.1} className="flex flex-col">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
              {tc(`${product.category}.name`)}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-forest sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              {product.description[locale as Locale] ?? product.description.en}
            </p>

            <p className="mt-6 font-mono text-3xl font-semibold tabular-nums text-forest">
              {formatBaht(product.price)}
            </p>
            {product.preorder && (
              <p className="mt-2 text-[13px] font-medium text-gold-600">{t("preorderNote")}</p>
            )}

            <div className="mt-8">
              {isService ? (
                <ServicePurchasePanel serviceId={product.id} robots={robotOptions} />
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <AddToCartButton productId={product.id} />
                  <a
                    href="#contact"
                    className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-forest px-7 text-[15px] font-semibold text-forest transition-colors duration-300 hover:border-gold hover:text-gold-600"
                  >
                    <Calendar className="h-4.5 w-4.5" aria-hidden="true" />
                    {t("ctaDemo")}
                  </a>
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-[12px] text-ink-muted sm:text-left">
              {t("returnsNote")}
            </p>

            {/* features */}
            <div className="mt-10 rounded-2xl bg-cloud p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-forest">
                {t("featuresHeading")}
              </h2>
              <ul className="mt-4 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20">
                      <Check className="h-3 w-3 text-gold-600" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* specs */}
        {specEntries.length > 0 && (
        <FadeIn className="mt-16 sm:mt-20">
          <div className="rounded-3xl bg-forest-950 p-8 text-white sm:p-12">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                {t("specsHeading")}
              </h2>
              <p className="font-mono text-[11px] uppercase tracking-wider text-white/40">
                {t("specsNote")}
              </p>
            </div>
            <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {specEntries.map(([key, value]) => (
                <div key={key} className="border-l-2 border-gold/60 pl-4">
                  <dt className="text-[12px] font-medium uppercase tracking-wider text-white/50">
                    {t(`specLabels.${key}`)}
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-semibold text-gold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeIn>
        )}

        {/* related */}
        <div className="mt-16 sm:mt-20">
          <FadeIn>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-forest sm:text-3xl">
              {t("relatedHeading")}
            </h2>
          </FadeIn>
          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
