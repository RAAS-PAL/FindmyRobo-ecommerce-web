"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Calendar,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { useSiteContent } from "@/components/SiteContentProvider";
import {
  salesDirectionsUrl,
  salesMapEmbedUrl,
  salesMapUrl,
  siteConfig,
} from "@/data/siteConfig";
import { pick } from "@/data/siteContent";

/**
 * /location: the office on a Google map, with the address, directions and the
 * ways to reach us before coming over. The map and links point at the
 * company's Google listing (siteConfig.salesContact.mapsPlace); phone, email
 * and LINE are edited in Admin → Content → Contact, like /contact-sales.
 */
export default function LocationBody() {
  const t = useTranslations("location");
  const locale = useLocale();
  const contact = useSiteContent().contact;
  const { phone, email, lineId, lineUrl } = contact;
  const phoneHours = pick(contact.phoneHours, locale);
  const { addressLines } = siteConfig.salesContact;
  const { name, legalName, legalNameTh } = siteConfig.organization;

  const reach = [
    {
      href: `tel:${phone.replace(/\s/g, "")}`,
      Icon: Phone,
      label: t("phoneLabel"),
      value: phone,
      hint: phoneHours,
    },
    { href: `mailto:${email}`, Icon: Mail, label: t("emailLabel"), value: email },
    { href: lineUrl, Icon: MessageCircle, label: t("lineLabel"), value: lineId, external: true },
  ];

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      <FadeIn delay={0.08}>
        <div className="h-full overflow-hidden rounded-3xl border border-forest-100 bg-surface shadow-[0_24px_48px_-28px_rgba(10,46,31,0.35)]">
          <iframe
            src={salesMapEmbedUrl(locale)}
            title={t("mapTitle")}
            className="block h-[360px] w-full border-0 sm:h-[460px] lg:h-full lg:min-h-[540px]"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.14}>
        <div className="flex h-full flex-col rounded-3xl border border-forest-100 bg-surface p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20">
              <MapPin className="h-5 w-5 text-accent-600" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-muted">{t("addressLabel")}</p>
              <p className="mt-1 font-display text-lg font-bold text-content">
                {name}
                <span className="block text-[13px] font-semibold text-ink-muted">
                  {locale === "th" ? `บริษัท ${legalNameTh}` : legalName}
                </span>
              </p>
              <address className="mt-2 text-[14.5px] leading-relaxed text-content not-italic">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <a
              href={salesDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_30px_-6px_rgb(var(--accent-rgb)/0.8)] active:scale-[0.98]"
            >
              <Navigation className="h-4.5 w-4.5" aria-hidden="true" />
              {t("directions")}
            </a>
            <a
              href={salesMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-forest-100 px-6 text-[15px] font-semibold text-content transition-colors duration-300 hover:border-accent hover:text-accent-600"
            >
              <ExternalLink className="h-4.5 w-4.5" aria-hidden="true" />
              {t("openMaps")}
            </a>
          </div>

          <ul className="mt-7 space-y-1 border-t border-forest-100 pt-5">
            {reach.map(({ href, Icon, label, value, hint, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-2.5 transition-colors hover:bg-cloud"
                >
                  <Icon className="h-4.5 w-4.5 shrink-0 text-accent-600" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-ink-muted">{label}</span>
                    <span className="block truncate font-mono text-[15px] font-semibold text-content">
                      {value}
                    </span>
                    {hint && <span className="block text-[12px] text-ink-muted">{hint}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* mt-auto: sits at the bottom when the card stretches to the map's height */}
          <div className="mt-auto pt-5">
            <p className="flex flex-wrap items-baseline gap-x-2 border-t border-forest-100 pt-5 text-sm text-ink-muted">
              {t("demoNote")}
              <Link
                href="/products/request-a-demo"
                className="inline-flex items-center gap-1.5 font-semibold text-accent-600 transition-colors hover:text-content"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t("demoCta")}
              </Link>
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
