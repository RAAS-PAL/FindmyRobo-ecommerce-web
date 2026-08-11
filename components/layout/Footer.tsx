import { useTranslations } from "next-intl";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/ui/BrandIcons";
import { salesMapUrl, siteConfig } from "@/data/siteConfig";
import { SERVICE_CATEGORY, type Product } from "@/data/products";

const payments = ["PromptPay", "Visa", "Mastercard", "Bank Transfer"];

/** Keeps the products column from running longer than the other three. */
const MAX_FOOTER_PRODUCTS = 8;

/**
 * Destinations for footer.about, positional — index 0 is the first label in the
 * translated array. Keep this in step with the `about` array in
 * messages/{en,th}.json; adding a label without a href here falls back to "#".
 */
const ABOUT_HREFS = ["/about", "/#contact", "/#support", "/shop"];

const socials = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "YouTube", Icon: YouTubeIcon },
  { label: "TikTok", Icon: TikTokIcon },
  { label: "LinkedIn", Icon: LinkedInIcon },
];

export default function Footer({ products = [] }: { products?: Product[] }) {
  const t = useTranslations("footer");
  const support = t.raw("support") as string[];
  const about = t.raw("about") as string[];
  const { phone, email, addressLines } = siteConfig.salesContact;

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
            <ul className="mt-6 flex gap-2">
              {socials.map(({ label, Icon }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-200 hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* products — the only list here with real destinations; the rest
              stay "#" until their pages exist. */}
          <nav aria-label={t("productsTitle")} className="lg:col-span-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("productsTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {footerProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-block py-0.5 text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="inline-block py-0.5 text-sm font-semibold text-gold/80 transition-colors hover:text-gold"
                >
                  {t("viewAll")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* support and service */}
          <nav aria-label={t("supportTitle")} className="lg:col-span-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("supportTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {support.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="inline-block py-0.5 text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* about */}
          <nav aria-label={t("aboutTitle")} className="lg:col-span-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("aboutTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {about.map((item, index) => (
                <li key={item}>
                  <Link
                    href={ABOUT_HREFS[index] ?? "#"}
                    className="inline-block py-0.5 text-sm text-white/70 transition-colors hover:text-gold"
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
          <section aria-labelledby="footer-contact-heading" className="lg:col-span-3">
            <h3
              id="footer-contact-heading"
              className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold"
            >
              {t("contactTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2.5 py-0.5 transition-colors hover:text-gold"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2.5 break-all py-0.5 transition-colors hover:text-gold"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={salesMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-2.5 py-0.5 leading-relaxed transition-colors hover:text-gold"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
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
