"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/data/products";

interface ProductsContextValue {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

/**
 * Serves the product catalog (read server-side from the product store) to
 * client components — cart lookups, product grids, etc. Keeping the lookup
 * here means client code never bundles a stale build-time product snapshot.
 */
export default function ProductsProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      getProduct: (id) => products.find((p) => p.id === id),
    }),
    [products]
  );
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProducts must be used within <ProductsProvider>");
  }
  return ctx;
}
