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

const payments = ["PromptPay", "Visa", "Mastercard", "Bank Transfer"];

const socials = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "YouTube", Icon: YouTubeIcon },
  { label: "TikTok", Icon: TikTokIcon },
  { label: "LinkedIn", Icon: LinkedInIcon },
];

export default function Footer() {
  const t = useTranslations("footer");
  const policies = t.raw("policies") as string[];
  const about = t.raw("about") as string[];
  const { phone, email, addressLines } = siteConfig.salesContact;

  return (
    <footer id="contact" className="bg-forest-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label="FindMyRobo home">
              <Image
                src="/logo-r-gold.png"
                alt="FindMyRobo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-display text-xl font-extrabold tracking-tight">
                FindMy<span className="text-gold">Robo</span>
              </span>
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

          {/* policies */}
          <nav aria-label={t("policiesTitle")}>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("policiesTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {policies.map((item) => (
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
          <nav aria-label={t("aboutTitle")}>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t("aboutTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {about.map((item) => (
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

          {/* contact — this block is the #contact anchor the nav links to, and
              the visible business address Omise's merchant review and PDPA's
              data-controller notice both expect to find. */}
          <section aria-labelledby="footer-contact-heading">
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
