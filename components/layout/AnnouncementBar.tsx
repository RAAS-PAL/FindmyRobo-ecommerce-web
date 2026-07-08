import { useTranslations } from "next-intl";

export default function AnnouncementBar() {
  const t = useTranslations("announcement");
  const messages = [t("msg1"), t("msg2")];
  // Content duplicated once so the -50% marquee loop is seamless
  const strip = [...messages, ...messages, ...messages];
  return (
    <div className="overflow-hidden bg-gold text-forest" role="region" aria-label="Announcements">
      <div className="animate-marquee flex w-max">
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
