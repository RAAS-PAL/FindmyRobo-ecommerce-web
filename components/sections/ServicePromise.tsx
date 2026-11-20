import FactsRow from "@/components/ui/FactsRow";
import PromiseList from "@/components/ui/PromiseList";

/**
 * The homepage's one section about the company: the heading and a line on
 * the left, a real photo running to the edge of the screen on the right
 * (not in a rounded box), then the facts and the promises. Everything comes
 * from the CMS, already in the page's language; facts and promises are the
 * About page's.
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
    <section id="support" className="bg-cloud">
      <div className="grid lg:grid-cols-2">
        <div className="px-4 py-16 sm:px-6 lg:py-28 lg:pr-16 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <h2 className="max-w-xl font-display text-display text-content">{heading}</h2>
          <p className="mt-6 max-w-xl text-lead text-ink-muted">{body}</p>
        </div>
        {photo && (
          <div className="relative min-h-[22rem] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- a CMS URL on any host */}
            <img src={photo} alt={photoAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <FactsRow facts={facts} className="border-t-0" />
        <PromiseList items={promises} className="mt-10" />
      </div>
    </section>
  );
}
