import type { CategorySlug } from "@/data/categories";

/** Visual style for the placeholder SVG illustration only — not the category. */
export type RobotVariant = "luba" | "mini" | "pool";

/**
 * Spec keys map to translated labels in messages (productDetail.specLabels.*).
 * Values are display-ready strings (SI units, same in both locales).
 * PLACEHOLDER values based on public Mammotion/Spino specs — replace with
 * confirmed data from suppliers before launch.
 */
export type SpecKey =
  | "area"
  | "slope"
  | "cuttingWidth"
  | "runtime"
  | "connectivity"
  | "filtration";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: CategorySlug;
  variant: RobotVariant;
  preorder?: boolean;
  specs: Partial<Record<SpecKey, string>>;
}

export const products: Product[] = [
  {
    id: "luba-3-awd-5000",
    name: "MAMMOTION LUBA 3 AWD 5000",
    price: 185000,
    category: "robot-mowers",
    variant: "luba",
    preorder: true,
    specs: {
      area: "5,000 m²",
      slope: "80% (38°)",
      cuttingWidth: "400 mm",
      runtime: "180 min",
      connectivity: "RTK + Vision, 4G, Wi-Fi",
    },
  },
  {
    id: "luba-3-awd-3000",
    name: "MAMMOTION LUBA 3 AWD 3000",
    price: 159000,
    category: "robot-mowers",
    variant: "luba",
    specs: {
      area: "3,000 m²",
      slope: "80% (38°)",
      cuttingWidth: "400 mm",
      runtime: "180 min",
      connectivity: "RTK + Vision, 4G, Wi-Fi",
    },
  },
  {
    id: "luba-3-awd-1500",
    name: "MAMMOTION LUBA 3 AWD 1500",
    price: 125000,
    category: "robot-mowers",
    variant: "luba",
    preorder: true,
    specs: {
      area: "1,500 m²",
      slope: "80% (38°)",
      cuttingWidth: "400 mm",
      runtime: "160 min",
      connectivity: "RTK + Vision, Wi-Fi",
    },
  },
  {
    id: "luba-mini-awd-1500",
    name: "LUBA Mini AWD 1500",
    price: 99000,
    category: "robot-mowers",
    variant: "mini",
    specs: {
      area: "1,500 m²",
      slope: "80% (38°)",
      cuttingWidth: "210 mm",
      runtime: "150 min",
      connectivity: "RTK + Vision, Wi-Fi",
    },
  },
  {
    id: "luba-mini-awd-800",
    name: "LUBA Mini AWD 800",
    price: 79000,
    category: "robot-mowers",
    variant: "mini",
    specs: {
      area: "800 m²",
      slope: "65% (33°)",
      cuttingWidth: "210 mm",
      runtime: "120 min",
      connectivity: "RTK + Vision, Wi-Fi",
    },
  },
  {
    id: "spino-e1-pool",
    name: "Spino E1 Pool Cleaner",
    price: 45000,
    category: "pool-cleaners",
    variant: "pool",
    specs: {
      area: "80 m² pool",
      runtime: "150 min",
      filtration: "180 µm",
      connectivity: "App control, Bluetooth",
    },
  },
];

export const getProduct = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const getProductsByCategory = (category: CategorySlug): Product[] =>
  products.filter((p) => p.category === category);

export const formatBaht = (price: number) => `฿${price.toLocaleString("en-US")}`;
