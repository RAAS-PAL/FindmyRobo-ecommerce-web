import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import FactsRow from "@/components/ui/FactsRow";
import PromiseList from "@/components/ui/PromiseList";
import { canOptimise } from "@/lib/media";

/**
 * The homepage's one section about the company (replaces "Who we are" and
 * "Why choose us"): the heading and a line beside a real photo, the facts,
 * then the promises. Everything comes from the CMS, already in the page's
 * language.
 */
export default function ServicePromise({
  heading,
  body,
  photo,
  photoAlt,
  facts,
  promises,
}: {
  heading: string;
  body: string;
  photo?: string | null;
  photoAlt: string;
  facts: { value: string; label: string }[];
  promises: { title: string; body: string }[];
}) {
  return (
    <section id="support" className="bg-cloud py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeader title={heading} lead={body} />
          {photo && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-forest-100">
              {canOptimise(photo) ? (
                <Image src={photo} alt={photoAlt} fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- a CMS URL on any host
                <img src={photo} alt={photoAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
          )}
        </div>
        <FactsRow facts={facts} className="mt-12" />
        <PromiseList items={promises} className="mt-12" />
      </div>
    </section>
  );
}
