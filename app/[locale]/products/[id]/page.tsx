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
import ProductGallery from "@/components/product/ProductGallery";
import ProductPageBlocks from "@/components/product/ProductPageBlocks";
import ExpandOnScroll from "@/components/product/ExpandOnScroll";
import SpecTable from "@/components/product/SpecTable";
import VideoEmbed from "@/components/product/VideoEmbed";
import {
  formatBaht,
  SERVICE_CATEGORY,
  type Locale,
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
  const tc = await getTranslations("categories");

  const features = product.features[locale as Locale] ?? product.features.en;
  const page = product.page;
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
    // overflow-x-clip contains ExpandOnScroll's full-bleed w-screen panel
    <main className="overflow-x-clip bg-surface">
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
          <span className="font-medium text-content">{product.name}</span>
        </nav>

        {/* top: gallery + info */}
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* gallery */}
          <FadeIn>
            <ProductGallery
              product={product}
              labels={{
                previous: t("galleryPrevious"),
                next: t("galleryNext"),
                thumbnail: t("galleryThumbnail"),
                openFullscreen: t("galleryOpenFullscreen"),
                closeFullscreen: t("galleryCloseFullscreen"),
                imageCount: t("galleryImageCount", { current: "#current#", total: "#total#" }),
              }}
            />
          </FadeIn>

          {/* info */}
          <FadeIn delay={0.1} className="flex flex-col">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
              {tc(`${product.category}.name`)}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-content sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              {product.description[locale as Locale] ?? product.description.en}
            </p>

            <p className="mt-6 font-mono text-3xl font-semibold tabular-nums text-content">
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
                    className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-forest px-7 text-[15px] font-semibold text-content transition-colors duration-300 hover:border-gold hover:text-gold-600"
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
              <h2 className="font-display text-lg font-bold text-content">
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

        {/* review/demo video (admin page builder) */}
        {page?.videoUrl && (
          <FadeIn className="mt-16 sm:mt-20">
            <div className="mx-auto max-w-3xl">
              <VideoEmbed url={page.videoUrl} title={product.name} />
              {page.videoCaption && (
                <p className="mt-3 text-center text-[12.5px] text-ink-muted">
                  {page.videoCaption[locale as Locale] || page.videoCaption.en}
                </p>
              )}
            </div>
          </FadeIn>
        )}

        {/* content sections (admin page builder) */}
        {page?.blocks && page.blocks.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <ProductPageBlocks
              blocks={page.blocks}
              locale={locale as Locale}
              productName={product.name}
            />
          </div>
        )}

        {/* specs: the page-builder table only — the quick-spec fields are no
            longer shown here, they feed the checkout install-tier match */}
        {page?.specGroups && page.specGroups.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <ExpandOnScroll>
              <SpecTable
                groups={page.specGroups}
                heading={t("specTableHeading")}
                productName={product.name}
                locale={locale as Locale}
              />
            </ExpandOnScroll>
          </div>
        )}

        {/* related */}
        <div className="mt-16 sm:mt-20">
          <FadeIn>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
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
