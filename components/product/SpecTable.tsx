import type { Locale, SpecGroup } from "@/data/products";

/**
 * Detailed grouped specification table (admin page builder), styled after the
 * reference: gold "Product Specifications" band, grey group header rows, then
 * label/value rows. Bilingual via the record itself.
 */
export default function SpecTable({
  groups,
  heading,
  productName,
  locale,
}: {
  groups: SpecGroup[];
  heading: string;
  productName: string;
  locale: Locale;
}) {
  const pick = (t: { en: string; th: string }) => t[locale] || t.en;

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
        {productName}
      </h2>
      <div className="mt-8 overflow-hidden rounded-2xl border border-forest-100">
        <p className="bg-gold px-5 py-3 text-center text-[13.5px] font-bold text-forest-950">
          {heading}
        </p>
        <dl>
          {groups.map((group, gi) => (
            <div key={gi}>
              <p className="border-t border-forest-100 bg-cloud px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-content">
                {pick(group.title)}
              </p>
              {group.rows.map((row, ri) => (
                <div
                  key={ri}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 border-t border-forest-100/60 bg-surface px-5 py-3"
                >
                  <dt className="text-[13px] font-semibold text-content">{pick(row.label)}</dt>
                  <dd className="text-[13px] leading-relaxed text-ink-muted">
                    {pick(row.value)}
                  </dd>
                </div>
              ))}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
