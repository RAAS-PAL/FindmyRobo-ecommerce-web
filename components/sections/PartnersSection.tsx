"use client";

import { motion } from "framer-motion";

const partners = [
  {
    name: "MAMMOTION",
    wordmarkClass: "font-display text-3xl font-black tracking-tight text-navy sm:text-4xl",
    caption: "World's Number 1*",
    detail: "Wire-free Robotic Lawn Mower Brand",
    footnote: "*Source: Frost & Sullivan study released Dec 2025",
  },
  {
    name: "LYMOW",
    wordmarkClass: "font-display text-3xl font-black tracking-[0.35em] text-navy sm:text-4xl",
    caption: "World's first robotic mulching mower with tracks",
    detail: "Track-driven power for the toughest terrain",
    footnote: null,
  },
];

export default function PartnersSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
            Trusted Brands
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">
            Official Partners
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            Providing famous service and support for the best household robots
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.25 + i * 0.25 }}
              className="flex flex-col items-center rounded-2xl border border-navy-100 bg-white p-10 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_44px_-18px_rgba(13,27,75,0.2)]"
            >
              <div className="flex h-24 items-center">
                <span className={partner.wordmarkClass}>{partner.name}</span>
              </div>
              <p className="mt-4 font-display text-lg font-bold text-navy">{partner.caption}</p>
              <p className="mt-1.5 text-sm text-ink-muted">{partner.detail}</p>
              {partner.footnote && (
                <p className="mt-3 text-[11px] italic text-ink-muted/70">{partner.footnote}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
