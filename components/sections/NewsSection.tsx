"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Bot } from "lucide-react";

const banners = [
  "from-forest to-forest-700",
  "from-forest-800 to-forest",
  "from-forest-950 to-forest-800",
  "from-forest-700 to-forest-950",
];

interface NewsItem {
  date: string;
  title: string;
  excerpt: string;
}

export default function NewsSection() {
  const t = useTranslations("news");
  const articles = (t.raw("items") as NewsItem[]).map((item, i) => ({
    ...item,
    banner: banners[i % banners.length],
  }));

  return (
    <section id="news" className="bg-cloud py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-forest sm:text-5xl">
              {t("heading")}
            </h2>
            <p className="mt-3 text-base text-ink-muted">{t("sub")}</p>
          </div>
          <a
            href="#"
            className="group flex min-h-[44px] items-center gap-2 font-semibold text-forest transition-colors hover:text-gold-600"
          >
            {t("viewMore")}
            <ArrowRight
              className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </motion.div>
      </div>

      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-6 pt-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {articles.map((article, i) => (
          <motion.article
            key={article.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            className="group w-[300px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-forest-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-18px_rgba(10,46,31,0.25)] sm:w-[320px]"
          >
            {/* banner placeholder */}
            <div
              className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${article.banner}`}
            >
              <Bot
                className="h-12 w-12 text-gold/40 transition-transform duration-500 group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="absolute bottom-3 left-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                {article.date}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-[17px] font-bold leading-snug text-forest transition-colors group-hover:text-forest-800">
                {article.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
