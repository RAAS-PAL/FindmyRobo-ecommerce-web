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
}

/** Cart line enriched with the live product record — prices never go stale in storage. */
export interface CartLine extends CartItem {
  product: Product;
}

type CartAction =
  | { type: "add"; id: string; qty?: number }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const qty = action.qty ?? 1;
      const existing = state.find((item) => item.id === action.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...state, { id: action.id, qty }];
    }
    case "remove":
      return state.filter((item) => item.id !== action.id);
    case "setQty": {
      if (action.qty <= 0) {
        return state.filter((item) => item.id !== action.id);
      }
      return state.map((item) =>
        item.id === action.id ? { ...item, qty: action.qty } : item
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
  return raw.filter(
    (item): item is CartItem =>
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.qty === "number" &&
      item.qty > 0 &&
      getProduct(item.id) !== undefined
  );
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
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
      return product ? [{ ...item, product }] : [];
    });
    return {
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.qty * item.product.price, 0),
      add: (id, qty) => {
        dispatch({ type: "add", id, qty });
      },
      remove: (id) => dispatch({ type: "remove", id }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
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
