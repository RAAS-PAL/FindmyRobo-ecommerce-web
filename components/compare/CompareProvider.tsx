"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { Product } from "@/data/products";
import { SERVICE_CATEGORY } from "@/data/products";
import { useProducts } from "@/components/ProductsProvider";

const STORAGE_KEY = "raaspal-compare";

/** PRD #30: comparison is minimum 2, maximum 3 robots. */
export const COMPARE_MAX = 3;
export const COMPARE_MIN = 2;

type CompareAction =
  | { type: "toggle"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; ids: string[] };

function compareReducer(state: string[], action: CompareAction): string[] {
  switch (action.type) {
    case "toggle":
      if (state.includes(action.id)) return state.filter((v) => v !== action.id);
      if (state.length >= COMPARE_MAX) return state;
      return [...state, action.id];
    case "clear":
      return [];
    case "hydrate":
      return action.ids;
  }
}

interface CompareContextValue {
  /** Selected robots, resolved against the live catalog (never services). */
  robots: Product[];
  ids: string[];
  count: number;
  /** True when another robot can still be added. */
  canAdd: boolean;
  /** True once enough robots are selected to compare (>= 2). */
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

/**
 * Site-wide comparison selection (PRD #30). Holds up to three robot ids,
 * persisted across visits; services are never comparable. Mirrors CartProvider:
 * starts empty on the server, hydrates from localStorage after mount so SSR
 * markup never mismatches, and re-validates every id against the live catalog
 * so a removed or hidden robot silently drops out.
 */
export default function CompareProvider({ children }: { children: React.ReactNode }) {
  const { getProduct } = useProducts();
  const [ids, dispatch] = useReducer(compareReducer, []);
  const hydrated = useRef(false);

  const isComparable = (id: string) => {
    const product = getProduct(id);
    return !!product && product.category !== SERVICE_CATEGORY;
  };

  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "null"
      );
      if (Array.isArray(raw)) {
        const clean = [...new Set(raw.filter((v): v is string => typeof v === "string"))]
          .filter(isComparable)
          .slice(0, COMPARE_MAX);
        if (clean.length > 0) dispatch({ type: "hydrate", ids: clean });
      }
    } catch {
      // corrupt storage — start fresh
    }
    hydrated.current = true;
    // hydration runs once; getProduct identity is stable per catalog load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable — selection still works in-memory
    }
  }, [ids]);

  const value = useMemo<CompareContextValue>(() => {
    const robots = ids.flatMap((id) => {
      const product = getProduct(id);
      return product && product.category !== SERVICE_CATEGORY ? [product] : [];
    });
    return {
      robots,
      ids: robots.map((p) => p.id),
      count: robots.length,
      canAdd: robots.length < COMPARE_MAX,
      ready: robots.length >= COMPARE_MIN,
      has: (id) => robots.some((p) => p.id === id),
      toggle: (id) => {
        // only real, non-service catalog entries may enter the selection
        if (ids.includes(id) || isComparable(id)) dispatch({ type: "toggle", id });
      },
      clear: () => dispatch({ type: "clear" }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, getProduct]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within <CompareProvider>");
  }
  return ctx;
}
