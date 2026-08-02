import type { BoxItem, Locale } from "@/data/products";

/**
 * "What's in the box" grid, rendered after the specification table. Uses plain
 * <img> (like ProductPageBlocks) so admin-pasted image URLs from any host work
 * without next/image remote-domain config. Content is edited in the admin page
 * builder (see components/admin/PageBuilder.tsx) and stored on product.page.
 */
export default function BoxContents({
  items,
  heading,
  locale,
}: {
  items: BoxItem[];
  heading: string;
  locale: Locale;
}) {
  const pick = (t: { en: string; th: string }) => t[locale] || t.en;

  return (
    <section className="mx-auto max-w-5xl">
      <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
        {heading}
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-cloud p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={pick(item.name)}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-4 text-[15px] font-bold leading-snug text-content">
              {pick(item.name)}
            </p>
            <p className="mt-1 font-mono text-[13.5px] text-ink-muted">× {item.qty ?? 1}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
