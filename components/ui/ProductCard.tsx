"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import RobotIllustration from "@/components/ui/RobotIllustration";
import { formatBaht, type Locale, type Product } from "@/data/products";

export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const t = useTranslations("products");
  const tc = useTranslations("categories");
  const locale = useLocale() as Locale;
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-[280px] shrink-0 snap-start sm:w-[300px]"
    >
      <Link
        href={`/products/${product.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-[0_24px_48px_-16px_rgba(13,27,75,0.25)]"
      >
        {/* image area */}
        <div className="relative overflow-hidden bg-gradient-to-b from-cloud to-navy-100/40 pb-4 pt-8">
          {product.preorder && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-navy-950 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
              {t("preorder")}
            </span>
          )}
          <RobotIllustration
            variant={product.variant}
            className="mx-auto h-40 w-auto transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* view product — slides up on hover / focus */}
          <span className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
            <span className="flex min-h-[44px] w-full items-center justify-center gap-1.5 bg-navy py-3 text-sm font-semibold text-white">
              {t("viewProduct")}
              <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
            </span>
          </span>
        </div>

        {/* details */}
        <span className="flex flex-1 flex-col gap-1.5 p-5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600">
            {tc(`${product.category}.name`)}
          </span>
          <span className="font-display text-[15px] font-bold leading-snug text-navy">
            {product.name}
          </span>
          <span className="text-[13px] leading-relaxed text-ink-muted">
            {product.tagline[locale]}
          </span>
          <span className="mt-auto pt-3 font-mono text-lg font-semibold tabular-nums text-navy">
            {formatBaht(product.price)}
          </span>
        </span>
      </Link>
    </motion.article>
  );
}
