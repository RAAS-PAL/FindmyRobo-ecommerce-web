import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { returnPolicy } from "@/data/returnPolicy";
import type { Locale } from "@/data/products";
import { pageAlternates } from "@/lib/seo";

/**
 * Return, Exchange, Claim & Refund policy — the published legal text.
 *
 * The body is rendered straight from data/returnPolicy.ts, which is a verbatim
 * transcription of the company's signed Thai document. Nothing on this page
 * rewords it.
 *
 * Thai is the only language the policy exists in, so the English route shows
 * the same Thai body beneath a notice saying Thai governs. Publishing a
 * machine translation of a binding policy would create a second, unreviewed
 * set of promises in a language the company never agreed to.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "refundPolicy" });
  return { title: t("metaTitle"), alternates: pageAlternates(locale, "/refund-policy") };
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("refundPolicy");
  const isThai = (locale as Locale) === "th";

  return (
    <main className="flex-1 bg-cloud">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-content sm:text-4xl">
            {isThai ? returnPolicy.title.th : returnPolicy.title.en}
          </h1>
          {/* On /en the Thai title still needs to appear: it is the heading of
              the document that actually binds, and a reader comparing the two
              should be able to see they are the same policy. */}
          {!isThai && (
            <p className="mt-2 text-[15px] font-medium text-ink-muted">
              {returnPolicy.title.th}
            </p>
          )}
        </FadeIn>

        {/* Language notice — English readers are told plainly that what follows
            is Thai and that Thai is the version with legal force. */}
        {!isThai && (
          <FadeIn delay={0.05}>
            <p className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-5 text-[14px] leading-relaxed text-content">
              {t("thaiOnlyNotice")}
            </p>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <p className="mt-8 text-[15px] leading-relaxed text-ink-muted">
            {returnPolicy.intro}
          </p>
        </FadeIn>

        <div className="mt-12 space-y-10">
          {returnPolicy.sections.map((section, i) => (
            <FadeIn key={section.heading} delay={Math.min(i, 6) * 0.03}>
              <section>
                <h2 className="font-display text-lg font-bold text-content sm:text-xl">
                  {section.heading}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.body.map((block, j) => {
                    if (block.type === "list") {
                      return (
                        /* No list-style marker: each item carries its own
                           number from the source document (1.1, 1.2 …), and a
                           browser-generated bullet beside "1.1" reads as a
                           numbering error. */
                        <ul key={j} className="space-y-2.5">
                          {block.items.map((item) => (
                            <li
                              key={item}
                              className="border-l-2 border-forest-100 pl-4 text-[15px] leading-relaxed text-ink-muted"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === "contact") {
                      return (
                        <p
                          key={j}
                          className="flex items-center gap-2.5 rounded-xl bg-surface px-4 py-3 text-[15px] font-semibold text-content"
                        >
                          <Phone
                            className="h-4 w-4 shrink-0 text-gold-600"
                            aria-hidden="true"
                          />
                          {block.text}
                        </p>
                      );
                    }

                    return (
                      <p
                        key={j}
                        className="text-[15px] leading-relaxed text-ink-muted"
                      >
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              </section>
            </FadeIn>
          ))}
        </div>
      </div>
    </main>
  );
}
