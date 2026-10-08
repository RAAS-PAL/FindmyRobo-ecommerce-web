import { siteConfig } from "@/data/siteConfig";
import type { ContactContent } from "@/data/siteContent";
import { DEFAULT_BRAND, type Locale, type Product } from "@/data/products";
import { localizedUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/siteUrl";

/**
 * schema.org structured data (JSON-LD) — the machine-readable layer that tells
 * search engines *what* a page is about, not just what it says.
 *
 * Everything here is derived from data that already drives the visible page:
 * the product record, siteConfig, the i18n category names. Nothing is
 * authored separately, so it cannot drift from what the customer sees — and
 * that is not just tidiness. Google treats structured data as a claim it can
 * verify against the page; markup describing something the page does not
 * show is grounds for a manual penalty, not a warning. Deriving it from the
 * same source makes the mismatch impossible by construction.
 *
 * Adding a product in the admin panel therefore needs no follow-up here: its
 * page renders, and its JSON-LD is assembled from its record on the way out.
 */

const SCHEMA = "https://schema.org";

/** /public paths become absolute; Cloudinary and other full URLs pass through. */
const absolute = (src: string) => (/^https?:\/\//i.test(src) ? src : `${siteUrl}${src}`);

/**
 * Thai national format -> E.164, e.g. "02-576-5555" -> "+6625765555".
 * Google's guidance is international format; the visible page keeps the local
 * form Thai customers dial.
 */
const e164 = (thaiPhone: string) => "+66" + thaiPhone.replace(/\D/g, "").replace(/^0/, "");

/** Shared `Organization` node, referenced by id from the product offers. */
const ORGANIZATION_ID = `${siteUrl}/#organization`;

/** `contact` is the Admin → Content copy, so the markup matches the visible footer. */
export function organizationJsonLd(contact: ContactContent) {
  const { organization, salesContact } = siteConfig;
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: organization.name,
    legalName: organization.legalName,
    url: siteUrl,
    logo: absolute(organization.logo),
    email: contact.email,
    telephone: e164(contact.phone),
    address: { "@type": "PostalAddress", ...salesContact.postalAddress },
    // Only platforms with a real account — an empty or placeholder URL here
    // would be a broken claim, so the same filter the footer applies.
    sameAs: Object.values(contact.socials).filter(Boolean),
  };
}

export function productJsonLd(
  product: Product,
  locale: Locale,
  categoryName: string
) {
  const url = localizedUrl(locale, `/products/${product.id}`);
  const images = [product.imageUrl, ...(product.images ?? [])]
    .filter((s): s is string => Boolean(s))
    .map(absolute);

  return {
    "@context": SCHEMA,
    "@type": "Product",
    name: product.name,
    description: product.description[locale] ?? product.description.en,
    ...(images.length > 0 ? { image: images } : {}),
    brand: { "@type": "Brand", name: product.brand ?? DEFAULT_BRAND },
    ...(product.sku ? { sku: product.sku } : {}),
    category: categoryName,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "THB",
      // In quotation mode the price is deliberately absent — publishing one to
      // Google that the page itself refuses to show would be exactly the kind
      // of mismatch structured data is penalised for. When showPrices flips on,
      // the price appears here in the same deploy it appears on the page.
      ...(siteConfig.showPrices && product.price !== null ? { price: product.price } : {}),
      availability: product.preorder
        ? `${SCHEMA}/PreOrder`
        : `${SCHEMA}/InStock`,
      seller: { "@id": ORGANIZATION_ID },
    },
    // No aggregateRating yet: it may only be declared when the page visibly
    // shows the same rating, and the reviews table has just been created. Add
    // it once real reviews exist and ProductReviews renders the summary.
  };
}

/** Home > Products > Category > Product, mirroring the on-page breadcrumb. */
export function breadcrumbJsonLd(
  locale: Locale,
  items: { name: string; path: string }[]
) {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: localizedUrl(locale, item.path),
    })),
  };
}
