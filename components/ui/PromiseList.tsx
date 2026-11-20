/**
 * What a customer gets from buying here, as a plain two-column list: a title
 * and a line each, divided by hairlines. No icons, boxes or hover. The same
 * four on home and About (Admin → About → values).
 */
export default function PromiseList({
  items,
  className = "",
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={`grid gap-x-12 sm:grid-cols-2${className ? ` ${className}` : ""}`}>
      {items.map((item) => (
        <li key={item.title} className="border-t border-forest-100 py-5">
          <h3 className="text-body font-semibold text-content">{item.title}</h3>
          <p className="mt-1 text-small text-ink-muted">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
