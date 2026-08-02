import RobotIllustration from "@/components/ui/RobotIllustration";
import type { Product } from "@/data/products";

/**
 * The product's visual: its photo when set (admin panel), otherwise the
 * stylized SVG illustration for its `variant`. With `preferHome`, the home-page
 * photo (`homeImage`) is used when available — the same image the home feature
 * card shows — falling back to `imageUrl`.
 *
 * Plain <img> rather than next/image: admin-entered URLs can point at any
 * host, and next/image would reject hosts missing from remotePatterns.
 */
export default function ProductVisual({
  product,
  className,
  preferHome = false,
}: {
  product: Pick<Product, "name" | "variant" | "imageUrl" | "homeImage">;
  className?: string;
  /** Prefer the home-page photo (homeImage) over imageUrl when available. */
  preferHome?: boolean;
}) {
  const src = preferHome ? product.homeImage ?? product.imageUrl : product.imageUrl;
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
