"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { Product } from "@/data/products";
import { useProducts } from "@/components/ProductsProvider";

const STORAGE_KEY = "raaspal-cart";

export interface CartItem {
  id: string;
  qty: number;
  /** For service products: the robot product id this service is meant for. */
  forId?: string;
}

/**
 * Cart line enriched with the live product record — prices never go stale in
 * storage. `key` uniquely identifies a line: the same service bought for two
 * different robots is two separate lines, so operations key off it, not `id`.
 */
export interface CartLine extends CartItem {
  key: string;
  product: Product;
  /** The robot a service line is attached to, if still in the catalog. */
  forProduct?: Product;
}

/** Stable identity for a cart line — a service+robot pair is distinct per robot. */
const lineKey = (item: CartItem) =>
  item.forId ? `${item.id}__for__${item.forId}` : item.id;

type CartAction =
  | { type: "add"; id: string; qty: number; forId?: string }
  | { type: "remove"; key: string }
  | { type: "setQty"; key: string; qty: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const existing = state.find(
        (item) => item.id === action.id && item.forId === action.forId
      );
      if (existing) {
        return state.map((item) =>
          item === existing ? { ...item, qty: item.qty + action.qty } : item
        );
      }
      const next: CartItem = { id: action.id, qty: action.qty };
      if (action.forId) next.forId = action.forId;
      return [...state, next];
    }
    case "remove":
      return state.filter((item) => lineKey(item) !== action.key);
    case "setQty": {
      if (action.qty <= 0) {
        return state.filter((item) => lineKey(item) !== action.key);
      }
      return state.map((item) =>
        lineKey(item) === action.key ? { ...item, qty: action.qty } : item
      );
    }
    case "clear":
      return [];
    case "hydrate":
      return action.items;
  }
}

/** Keep only entries that still match a real product — catalog may change between visits. */
function sanitize(raw: unknown, getProduct: (id: string) => Product | undefined): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): CartItem[] => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.id !== "string" ||
      typeof item.qty !== "number" ||
      item.qty <= 0 ||
      getProduct(item.id) === undefined
    ) {
      return [];
    }
    const clean: CartItem = { id: item.id, qty: item.qty };
    // keep the robot association only if that robot still exists
    if (typeof item.forId === "string" && getProduct(item.forId)) {
      clean.forId = item.forId;
    }
    return [clean];
  });
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number, forId?: string) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { getProduct } = useProducts();
  // Start empty on both server and client, then hydrate from localStorage
  // after mount so SSR markup never mismatches.
  const [rawItems, dispatch] = useReducer(cartReducer, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "hydrate", items: sanitize(JSON.parse(stored), getProduct) });
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rawItems));
    } catch {
      // storage unavailable (private mode / quota) — cart still works in-memory
    }
  }, [rawItems]);

  const value = useMemo<CartContextValue>(() => {
    const items = rawItems.flatMap<CartLine>((item) => {
      const product = getProduct(item.id);
      if (!product) return [];
      const forProduct = item.forId ? getProduct(item.forId) : undefined;
      return [{ ...item, key: lineKey(item), product, forProduct }];
    });
    return {
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.qty * item.product.price, 0),
      add: (id, qty = 1, forId) => {
        dispatch({ type: "add", id, qty, forId });
      },
      remove: (key) => dispatch({ type: "remove", key }),
      setQty: (key, qty) => dispatch({ type: "setQty", key, qty }),
      clear: () => dispatch({ type: "clear" }),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [rawItems, drawerOpen, getProduct]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return ctx;
}
