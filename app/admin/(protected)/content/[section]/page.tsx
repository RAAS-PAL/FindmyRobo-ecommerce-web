import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { getAdminLocale } from "@/lib/adminLocale";
import { getAllProductsForAdmin } from "@/lib/productStore";
import { metaDescription } from "@/lib/seo";
import { getSectionState } from "@/lib/siteContentStore";
import { CONTENT_SECTIONS, isContentSection, type SiteContent } from "@/data/siteContent";
import AboutEditor from "@/components/admin/content/AboutEditor";
import AnnouncementEditor from "@/components/admin/content/AnnouncementEditor";
import ContactEditor from "@/components/admin/content/ContactEditor";
import HomeEditor from "@/components/admin/content/HomeEditor";
import SeoEditor, { type SeoProduct } from "@/components/admin/content/SeoEditor";

export const dynamic = "force-dynamic";

/**
 * Admin → Content. Open to admins and the marketing role (the parent layout
 * lets both in; products and orders sit behind the (admin-only) layout).
 */
export default async function ContentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isContentSection(section)) notFound();

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.content" });
  const state = await getSectionState(section);
  const meta = { updatedAt: state.updatedAt, revisions: state.revisions, ready: state.ready };
  const content = state.content as SiteContent[typeof section];

  let editor: React.ReactNode;
  switch (section) {
    case "home":
      editor = <HomeEditor initial={content as SiteContent["home"]} meta={meta} />;
      break;
    case "announcement":
      editor = <AnnouncementEditor initial={content as SiteContent["announcement"]} meta={meta} />;
      break;
    case "about":
      editor = <AboutEditor initial={content as SiteContent["about"]} meta={meta} />;
      break;
    case "contact":
      editor = <ContactEditor initial={content as SiteContent["contact"]} meta={meta} />;
      break;
    case "seo": {
      // Hidden products are listed too: their text can be prepared before
      // they go live. Service add-ons are left in — they have pages as well.
      const products: SeoProduct[] = (await getAllProductsForAdmin()).map((p) => ({
        id: p.id,
        name: p.name,
        hidden: p.visible === false,
        autoDescription: {
          en: metaDescription(p.description.en),
          th: metaDescription(p.description.th ?? p.description.en),
        },
      }));
      editor = <SeoEditor initial={content as SiteContent["seo"]} meta={meta} products={products} />;
      break;
    }
  }

  return (
    <>
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
          {t("page.eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content">
          {t("page.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">{t("page.intro")}</p>
      </div>

      {!state.ready && (
        <div
          role="alert"
          className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-[13px] leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">{t("page.setupTitle")}</p>
            <p className="mt-1">{t("page.setupBody")}</p>
          </div>
        </div>
      )}

      <nav
        aria-label={t("page.sectionsLabel")}
        className="mt-8 flex gap-2 overflow-x-auto pb-1"
      >
        {CONTENT_SECTIONS.map((key) => (
          <Link
            key={key}
            href={`/admin/content/${key}`}
            aria-current={key === section ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
              key === section
                ? "border-gold bg-gold/15 text-content"
                : "border-forest-100 bg-surface text-ink-muted hover:border-gold hover:text-content"
            }`}
          >
            {t(`sections.${key}.label`)}
          </Link>
        ))}
      </nav>
      <p className="mb-6 mt-3 text-[12.5px] text-ink-muted">{t(`sections.${section}.description`)}</p>

      {editor}
    </>
  );
}
