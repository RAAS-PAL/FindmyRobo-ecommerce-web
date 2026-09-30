"use client";

import { useLocale } from "next-intl";
import { useSiteContent } from "@/components/SiteContentProvider";
import { pick } from "@/data/siteContent";

/**
 * Messages come from Admin → Content → Announcement bar. A client component
 * so the editor's live preview can swap in a draft.
 */
export default function AnnouncementBar() {
  const locale = useLocale();
  const content = useSiteContent().announcement;
  const messages = content.messages.map((message) => pick(message, locale)).filter(Boolean);
  if (!content.enabled || messages.length === 0) return null;

  // The strip is repeated until it is comfortably wider than a desktop screen,
  // then the whole thing is doubled so the -50% marquee loop is seamless. With
  // one short message, three copies was not enough and the loop showed a gap.
  const repeats = Math.max(3, Math.ceil(6 / messages.length));
  const strip = Array.from({ length: repeats }, () => messages).flat();
  // globals.css runs the loop in 70s for the original six items; scaling it
  // keeps the reading speed the same however many messages there are.
  const duration = `${Math.round((70 * strip.length) / 6)}s`;
  return (
    <div
      className="overflow-hidden bg-accent text-on-accent"
      role="region"
      aria-label="Announcements"
    >
      <div className="animate-marquee flex w-max" style={{ animationDuration: duration }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {strip.map((msg, i) => (
              <span
                key={i}
                className="flex items-center whitespace-nowrap px-6 py-2 text-[12px] font-bold uppercase tracking-[0.14em]"
              >
                {msg}
                <span className="ml-12 inline-block h-1 w-1 rounded-full bg-forest/50" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
