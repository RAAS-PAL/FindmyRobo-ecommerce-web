export type RobotVariant = "luba" | "mini" | "pool";

export interface Product {
  id: string;
  name: string;
  price: number;
  variant: RobotVariant;
  tagline: string;
  preorder?: boolean;
}

export const products: Product[] = [
  {
    id: "luba-3-awd-5000",
    name: "MAMMOTION LUBA 3 AWD 5000",
    price: 185000,
    variant: "luba",
    tagline: "Flagship AWD mower for estates up to 5,000 m²",
    preorder: true,
  },
  {
    id: "luba-3-awd-3000",
    name: "MAMMOTION LUBA 3 AWD 3000",
    price: 159000,
    variant: "luba",
    tagline: "All-wheel drive precision for large Thai gardens",
  },
  {
    id: "luba-3-awd-1500",
    name: "MAMMOTION LUBA 3 AWD 1500",
    price: 125000,
    variant: "luba",
    tagline: "Slope-conquering power for mid-size lawns",
    preorder: true,
  },
  {
    id: "luba-mini-awd-1500",
    name: "LUBA Mini AWD 1500",
    price: 99000,
    variant: "mini",
    tagline: "Compact AWD agility for tighter spaces",
  },
  {
    id: "luba-mini-awd-800",
    name: "LUBA Mini AWD 800",
    price: 79000,
    variant: "mini",
    tagline: "The effortless choice for city gardens",
  },
  {
    id: "spino-e1-pool",
    name: "Spino E1 Pool Cleaner",
    price: 45000,
    variant: "pool",
    tagline: "Crystal-clear pools without lifting a finger",
  },
];

export const formatBaht = (price: number) => `฿${price.toLocaleString("en-US")}`;
