"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function TrustSection() {
  const t = useTranslations("trust");
  const stats = [
    { value: 500, suffix: "+", label: t("stat1") },
    { value: 4.9, decimals: 1, suffix: "★", label: t("stat2") },
    { value: 10, suffix: "+", label: t("stat3") },
    { value: 30, suffix: "", label: t("stat4") },
  ];
  return (
    <section id="about" className="bg-cloud py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
            {t("heading")}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
            {t("body")}
          </p>
          <div className="mt-8 h-1 w-24 rounded-full bg-gold" aria-hidden="true" />
        </motion.div>

        {/* stats */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl bg-navy p-6 shadow-[0_16px_40px_-16px_rgba(13,27,75,0.4)] sm:p-8"
            >
              <AnimatedCounter
                to={stat.value}
                decimals={stat.decimals ?? 0}
                suffix={stat.suffix}
                className="font-mono text-3xl font-semibold tabular-nums text-gold sm:text-4xl"
              />
              <p className="mt-2 text-sm font-medium text-white/75">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
