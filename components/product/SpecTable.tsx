import type { Locale, SpecGroup } from "@/data/products";

/**
 * Detailed grouped specification table (admin page builder). Bilingual via
 * the record itself.
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

  // A plain two-column table: the group names as small headings, each row a
  // label and its value divided by hairlines. No coloured band.
  return (
    <section>
      <h2 className="font-display text-title text-content">{heading}</h2>
      <p className="mt-2 text-body text-ink-muted">{productName}</p>
      <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-2">
        {groups.map((group, gi) => (
          <div key={gi}>
            <h3 className="text-heading text-content">{pick(group.title)}</h3>
            <dl className="mt-3 border-b border-forest-100">
              {group.rows.map((row, ri) => (
                <div
                  key={ri}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5 border-t border-forest-100 py-3"
                >
                  <dt className="text-small text-ink-muted">{pick(row.label)}</dt>
                  <dd className="text-small font-medium text-content">{pick(row.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
