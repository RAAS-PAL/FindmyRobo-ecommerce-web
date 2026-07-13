import RobotIllustration from "@/components/ui/RobotIllustration";
import type { Product } from "@/data/products";

/**
 * The product's visual: its photo when `imageUrl` is set (admin panel),
 * otherwise the stylized SVG illustration for its `variant`.
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
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.name}
        className={`${className ?? ""} object-contain`}
        loading="lazy"
      />
    );
  }
  return <RobotIllustration variant={product.variant} className={className} />;
}
