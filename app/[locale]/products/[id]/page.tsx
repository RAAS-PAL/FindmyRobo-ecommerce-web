import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Calendar, Check, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import FadeIn from "@/components/ui/FadeIn";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FloatingAddToCart from "@/components/cart/FloatingAddToCart";
import CompareToggleButton from "@/components/compare/CompareToggleButton";
import ServicePurchasePanel from "@/components/cart/ServicePurchasePanel";
import DemoPurchasePanel from "@/components/cart/DemoPurchasePanel";
import InstallPurchasePanel from "@/components/cart/InstallPurchasePanel";
import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPageBlocks from "@/components/product/ProductPageBlocks";
import ShowcasePage from "@/components/product/ShowcasePage";
import ExpandOnScroll from "@/components/product/ExpandOnScroll";
import SpecTable from "@/components/product/SpecTable";
import BoxContents from "@/components/product/BoxContents";
import FaqSection from "@/components/product/FaqSection";
import ProductReviews from "@/components/product/ProductReviews";
import TechAnatomy from "@/components/sections/TechAnatomy";
import PaymentMethods from "@/components/product/PaymentMethods";
import PriceOrQuote from "@/components/ui/PriceOrQuote";
import {
  SERVICE_CATEGORY,
  type Locale,
  type PageBlock,
} from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { getAllProducts, getProductById, showsOnStorefront } from "@/lib/productStore";
import { localizedUrl, metaDescription, pageAlternates } from "@/lib/seo";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/structuredData";
import { getSiteContent } from "@/lib/siteContentStore";
import JsonLd from "@/components/seo/JsonLd";

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
  const { locale, id } = await params;
  const product = await getProductById(id);
  if (!product || !showsOnStorefront(product)) return {};

  // Description and share image come from the product record itself, so every
  // product — including ones added later — gets its own search snippet and its
  // own photo in a link preview with no extra data entry. Before this, every
  // product inherited the generic site description from the layout, and shares
  // on LINE and Facebook showed the FindMyRobo logo instead of the robot.
  //
  // Marketing can override either one per product and per language in
  // Admin → Content → SEO. A blank override means "automatic", so a product
  // nobody has touched keeps working exactly as described above.
  const l = locale as Locale;
  const override = (await getSiteContent()).seo.products[id];
  const title = override?.title[l] || `${product.name} — FindMyRobo`;
  const description =
    override?.description[l] ||
    metaDescription(product.description[l] ?? product.description.en);
  const url = localizedUrl(locale, `/products/${id}`);

  return {
    title,
    description,
    alternates: pageAlternates(locale, `/products/${id}`),
    openGraph: {
      title,
      description,
      url,
      ...(product.imageUrl ? { images: [{ url: product.imageUrl, alt: product.name }] } : {}),
    },
    ...(product.imageUrl ? { twitter: { images: [product.imageUrl] } } : {}),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const product = await getProductById(id);
  // hidden products are unreachable by direct URL, not just unlisted
  if (!product || !showsOnStorefront(product)) notFound();

  const t = await getTranslations("productDetail");
  const tc = await getTranslations("categories");
  const tq = await getTranslations("quotation");

  const features = product.features[locale as Locale] ?? product.features.en;
  const page = product.page;
  const allProducts = await getAllProducts();
  const isService = product.category === SERVICE_CATEGORY;
  // Demo packages price by area, so the price is chosen inside DemoPurchasePanel
  // (per selected area band) rather than shown as a single fixed number here.
  const isDemo = isService && product.variant === "demo";
  // Installation also prices by area, and the coverage band is chosen inside
  // InstallPurchasePanel rather than by browsing to a different tier product.
  const isInstall = isService && product.variant === "installation";
  const related = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) =>
      (b.category === product.category ? 1 : 0) - (a.category === product.category ? 1 : 0)
    )
    .slice(0, 3);

  // Structured data mirrors the visible breadcrumb and product card exactly —
  // same names, same order — because Google checks the two against each other.
  const categoryName = tc(`${product.category}.name`);
  const l = locale as Locale;
  const structuredData = (
    <>
      <JsonLd data={productJsonLd(product, l, categoryName)} />
      <JsonLd
        data={breadcrumbJsonLd(l, [
          { name: t("home"), path: "/" },
          { name: t("shop"), path: "/shop" },
          { name: categoryName, path: `/shop/${product.category}` },
          { name: product.name, path: `/products/${product.id}` },
        ])}
      />
    </>
  );

  // Full-screen page (Admin → Products → "Full-screen page"): its feature
  // sections with a photo become the page's photo sections; any other
  // sections, what's in the box and the FAQ follow in their usual form.
  const showcase = page?.showcase;
  if (showcase) {
    const otherBlocks = (page?.blocks ?? []).filter((b) => !(b.type === "feature" && b.image));
    return (
      <>
        {structuredData}
        <ShowcasePage
          product={product}
          showcase={showcase}
          afterFeatures={
            otherBlocks.length > 0 ? (
              <ProductPageBlocks blocks={otherBlocks} locale={l} productName={product.name} />
            ) : undefined
          }
          afterSpecs={
            (page?.boxItems?.length ?? 0) > 0 || (page?.faqs?.length ?? 0) > 0 ? (
              <>
                {page?.boxItems && page.boxItems.length > 0 && (
                  <FadeIn>
                    <BoxContents items={page.boxItems} heading={t("boxHeading")} locale={l} />
                  </FadeIn>
                )}
                {page?.faqs && page.faqs.length > 0 && (
                  <FadeIn>
                    <FaqSection faqs={page.faqs} heading={t("faqHeading")} locale={l} />
                  </FadeIn>
                )}
              </>
            ) : undefined
          }
        />
      </>
    );
  }

  return (
    <>
    {structuredData}
    {/* overflow-x-clip contains ExpandOnScroll's full-bleed w-screen panel */}
    <main className="overflow-x-clip bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
          <Link href="/" className="transition-colors hover:text-accent-600">
            {t("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href="/shop" className="transition-colors hover:text-accent-600">
            {t("shop")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link
            href={`/shop/${product.category}`}
            className="transition-colors hover:text-accent-600"
          >
            {tc(`${product.category}.name`)}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-content">{product.name}</span>
        </nav>

        {/* top: gallery + info.
            lg:items-start matters — grid children stretch to the row height by
            default, and a stretched item has nowhere to stick, so the sticky
            gallery below would silently do nothing. */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-12">
          {/* gallery — pinned while the taller info column scrolls past it, so
              the robot stays visible through the whole spec read. Native
              position:sticky rather than intercepting scroll: the page never
              stops responding to the wheel, and it simply doesn't apply on
              mobile where the two columns stack.

              The sticky wrapper sits OUTSIDE FadeIn on purpose — framer-motion
              leaves a transform on the element it animates, and a transformed
              ancestor becomes the containing block, which breaks sticky. */}
          <div className="lg:sticky lg:top-24">
            <FadeIn>
              <ProductGallery
                product={product}
                labels={{
                  previous: t("galleryPrevious"),
                  next: t("galleryNext"),
                  thumbnail: t("galleryThumbnail"),
                  openFullscreen: t("galleryOpenFullscreen"),
                  closeFullscreen: t("galleryCloseFullscreen"),
                  imageCount: t("galleryImageCount", {
                    current: "#current#",
                    total: "#total#",
                  }),
                  zoomIn: t("galleryZoomIn"),
                  zoomOut: t("galleryZoomOut"),
                }}
              />
            </FadeIn>
          </div>

          {/* info */}
          <FadeIn delay={0.1} className="flex flex-col">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-600">
              {tc(`${product.category}.name`)}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-content sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              {product.description[locale as Locale] ?? product.description.en}
            </p>

            {/* Demo and installation both price by coverage band, so the figure
                belongs in their panel rather than as one number up here. */}
            {!isDemo && !isInstall && (
              <div className="mt-6">
                <PriceOrQuote
                  amount={product.price}
                  className="font-mono text-3xl font-semibold tabular-nums text-content"
                  quoteClassName="font-display text-2xl font-extrabold text-content"
                />
                {!siteConfig.showPrices && (
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
                    {tq("note")}
                  </p>
                )}
              </div>
            )}
            {product.preorder && (
              <p className="mt-2 text-[13px] font-medium text-accent-600">{t("preorderNote")}</p>
            )}

            <div className="mt-8">
              {isService ? (
                isDemo ? (
                  <DemoPurchasePanel currentId={product.id} />
                ) : isInstall ? (
                  <InstallPurchasePanel currentId={product.id} />
                ) : (
                  <ServicePurchasePanel serviceId={product.id} />
                )
              ) : (
                <div id="pdp-primary-cta" className="flex flex-col gap-3 sm:flex-row">
                  <AddToCartButton productId={product.id} />
                  <Link
                    href="/products/request-a-demo"
                    className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-forest px-7 text-[15px] font-semibold text-content transition-colors duration-300 hover:border-accent hover:text-accent-600 dark:border-white/30 dark:hover:border-accent"
                  >
                    <Calendar className="h-4.5 w-4.5" aria-hidden="true" />
                    {t("ctaDemo")}
                  </Link>
                </div>
              )}
            </div>
            {!isService && (
              <div className="mt-3">
                <CompareToggleButton productId={product.id} />
              </div>
            )}
            <p className="mt-4 text-center text-[12px] text-ink-muted sm:text-left">
              {t("returnsNote")}
            </p>
            <PaymentMethods className="mt-4 justify-center sm:justify-start" />

            {/* features */}
            <div className="mt-10 rounded-2xl bg-cloud p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-content">
                {t("featuresHeading")}
              </h2>
              <ul className="mt-4 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                      <Check className="h-3 w-3 text-accent-600" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* content sections (admin page builder). The legacy top-of-page video
            (page.videoUrl) is folded in as a leading video block so it orders
            alongside everything else; once the product is re-saved in the admin
            it becomes a real, reorderable block and videoUrl is dropped. */}
        {(() => {
          const legacyVideo: PageBlock[] = page?.videoUrl
            ? [
                {
                  type: "video",
                  url: page.videoUrl,
                  ...(page.videoCaption ? { caption: page.videoCaption } : {}),
                },
              ]
            : [];
          const blocks: PageBlock[] = [...legacyVideo, ...(page?.blocks ?? [])];
          return blocks.length > 0 ? (
            <div className="mt-16 sm:mt-20">
              <ProductPageBlocks
                blocks={blocks}
                locale={locale as Locale}
                productName={product.name}
              />
            </div>
          ) : null;
        })()}

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

        {/* what's in the box — admin-editable, rendered after the specs */}
        {page?.boxItems && page.boxItems.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <FadeIn>
              <BoxContents
                items={page.boxItems}
                heading={t("boxHeading")}
                locale={locale as Locale}
              />
            </FadeIn>
          </div>
        )}

        {/* FAQ accordion — admin-editable */}
        {page?.faqs && page.faqs.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <FadeIn>
              <FaqSection
                faqs={page.faqs}
                heading={t("faqHeading")}
                locale={locale as Locale}
              />
            </FadeIn>
          </div>
        )}

        {/* customer reviews — public, written by signed-in customers */}
        <div className="mt-16 sm:mt-20">
          <FadeIn>
            <ProductReviews productId={product.id} />
          </FadeIn>
        </div>

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
    {!isService && product.price !== null && (
      <FloatingAddToCart
        productId={product.id}
        name={product.name}
        price={product.price}
        anchorId="pdp-primary-cta"
      />
    )}
    </>
  );
}
