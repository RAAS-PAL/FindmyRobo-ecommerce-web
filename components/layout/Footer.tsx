"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/ui/BrandIcons";
import { salesMapUrl, siteConfig } from "@/data/siteConfig";
import { useSiteContent } from "@/components/SiteContentProvider";
import type { SocialPlatform } from "@/data/siteContent";
import { SERVICE_CATEGORY, type Product } from "@/data/products";

const payments = ["PromptPay", "Visa", "Mastercard", "Bank Transfer"];

/** Keeps the products column from running longer than the other three. */
const MAX_FOOTER_PRODUCTS = 8;

/**
 * Footer "Support and Service" column — THE RESTORE LIST.
 *
 * All seven of these shipped pointing at "#": seven dead links on every page.
 * They are kept here in order, each with the page it is waiting on, so putting
 * one back is a matter of filling in its href — nothing else needs editing.
 *
 * Labels are NOT here; they stay in messages/{en,th}.json under footer.support
 * and are matched to this array BY INDEX, so both languages keep working. Do
 * not reorder one without the other.
 *
 *   0  Support                      /support hub, or /contact-sales as a stopgap
 *                                   (that page is real today: phone, LINE, map)
 *   1  Warranty                     needs warranty length + what it covers,
 *                                   and whether it differs per model
 *   2  Refunds and Returns          docs/ReturnNRefundPolicy.docx may already
 *                                   hold this; Omise merchant review expects it
 *   3  Shipping                     needs delivery times + real coverage area
 *   4  Payment and Finance Options  needs the confirmed payment methods; the
 *                                   site is in quotation mode until Omise is live
 *   5  Privacy Policy               REQUIRED by Thai PDPA before launch — must
 *                                   name the data controller
 *   6  Terms and Conditions         expected by Omise merchant review
 *
 * A row left null renders nothing, and the whole column disappears while every
 * row is null — an empty heading is worse than no column.
 */
const SUPPORT_HREFS: (string | null)[] = [
  null, // Support
  null, // Warranty
  "/refund-policy", // Refunds and Returns — published, Thai legal text
  null, // Shipping
  null, // Payment and Finance Options
  null, // Privacy Policy
  null, // Terms and Conditions
];

/**
 * Destinations for footer.about, positional — index 0 is the first label in the
 * translated array. Keep this in step with the `about` array in
 * messages/{en,th}.json; adding a label without a href here falls back to "#".
 */
const ABOUT_HREFS = ["/about", "/#contact", "/#support", "/recommend"];

/**
 * Icon + accessible name per platform. What actually renders is the
 * intersection of this and the socials set in Admin → Content, so a platform with no account
 * simply produces no icon — previously all five rendered and every one linked
 * to "#", which looks like the site is broken.
 */
const SOCIAL_META: Record<SocialPlatform, { label: string; Icon: typeof FacebookIcon }> = {
  facebook: { label: "Facebook", Icon: FacebookIcon },
  youtube: { label: "YouTube", Icon: YouTubeIcon },
  tiktok: { label: "TikTok", Icon: TikTokIcon },
};

/** Fixed display order, independent of the key order in the stored content. */
const SOCIAL_ORDER: SocialPlatform[] = ["facebook", "youtube", "tiktok"];

/**
 * A client component so phone, email and socials (Admin → Content → Contact)
 * update in the editor's live preview.
 */
export default function Footer({ products = [] }: { products?: Product[] }) {
  const contact = useSiteContent().contact;
  const t = useTranslations("footer");
  const support = t.raw("support") as string[];
  const about = t.raw("about") as string[];
  const { phone, email } = contact;
  // The registered address stays in code: it has to match the company record.
  const { addressLines } = siteConfig.salesContact;
  const supportLinks = support.flatMap((label, index) => {
    const href = SUPPORT_HREFS[index];
    return href ? [{ label, href }] : [];
  });
  // Keeps the 12-column row full when the support column is not rendered.
  const contactSpan = supportLinks.length > 0 ? "lg:col-span-3" : "lg:col-span-5";

  const socialLinks = SOCIAL_ORDER.flatMap((platform) => {
    const href = contact.socials[platform];
    return href ? [{ platform, href, ...SOCIAL_META[platform] }] : [];
  });

  // Installation packages are add-ons bought alongside a robot, not something
  // anyone browses to from a footer.
  const footerProducts = products
    .filter((product) => product.category !== SERVICE_CATEGORY)
    .slice(0, MAX_FOOTER_PRODUCTS);

  return (
    <footer id="contact" className="bg-forest-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 12-col on desktop so the brand and contact blocks get more room than
            the three link lists, which stay narrow. */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* brand */}
          <div className="lg:col-span-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="FindMyRobo home">
              <Image
                src="/main-logo-dark.png"
                alt="FindMyRobo"
                width={1200}
                height={320}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/50">
              {t("copyright")}
            </p>
            {socialLinks.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {socialLinks.map(({ platform, label, Icon, href }) => (
                  <li key={platform}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-200 hover:border-accent hover:text-accent-300"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* products — the only list here with real destinations; the rest
              stay "#" until their pages exist. */}
          <nav aria-label={t("productsTitle")} className="lg:col-span-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
              {t("productsTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {footerProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-block py-0.5 text-sm text-white/70 transition-colors hover:text-accent-300"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="inline-block py-0.5 text-sm font-semibold text-accent-300/80 transition-colors hover:text-accent-300"
                >
                  {t("viewAll")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* support and service — hidden while every entry in SUPPORT_HREFS
              is still null. See that list for what each one is waiting on. */}
          {supportLinks.length > 0 && (
            <nav aria-label={t("supportTitle")} className="lg:col-span-2">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
                {t("supportTitle")}
              </h3>
              <ul className="mt-5 space-y-3">
                {supportLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="inline-block py-0.5 text-sm text-white/70 transition-colors hover:text-accent-300"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* about */}
          <nav aria-label={t("aboutTitle")} className="lg:col-span-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
              {t("aboutTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {about.map((item, index) => (
                <li key={item}>
                  <Link
                    href={ABOUT_HREFS[index] ?? "#"}
                    className="inline-block py-0.5 text-sm text-white/70 transition-colors hover:text-accent-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact — this block is the #contact anchor the nav links to, and
              the visible business address Omise's merchant review and PDPA's
              data-controller notice both expect to find. */}
          <section
            aria-labelledby="footer-contact-heading"
            className={contactSpan}
          >
            <h3
              id="footer-contact-heading"
              className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-300"
            >
              {t("contactTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2.5 py-0.5 transition-colors hover:text-accent-300"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent-300/70" aria-hidden="true" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2.5 break-all py-0.5 transition-colors hover:text-accent-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent-300/70" aria-hidden="true" />
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={salesMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-2.5 py-0.5 leading-relaxed transition-colors hover:text-accent-300"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-300/70" aria-hidden="true" />
                  <address className="not-italic">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* payment row — visual placeholders only, Omise integration comes in Phase 2 */}
        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">{t("paymentNote")}</p>
          <ul className="flex flex-wrap gap-2.5">
            {payments.map((p) => (
              <li
                key={p}
                className="rounded-md border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/70"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
