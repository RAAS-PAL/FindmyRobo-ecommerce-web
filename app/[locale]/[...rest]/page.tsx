import { notFound } from "next/navigation";

/**
 * Any address under a language that no page matches: show the site's own
 * not-found page (app/[locale]/not-found.tsx) inside the layout, rather than
 * the framework's bare 404.
 */
export default function CatchAll() {
  notFound();
}
