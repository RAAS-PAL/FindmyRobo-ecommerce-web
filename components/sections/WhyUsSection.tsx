"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Home, MessagesSquare, RefreshCcw } from "lucide-react";

export default function WhyUsSection() {
  const t = useTranslations("whyUs");
  const features = [
    { Icon: RefreshCcw, title: t("f1Title"), body: t("f1Body") },
    { Icon: MessagesSquare, title: t("f2Title"), body: t("f2Body") },
    { Icon: Home, title: t("f3Title"), body: t("f3Body") },
  ];
  return (
    <section id="support" className="relative overflow-hidden bg-navy-950 py-20 text-white sm:py-28">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[720px] -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
            {t("heading")}
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-2xl border border-navy-700/50 bg-navy-800/40 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-navy-800/70 hover:shadow-[0_24px_48px_-20px_rgba(245,200,66,0.15)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-navy-950">
                <Icon className="h-6.5 w-6.5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
