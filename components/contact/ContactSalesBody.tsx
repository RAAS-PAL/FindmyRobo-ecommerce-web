"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calendar, Mail, MapPin, MessageCircle, Phone, QrCode } from "lucide-react";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { useSiteContent } from "@/components/SiteContentProvider";
import { salesMapUrl, siteConfig } from "@/data/siteConfig";
import { pick } from "@/data/siteContent";

/**
 * The contact cards and LINE panel on /contact-sales. Phone, email and LINE are
 * edited in Admin → Content → Contact; the registered address stays in code
 * (data/siteConfig.ts). A client component so the editor's live preview can
 * swap in a draft.
 */
export default function ContactSalesBody() {
  const t = useTranslations("contactSales");
  const locale = useLocale();
  const contact = useSiteContent().contact;
  const { phone, email, lineId, lineUrl, lineQrImage } = contact;
  const phoneHours = pick(contact.phoneHours, locale);
  const { addressLines } = siteConfig.salesContact;

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
      {/* contact methods */}
      <FadeIn delay={0.08}>
        <div className="space-y-4">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center gap-5 rounded-2xl border border-forest-100 bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_16px_32px_-16px_rgba(10,46,31,0.25)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20">
              <Phone className="h-5 w-5 text-accent-600" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink-muted">
                {t("phoneLabel")}
              </span>
              <span className="block font-mono text-lg font-semibold text-content">
                {phone}
              </span>
              {phoneHours && (
                <span className="block text-[12px] text-ink-muted">{phoneHours}</span>
              )}
            </span>
          </a>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-5 rounded-2xl border border-forest-100 bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_16px_32px_-16px_rgba(10,46,31,0.25)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20">
              <Mail className="h-5 w-5 text-accent-600" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink-muted">
                {t("emailLabel")}
              </span>
              <span className="block truncate font-mono text-lg font-semibold text-content">
                {email}
              </span>
              <span className="block text-[12px] text-ink-muted">{t("emailHint")}</span>
            </span>
          </a>

          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 rounded-2xl border border-forest-100 bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_16px_32px_-16px_rgba(10,46,31,0.25)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#06C755]/15">
              <MessageCircle className="h-5 w-5 text-[#06C755]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink-muted">
                {t("lineLabel")}
              </span>
              <span className="block font-mono text-lg font-semibold text-content">
                {lineId}
              </span>
              <span className="block text-[12px] text-ink-muted">{t("lineHint")}</span>
            </span>
          </a>

          <a
            href={salesMapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-5 rounded-2xl border border-forest-100 bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_16px_32px_-16px_rgba(10,46,31,0.25)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20">
              <MapPin className="h-5 w-5 text-accent-600" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink-muted">
                {t("addressLabel")}
              </span>
              <span className="mt-0.5 block text-[14.5px] font-semibold leading-relaxed text-content">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-muted">
                {t("addressHint")}
              </span>
            </span>
          </a>

          <p className="flex flex-wrap items-baseline gap-x-2 pt-2 text-sm text-ink-muted">
            {t("demoNote")}
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1.5 font-semibold text-accent-600 transition-colors hover:text-content"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {t("demoCta")}
            </Link>
          </p>
        </div>
      </FadeIn>

      {/* LINE QR */}
      <FadeIn delay={0.14}>
        <div className="flex flex-col items-center rounded-3xl bg-forest-950 p-8 text-center sm:p-10">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-300">
            LINE
          </p>
          {/* bg-white, not bg-surface: this panel always sits on the dark
              forest-950 card, and a QR needs a light quiet zone around it
              to stay scannable — in dark mode `surface` is near-black. */}
          <div className="mt-6 flex h-56 w-56 items-center justify-center overflow-hidden rounded-2xl bg-white p-3">
            {lineQrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lineQrImage}
                alt={`LINE QR — ${lineId}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-forest-100 px-4">
                <QrCode className="h-10 w-10 text-forest-300" aria-hidden="true" />
                <span className="text-[12px] leading-relaxed text-ink-muted">
                  {t("qrComingSoon")}
                </span>
              </span>
            )}
          </div>
          <p className="mt-5 font-mono text-lg font-semibold text-accent-300">{lineId}</p>
          <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-white/60">
            {t("lineHint")}
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
