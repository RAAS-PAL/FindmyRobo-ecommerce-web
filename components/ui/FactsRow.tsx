/**
 * Two to four facts about the company, as they are: in the HTML from the
 * server, no counting up. Home and About read the same list (Admin → About →
 * stats), so the two pages can never disagree.
 */
export default function FactsRow({
  facts,
  className = "",
}: {
  facts: { value: string; label: string }[];
  className?: string;
}) {
  if (facts.length === 0) return null;
  return (
    <dl
      className={`grid grid-cols-2 gap-y-8 border-y border-forest-100 py-8 sm:divide-x sm:divide-forest-100 ${
        facts.length >= 4 ? "sm:grid-cols-4" : facts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }${className ? ` ${className}` : ""}`}
    >
      {facts.map((fact) => (
        <div key={`${fact.value}-${fact.label}`} className="flex flex-col-reverse sm:px-6 sm:first:pl-0">
          <dt className="mt-1 text-small text-ink-muted">{fact.label}</dt>
          <dd className="font-display text-title text-content tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
