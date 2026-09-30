import Image from "next/image";
import { Bot, ChefHat, ConciergeBell, Cpu, Sparkles, type LucideIcon } from "lucide-react";
import type { CategorySlug } from "@/data/categories";

const ICONS: Partial<Record<CategorySlug, LucideIcon>> = {
  "cleaning-robots": Sparkles,
  "smart-equipment": Cpu,
  "cooking-robots": ChefHat,
  "delivery-robots": ConciergeBell,
};

/**
 * The picture for a lineup model (data/lineup.ts): its photo once it has one,
 * until then a quiet tile with its category's icon. Decorative — the model's
 * name is always shown next to it — so it has no alt text of its own.
 * Fills its parent, which sets the size.
 */
export default function ModelTile({
  category,
  image,
  sizes = "200px",
  className = "",
}: {
  category: CategorySlug;
  image?: string;
  sizes?: string;
  className?: string;
}) {
  if (image) {
    return (
      <span className={`relative block ${className}`}>
        <Image src={image} alt="" fill sizes={sizes} className="object-contain" />
      </span>
    );
  }
  const Icon = ICONS[category] ?? Bot;
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-lg bg-[radial-gradient(circle_at_50%_58%,rgb(var(--accent-rgb)/0.14),transparent_68%)] text-content/30 ${className}`}
    >
      <Icon className="h-1/3 w-1/3" strokeWidth={1.25} />
    </span>
  );
}
