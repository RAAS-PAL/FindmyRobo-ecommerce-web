import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FloatingAddToCart from "@/components/cart/FloatingAddToCart";
import CompareToggleButton from "@/components/compare/CompareToggleButton";
import ServicePurchasePanel from "@/components/cart/ServicePurchasePanel";
import DemoPurchasePanel from "@/components/cart/DemoPurchasePanel";
import InstallPurchasePanel from "@/components/cart/InstallPurchasePanel";
import RobotCard from "@/components/ui/RobotCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPageBlocks from "@/components/product/ProductPageBlocks";
import ShowcasePage from "@/components/product/ShowcasePage";
import MetaLine from "@/components/ui/MetaLine";
import Button from "@/components/ui/Button";
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
  DEFAULT_BRAND,
  isPriced,
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
    // other versions of this robot that are on show, for the header's switch,
    // in catalogue order so it reads the same on each of their pages
    const modelIds = new Set([product.id, ...(showcase.models ?? [])]);
    const models = allProducts
      .filter((p) => modelIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name }));
    return (
      <>
        {structuredData}
        <ShowcasePage
          product={product}
          showcase={showcase}
          models={models.length > 1 ? models : undefined}
          afterFeatures={
            otherBlocks.length > 0 ? (
              <ProductPageBlocks
                blocks={otherBlocks}
                locale={l}
                productName={product.name}
                featureGroupHeading={t("moreFeaturesHeading")}
              />
            ) : undefined
          }
          afterSpecs={
            (page?.boxItems?.length ?? 0) > 0 || (page?.faqs?.length ?? 0) > 0 ? (
              <>
                {page?.boxItems && page.boxItems.length > 0 && (
                  <div>
                    <BoxContents items={page.boxItems} heading={t("boxHeading")} locale={l} />
                  </div>
                )}
                {page?.faqs && page.faqs.length > 0 && (
                  <div>
                    <FaqSection faqs={page.faqs} heading={t("faqHeading")} locale={l} />
                  </div>
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
    <main className="overflow-x-clip bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-small text-ink-muted">
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
              mobile where the two columns stack. Nothing above it may carry a
              transform: a transformed ancestor becomes the containing block,
              which breaks sticky. */}
          <div className="lg:sticky lg:top-24">
            <div>
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
            </div>
          </div>

          {/* info */}
          <div className="flex flex-col">
            <MetaLine>
              {product.brand ?? DEFAULT_BRAND} · {tc(`${product.category}.nav`)}
            </MetaLine>
            <h1 className="mt-2 font-display text-title text-content">
              {product.name}
            </h1>
            <p className="mt-4 text-body leading-relaxed text-ink-muted">
              {product.description[locale as Locale] ?? product.description.en}
            </p>

            {/* Demo and installation both price by coverage band, so the figure
                belongs in their panel rather than as one number up here. */}
            {!isDemo && !isInstall && (
              <div className="mt-6">
                <PriceOrQuote
                  amount={product.price}
                  className="text-title font-semibold tabular-nums text-content"
                  quoteClassName="font-display text-heading text-content"
                />
                {!siteConfig.showPrices && (
                  <p className="mt-2 max-w-md text-small leading-relaxed text-ink-muted">
                    {tq("note")}
                  </p>
                )}
              </div>
            )}
            {product.preorder && (
              <p className="mt-2 text-small font-medium text-accent-600">{t("preorderNote")}</p>
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
                  <Button href="/products/request-a-demo" size="lg" variant="secondary" className="sm:flex-1">
                    {t("ctaDemo")}
                  </Button>
                </div>
              )}
            </div>
            {!isService && (
              <div className="mt-3">
                <CompareToggleButton productId={product.id} />
              </div>
            )}
            <p className="mt-4 text-center text-caption text-ink-muted sm:text-left">
              {t("returnsNote")}
            </p>
            {siteConfig.cartEnabled && (
              <PaymentMethods className="mt-4 justify-center sm:justify-start" />
            )}

            {/* features */}
            <div className="mt-10 rounded-card bg-cloud p-6 sm:p-8">
              <h2 className="font-display text-heading text-content">{t("featuresHeading")}</h2>
              <ul className="mt-4 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-small text-content">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
              <SpecTable
                groups={page.specGroups}
                heading={t("specTableHeading")}
                productName={product.name}
                locale={locale as Locale}
              />
          </div>
        )}

        {/* what's in the box — admin-editable, rendered after the specs */}
        {page?.boxItems && page.boxItems.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <div>
              <BoxContents
                items={page.boxItems}
                heading={t("boxHeading")}
                locale={locale as Locale}
              />
            </div>
          </div>
        )}

        {/* FAQ accordion — admin-editable */}
        {page?.faqs && page.faqs.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <div>
              <FaqSection
                faqs={page.faqs}
                heading={t("faqHeading")}
                locale={locale as Locale}
              />
            </div>
          </div>
        )}

        {/* customer reviews — public, written by signed-in customers */}
        <div className="mt-16 sm:mt-20">
          <div>
            <ProductReviews productId={product.id} />
          </div>
        </div>

        {/* related */}
        <div className="mt-16 sm:mt-20">
          <div>
            <h2 className="font-display text-title text-content">{t("relatedHeading")}</h2>
          </div>
          {/* a row to swipe on phones, a grid from sm */}
          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {related.map((p) => (
              <RobotCard key={p.id} product={p} className="w-[300px] shrink-0 snap-start sm:w-auto" />
            ))}
          </div>
        </div>
      </div>
    </main>
    {!isService && isPriced(product) && (
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
