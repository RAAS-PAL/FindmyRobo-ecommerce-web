/**
 * Renders a schema.org JSON-LD block. Server component — no client bundle.
 *
 * The `<` escape matters: JSON.stringify does not escape "</script>", so a
 * product description containing that literal text would close the tag early
 * and let the rest execute as HTML. < is still valid JSON, so search
 * engines parse it unchanged.
 *
 * This is the pattern Next.js documents for JSON-LD. It is a data block, not
 * executable script, so React's "scripts inside components never run"
 * warning does not apply — nothing here is meant to run.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
