"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Calendar,
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

const navLinks: { label: string; href: string; dropdown?: string[] }[] = [
  {
    label: "Robot Mowers",
    href: "#products",
    dropdown: ["LUBA 3 AWD Series", "LUBA Mini Series", "Compare Mowers"],
  },
  { label: "Pool Cleaners", href: "#products" },
  { label: "RoboStore TV", href: "#youtube" },
  { label: "About", href: "#about", dropdown: ["Our Story", "Why Us", "Partners"] },
  { label: "Contact", href: "#contact", dropdown: ["Get in Touch", "Book a Demo", "Locations"] },
  { label: "Support", href: "#support" },
  { label: "Blog", href: "#news" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-navy-950/85 shadow-[0_8px_32px_-12px_rgba(7,15,46,0.6)] backdrop-blur-xl"
          : "border-transparent bg-navy-950"
      }`}
    >
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RoboStore TH home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-navy-950">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            RoboStore<span className="text-gold"> TH</span>
          </span>
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-6 xl:flex">
          {navLinks.map((link) => (
            <li key={link.label} className="group relative">
              <Link
                href={link.href}
                className="nav-underline flex items-center gap-1 py-2 text-[13.5px] font-medium text-white/85 transition-colors hover:text-white"
              >
                {link.label}
                {link.dropdown && (
                  <ChevronDown
                    className="h-3.5 w-3.5 text-gold transition-transform duration-200 group-hover:rotate-180"
                    aria-hidden="true"
                  />
                )}
              </Link>
              {link.dropdown && (
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="w-52 overflow-hidden rounded-xl border border-white/10 bg-navy-950/95 p-2 shadow-2xl backdrop-blur-xl">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item}
                        href={link.href}
                        className="block rounded-lg px-3 py-2.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-gold"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* right cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <label className="relative hidden lg:block">
            <span className="sr-only">Search products</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="What are you looking for?"
              className="h-11 w-48 rounded-full border border-white/15 bg-white/10 pl-10 pr-4 text-[13px] text-white placeholder:text-white/40 transition-all focus:w-60 focus:border-gold/60 focus:bg-white/15 focus:outline-none xl:w-52"
            />
          </label>

          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="hidden min-h-[44px] items-center gap-2 rounded-full bg-gold px-5 text-[13.5px] font-bold text-navy-950 shadow-[0_0_0_0_rgba(245,200,66,0)] transition-shadow duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] sm:flex"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Book a Free Demo
          </motion.a>

          <button
            type="button"
            aria-label="Shopping cart, 0 items"
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-gold"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-mono text-[10px] font-bold text-navy-950">
              0
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 xl:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm xl:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-navy-950 shadow-2xl xl:hidden"
              role="dialog"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-navy-950">
                    <Bot className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-base font-extrabold text-white">
                    RoboStore<span className="text-gold"> TH</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <label className="relative mb-6 block">
                  <span className="sr-only">Search products</span>
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="What are you looking for?"
                    className="h-12 w-full rounded-full border border-white/15 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-gold/60 focus:outline-none"
                  />
                </label>
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-[48px] items-center justify-between rounded-xl px-4 text-[15px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-gold"
                      >
                        {link.label}
                        {link.dropdown && (
                          <ChevronDown className="h-4 w-4 text-gold" aria-hidden="true" />
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/10 p-5">
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-navy-950"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Book a Free Demo
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
