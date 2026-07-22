"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useCompare } from "@/components/compare/CompareProvider";
import ComparePanel from "@/components/compare/ComparePanel";

const POSITION_KEY = "raaspal-compare-fab";
const SIZE = 56; // button diameter (px)
const EDGE = 10; // gap kept from the screen edge when docked
const TOP_MIN = 78; // stay below the sticky navbar
const BOTTOM_GAP = 96; // stay above the floating add-to-cart bar / thumb zone

/** Stored dock: which edge + how far down the screen (ratio survives resizes). */
interface Dock {
  side: "left" | "right";
  yr: number;
}

const DEFAULT_DOCK: Dock = { side: "right", yr: 0.62 };

const clampY = (y: number) =>
  Math.min(Math.max(y, TOP_MIN), window.innerHeight - SIZE - BOTTOM_GAP);

const dockX = (side: Dock["side"]) =>
  side === "left" ? EDGE : window.innerWidth - SIZE - EDGE;

/** Restore the saved dock; safe on the server (returns the default untouched). */
function loadDock(): Dock {
  if (typeof window === "undefined") return DEFAULT_DOCK;
  try {
    const raw = JSON.parse(
      window.localStorage.getItem(POSITION_KEY) ?? "null"
    ) as Partial<Dock> | null;
    if (raw && (raw.side === "left" || raw.side === "right") && typeof raw.yr === "number") {
      return { side: raw.side, yr: Math.min(Math.max(raw.yr, 0), 1) };
    }
  } catch {
    // corrupt storage — use the default dock
  }
  return DEFAULT_DOCK;
}

// SSR renders nothing (position needs the viewport); this store flips to true
// on the client without any setState-in-effect.
const emptySubscribe = () => () => {};

/**
 * PRD #30 entry point — a floating compare launcher that behaves like iOS
 * AssistiveTouch: drag it anywhere, it springs to the nearest screen edge on
 * release, remembers its spot, and fades to half-opacity when idle. Tapping it
 * opens the robot picker (ComparePanel). Hidden during checkout so nothing
 * floats over the payment form.
 */
export default function FloatingCompareButton() {
  const t = useTranslations("compare");
  const pathname = usePathname();
  const { count } = useCompare();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [open, setOpen] = useState(false);
  const [dimmed, setDimmed] = useState(false);

  // Dock is resolved lazily at first client render — before the button first
  // paints — so it never flashes at (0,0). The motion values start from it;
  // later drags animate the values directly and store the new dock here.
  const [dock, setDock] = useState<Dock>(loadDock);
  const x = useMotionValue(typeof window === "undefined" ? 0 : dockX(dock.side));
  const y = useMotionValue(
    typeof window === "undefined" ? 0 : clampY(dock.yr * window.innerHeight)
  );

  const dimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);

  /** Restart the AssistiveTouch-style idle fade (called from event handlers). */
  const wake = () => {
    setDimmed(false);
    if (dimTimer.current) clearTimeout(dimTimer.current);
    dimTimer.current = setTimeout(() => setDimmed(true), 4000);
  };

  // Keep the button docked through resizes, and start the idle fade. Only
  // listener/timer setup here — the dim state changes inside callbacks.
  useEffect(() => {
    dimTimer.current = setTimeout(() => setDimmed(true), 4000);
    const onResize = () => {
      x.set(dockX(dock.side));
      y.set(clampY(dock.yr * window.innerHeight));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (dimTimer.current) clearTimeout(dimTimer.current);
    };
  }, [x, y, dock]);

  if (pathname.startsWith("/checkout")) return null;

  const snap = () => {
    dragging.current = false;
    const side: Dock["side"] =
      x.get() + SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
    const targetY = clampY(y.get());
    const next: Dock = { side, yr: targetY / window.innerHeight };
    setDock(next);
    animate(x, dockX(side), { type: "spring", stiffness: 420, damping: 32 });
    animate(y, targetY, { type: "spring", stiffness: 420, damping: 32 });
    try {
      window.localStorage.setItem(POSITION_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — position just won't persist
    }
    wake();
  };

  return (
    <>
      {mounted && !open && (
        <motion.button
          type="button"
          aria-label={t("floating.open")}
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => {
            dragging.current = true;
            wake();
          }}
          onDragEnd={snap}
          onTap={() => {
            // framer suppresses tap after a real drag; the ref guards the edge
            // case of a drag so small it still registers as a tap.
            if (!dragging.current) setOpen(true);
          }}
          onHoverStart={wake}
          onTouchStart={wake}
          style={{ x, y, width: SIZE, height: SIZE }}
          animate={{ opacity: dimmed ? 0.45 : 1, scale: dimmed ? 0.92 : 1 }}
          whileDrag={{ scale: 1.08, opacity: 1 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="fixed left-0 top-0 z-40 flex cursor-grab touch-none items-center justify-center rounded-full border border-forest-100 bg-surface/95 shadow-[0_10px_30px_-8px_rgba(10,46,31,0.45)] backdrop-blur-md active:cursor-grabbing"
        >
          {/* concentric AssistiveTouch-style face in brand colors */}
          <span className="pointer-events-none flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-forest-950">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </span>
          {count > 0 && (
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-forest-950 px-1 font-mono text-[10px] font-bold text-gold">
              {count}
            </span>
          )}
        </motion.button>
      )}

      <ComparePanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
