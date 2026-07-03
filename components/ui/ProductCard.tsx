"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import RobotIllustration from "@/components/ui/RobotIllustration";
import { formatBaht, type Product } from "@/data/products";

export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-[0_24px_48px_-16px_rgba(13,27,75,0.25)] sm:w-[300px]"
    >
      {/* image area */}
      <div className="relative overflow-hidden bg-gradient-to-b from-cloud to-navy-100/40 pb-4 pt-8">
        {product.preorder && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-navy-950 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
            Preorder
          </span>
        )}
        <RobotIllustration
          variant={product.variant}
          className="mx-auto h-40 w-auto transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* view product — slides up on hover / focus */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
          <button
            type="button"
            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 bg-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            View Product
            <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* details */}
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-display text-[15px] font-bold leading-snug text-navy">
          {product.name}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted">{product.tagline}</p>
        <p className="mt-auto pt-3 font-mono text-lg font-semibold tabular-nums text-navy">
          {formatBaht(product.price)}
        </p>
      </div>
    </motion.article>
  );
}
