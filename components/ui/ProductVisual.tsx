import RobotIllustration from "@/components/ui/RobotIllustration";
import type { Product } from "@/data/products";

/**
 * The product's visual: its photo when set (admin panel), otherwise the
 * stylized SVG illustration for its `variant`.
 *
 * Always `imageUrl` — the same image the product page's gallery opens on,
 * which is the transparent cutout render. The lifestyle photo (`homeImage`)
 * is deliberately not used here: these render small, on a tinted card, where
 * a full-bleed scene turns into an unreadable green rectangle.
 *
 * Plain <img> rather than next/image: admin-entered URLs can point at any
 * host, and next/image would reject hosts missing from remotePatterns.
 */
export default function ProductVisual({
  product,
  className,
}: {
  product: Pick<Product, "name" | "variant" | "imageUrl">;
  className?: string;
}) {
  const src = product.imageUrl;
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={product.name}
        className={`${className ?? ""} object-contain`}
        loading="lazy"
      />
    );
  }
  return <RobotIllustration variant={product.variant} className={className} />;
}
