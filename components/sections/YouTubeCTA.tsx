"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { YouTubeIcon } from "@/components/ui/BrandIcons";
import { siteConfig } from "@/data/siteConfig";

export default function YouTubeCTA() {
  const t = useTranslations("youtube");
  // Points at the channel, not youtube.com. Without an account configured the
  // whole section is pointless, so it hides rather than sending people to
  // YouTube's front page.
  const channelUrl = siteConfig.socials.youtube;
  if (!channelUrl) return null;
  return (
    <section
      id="youtube"
      className="relative overflow-hidden bg-gradient-to-br from-surface via-cloud to-[#f8f2e3] py-20 sm:py-28 dark:to-forest-900"
    >
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/[0.14] blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-red-500/[0.07] blur-[90px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-950 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.5)]">
          <Play className="h-7 w-7 fill-gold text-gold" aria-hidden="true" />
        </span>
        <h2 className="mt-7 font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
          {t("heading")}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {t("sub")}
        </p>
        <motion.a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-9 flex min-h-[52px] items-center gap-2.5 rounded-full bg-[#FF0000] px-8 text-[15px] font-bold text-white transition-shadow duration-300 hover:shadow-[0_0_36px_-6px_rgba(255,0,0,0.7)]"
        >
          <YouTubeIcon className="h-5 w-5" />
          {t("button")}
        </motion.a>
      </motion.div>
    </section>
  );
}
