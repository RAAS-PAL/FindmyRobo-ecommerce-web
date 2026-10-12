"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  CalendarDays,
  ChevronDown,
  Handshake,
  Headset,
  LifeBuoy,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { categoryHref, navCategories, type CategorySlug } from "@/data/categories";
import { showsCondition } from "@/data/conditions";
import { siteConfig } from "@/data/siteConfig";
import { DEFAULT_BRAND, productLabel, type Product } from "@/data/products";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { useCart } from "@/components/cart/CartProvider";
import CartIcon from "@/components/cart/CartIcon";
import { useQuote } from "@/components/quote/QuoteProvider";
import { useProducts } from "@/components/ProductsProvider";
import ProductVisual from "@/components/ui/ProductVisual";
import ConditionLine from "@/components/ui/ConditionLine";
import CatalogSearch from "@/components/layout/CatalogSearch";

interface NavChild {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface NavGroup {
  heading: string;
  items: NavChild[];
}

/** One robot in a category's menu. */
interface MenuModel {
  key: string;
  name: string;
  /** Shown above the name for brands other than Mammotion. */
  brand?: string;
  href: string;
  product: Product;
}

interface NavItem {
  label: string;
  /** A product category: its tab opens a panel of its robots. */
  category?: CategorySlug;
  models?: MenuModel[];
  /** Otherwise a panel of link groups (the About menu). */
  groups?: NavGroup[];
  /** The page being viewed belongs to this section — the highlight rests on it. */
  current?: boolean;
}

/** Small uppercase label over a group of links. */
const groupHeadingClass =
  "font-mono text-[10.5px] font-semibold tracking-[0.2em] text-ink-muted uppercase [&:lang(th)]:tracking-[0.04em]";

/** Label over a group inside the blue panels. */
const panelLabelClass =
  "font-mono text-[10px] font-semibold tracking-[0.2em] text-[color:var(--nav-tab-faint)] uppercase [&:lang(th)]:tracking-[0.04em]";

/** The bar's colour, painted on the whole shape: the bar colour across the
 *  bar row only, and the panel colour below it. One background, so the shape
 *  can grow without clipping its children (the profile menu hangs out of
 *  it). Tokens: --nav-* in globals.css (white bar in light mode, navy in dark). */
const barBackground =
  "linear-gradient(var(--nav-bar), var(--nav-bar)) top left / 100% var(--nav-h) no-repeat, var(--nav-panel)";

/** Card shell shared by everything inside an open panel. */
const panelCardClass =
  "group relative flex overflow-hidden rounded-xl border border-forest-100 bg-[color:var(--nav-card)] transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_10px_24px_-14px_rgb(31_79_214/0.45)]";

/** A faint sky-blue light that rises in a panel card on hover. */
function CardGlow() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(79_184_255/0.16),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
  );
}

/** A category's robots as photo cards, then a card for the whole category. */
function CategoryPanel({
  category,
  models,
  onNavigate,
}: {
  category: CategorySlug;
  models: MenuModel[];
  onNavigate: () => void;
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("categories");
  // Up to four cards a row, rows as even as possible: 6 cards make 3 + 3,
  // not 4 + 2; a single robot gets a wide card beside "view all".
  const cards = models.length + 1;
  const rows = Math.ceil(cards / 4);
  const cols = Math.ceil(cards / rows);
  // "View all" stretches over any empty slots left in the last row.
  const spare = rows * cols - cards;

  return (
    <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {models.map((model) => (
        <li key={model.key}>
          <Link href={model.href} onClick={onNavigate} className={`${panelCardClass} h-[172px] flex-col p-3`}>
            <CardGlow />
            <span className="relative flex min-h-0 flex-1 items-center justify-center">
              <ProductVisual
                product={model.product}
                className="h-full max-h-[108px] w-full drop-shadow-[0_10px_12px_rgb(10_26_74/0.18)] transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </span>
            <span className="relative mt-2 block text-center">
              {model.brand && <span className={`block ${panelLabelClass} text-[9.5px]`}>{model.brand}</span>}
              <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-content">{model.name}</span>
            </span>
          </Link>
        </li>
      ))}
      <li style={spare > 0 ? { gridColumn: `span ${spare + 1}` } : undefined}>
        <Link
          href={categoryHref(category)}
          onClick={onNavigate}
          className={`${panelCardClass} h-[172px] flex-col justify-between p-4`}
        >
          <CardGlow />
          <span className="relative">
            <span className="block font-display text-[15px] leading-tight font-bold text-content">
              {tc(`${category}.name`)}
            </span>
            <span className="mt-1.5 line-clamp-3 block text-[11.5px] leading-relaxed text-[color:var(--nav-tab-muted)]">
              {tc(`${category}.description`)}
            </span>
          </span>
          <span className="relative inline-flex items-center gap-1 text-[12px] font-semibold text-accent-600 underline-offset-4 group-hover:underline">
            {t("viewAll")}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </Link>
      </li>
    </ul>
  );
}

/** The About menu: its link groups side by side, one card each. */
function GroupsPanel({ groups, onNavigate }: { groups: NavGroup[]; onNavigate: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {groups.map((group) => (
        <div key={group.heading} className="rounded-xl border border-forest-100 bg-[color:var(--nav-card)] p-2">
          <p className={`px-2 pt-1.5 pb-2 ${panelLabelClass}`}>{group.heading}</p>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className="group/item flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold text-content transition-colors hover:bg-cloud hover:text-accent-600"
              >
                {Icon && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600 transition-colors group-hover/item:bg-accent group-hover/item:text-white">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Search, opened from the bar's search button: the field, its suggestions in
 *  the panel itself (not floating over the bar), and the categories as
 *  shortcuts, on the pale panel. */
function SearchPanel({
  categories,
  onNavigate,
}: {
  categories: { slug: CategorySlug; label: string }[];
  onNavigate: () => void;
}) {
  const t = useTranslations("nav");
  return (
    <div>
      <CatalogSearch
        className="block"
        inputClassName="h-11 w-full rounded-xl border border-forest-100 bg-[color:var(--nav-card)] pl-10 pr-4 text-[14px] text-content placeholder:text-[color:var(--nav-tab-faint)] transition-colors focus:border-accent focus:outline-none"
        dropdownClassName="static! mt-3 w-full shadow-none!"
        onNavigate={onNavigate}
      />
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className={`mr-1 ${panelLabelClass}`}>{t("productsHeading")}</span>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(category.slug)}
            onClick={onNavigate}
            className="rounded-full border border-forest-100 bg-[color:var(--nav-card)] px-3 py-1 text-[12px] font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent-600"
          >
            {category.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("categories");
  const { products } = useProducts();
  const { count, openDrawer } = useCart();
  const { openQuote } = useQuote();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // The desktop menus: which one is open, and which one the panel shows. The
  // second outlives the first, so a closing panel keeps its content while it
  // shrinks away instead of going blank first.
  const [desktopMenu, setDesktopMenu] = useState<number | null>(null);
  const [shownMenu, setShownMenu] = useState<number | null>(null);
  const menuOpen = desktopMenu !== null;

  // Hover opens a menu after a short pause (sweeping across the bar shouldn't
  // fling it open) and closes it on a short delay (so the pointer can brush
  // past the edge). Once a menu is open, moving between tabs is instant.
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const showMenu = (index: number) => {
    clearTimers();
    setDesktopMenu(index);
    setShownMenu(index);
  };
  // The search panel is only opened and closed on purpose (click, Esc, a
  // click outside): hover never swaps it away or shuts it mid-typing.
  const hoverMenu = (index: number) => {
    if (searchOpen) return;
    clearTimers();
    if (menuOpen) showMenu(index);
    else openTimer.current = setTimeout(() => showMenu(index), 90);
  };
  const scheduleCloseMenu = () => {
    if (searchOpen) return;
    clearTimers();
    closeTimer.current = setTimeout(() => setDesktopMenu(null), 220);
  };
  const closeMenu = () => {
    clearTimers();
    setDesktopMenu(null);
  };
  useEffect(() => clearTimers, []);

  // index into navLinks open in the phone drawer; all start closed
  const [expanded, setExpanded] = useState<number | null>(null);

  const pathname = usePathname();

  // Which section the page belongs to: a category page, or a product's page
  // (by that product's category). The About menu also holds the contact
  // pages — the demo booking lives under /products but is listed there.
  const viewedProduct = pathname.startsWith("/products/")
    ? products.find((product) => pathname === `/products/${product.id}`)
    : undefined;
  const currentCategory = pathname.startsWith("/shop/")
    ? pathname.split("/")[2]
    : viewedProduct?.category;
  const inAbout =
    pathname === "/about" ||
    pathname === "/contact-sales" ||
    pathname === "/location" ||
    pathname === "/recommend" ||
    pathname.startsWith("/products/request-a-demo");

  // A category's robots: the products shown on the storefront (hidden ones,
  // e.g. robots still waiting for photos, are not in `products`).
  const modelsFor = (slug: CategorySlug): MenuModel[] =>
    products
      .filter((product) => product.category === slug)
      .map((product) => ({
        key: product.id,
        name: product.name,
        ...(product.brand && product.brand !== DEFAULT_BRAND ? { brand: product.brand } : {}),
        href: `/products/${product.id}`,
        product,
      }));

  /* One tab per navbar category (data/categories.ts), then About, which also
     holds contact and support: all eight did not fit on one line in Thai. */
  // A category with nothing on show yet has no tab (it comes back by itself
  // once a robot in it is switched on in Admin).
  const navLinks: NavItem[] = [
    ...navCategories
      .map((category) => ({
        label: tc(`${category.slug}.nav`),
        category: category.slug,
        models: modelsFor(category.slug),
        current: currentCategory === category.slug,
      }))
      .filter((link) => link.models.length > 0),
    {
      label: t("about"),
      current: inAbout,
      groups: [
        {
          heading: t("groupChoose"),
          items: [{ label: t("finder"), href: "/recommend", icon: Compass }],
        },
        {
          heading: t("groupCompany"),
          items: [
            // The full page first; the two below are still homepage anchors.
            { label: t("aboutUs"), href: "/about", icon: Building2 },
            { label: t("aboutStory"), href: "/#about", icon: BookOpen },
            { label: t("aboutPartners"), href: "/#about", icon: Handshake },
          ],
        },
        {
          heading: t("groupContact"),
          items: [
            { label: t("contactSales"), href: "/contact-sales", icon: Headset },
            { label: t("contactTouch"), href: "/#contact", icon: MessageCircle },
            { label: t("contactDemo"), href: "/products/request-a-demo", icon: CalendarDays },
            { label: t("contactLocations"), href: "/location", icon: MapPin },
            { label: t("support"), href: "/#support", icon: LifeBuoy },
          ],
        },
      ],
    },
  ];
  // The search button sits after the menus, and its panel takes the next index.
  const searchIndex = navLinks.length;
  const searchOpen = desktopMenu === searchIndex;
  const searchCategories = navLinks.flatMap((link) =>
    link.category ? [{ slug: link.category, label: link.label }] : []
  );

  // The bar casts a deeper shadow once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* On the homepage the hero has its own way into the quote form (the quote
     strip, marked data-hero-quote). While it is on screen the bar's Get a
     quote folds away — one way in at a time — and it comes back once the
     strip has scrolled up under the bar. Starts hidden on the homepage, so
     the server HTML doesn't flash the button. */
  const [heroQuoteInView, setHeroQuoteInView] = useState(true);
  useEffect(() => {
    const strip = document.querySelector("[data-hero-quote]");
    if (!strip) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroQuoteInView(entry.isIntersecting),
      // the bar covers the top of the screen: under it counts as gone
      { rootMargin: `-${document.querySelector("header")?.offsetHeight ?? 60}px 0px 0px 0px` }
    );
    observer.observe(strip);
    return () => observer.disconnect();
  }, [pathname]);
  const hideBarQuote = pathname === "/" && heroQuoteInView;

  // A new page starts with the menus closed (reset while rendering, React's
  // pattern for state that follows a changing value).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setDesktopMenu(null);
  }

  /* An open menu's panel grows out of the bar. Its content is measured (it
     changes between menus, and with the language) and the panel's height
     springs to it — framer can't spring to "auto" when only the content
     changes. */
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = useState(0);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => setPanelH(panel.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  // Clicking anywhere outside the bar closes an open menu (the search panel
  // stays open otherwise, and a menu opened by click shouldn't need the
  // pointer to leave).
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  });

  // Opening search puts the cursor straight in the field.
  useEffect(() => {
    if (searchOpen) panelRef.current?.querySelector("input")?.focus();
  }, [searchOpen]);

  /* The highlight behind the tabs follows the pointer or keyboard focus, sits
     on the open menu's tab, and otherwise rests on the current section. One
     element with a shared layoutId, so it slides from tab to tab. */
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pointed, setPointed] = useState<number | null>(null);
  const currentIndex = navLinks.findIndex((link) => link.current);
  const highlighted = pointed ?? desktopMenu ?? (currentIndex >= 0 ? currentIndex : null);
  const shownLink = shownMenu === null ? undefined : navLinks[shownMenu];

  const highlight = (index: number, strong: boolean) =>
    highlighted === index && (
      <motion.span
        layoutId="nav-highlight"
        aria-hidden="true"
        transition={{ type: "spring", stiffness: 500, damping: 38 }}
        className={`absolute inset-0 rounded-lg ${strong ? "bg-[color:var(--nav-highlight)]" : "bg-[color:var(--nav-highlight)]/60"}`}
      />
    );

  return (
    <>
    <header
      // Everything lives in one blue bar that hangs from the top edge; the
      // header around it is see-through and lets clicks through its edges.
      // Its height is fixed to the bar's, so an open panel spills over the
      // page instead of pushing the page down.
      className="pointer-events-none sticky top-0 z-50 h-[var(--nav-h)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={barRef}
          // `nav-scope` re-points the colour tokens, so everything inside that
          // uses them (language switch, profile menu, search) reads in navy on
          // the light blue, and the dropdowns open pale.
          className={`nav-scope pointer-events-auto relative rounded-b-2xl text-content transition-shadow duration-300 ${
            scrolled
              ? "shadow-[0_18px_40px_-16px_rgb(10_26_74/0.4)] dark:shadow-[0_18px_40px_-14px_rgb(0_0_0/0.7)]"
              : "shadow-[0_14px_32px_-18px_rgb(10_26_74/0.35)] dark:shadow-[0_14px_32px_-16px_rgb(0_0_0/0.6)]"
          }`}
          style={{ background: barBackground }}
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
          }}
          onMouseLeave={() => {
            setPointed(null);
            scheduleCloseMenu();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setPointed(null);
              closeMenu();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && desktopMenu !== null) {
              triggerRefs.current[desktopMenu]?.focus();
              closeMenu();
            }
          }}
        >
          {/* inward-curved corners join the bar to the top edge */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -left-[18px] text-[color:var(--nav-bar)]"
          >
            <path d="M 20 20 L 20 0 L 0 0 C 11.046 0 20 11.046 20 20 Z" fill="currentColor" />
          </svg>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -right-[18px] text-[color:var(--nav-bar)]"
          >
            <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" fill="currentColor" />
          </svg>

          {/* the bar: logo · menus and search · language, account, quote */}
          <div className="flex h-[var(--nav-h)] items-center gap-3 pr-2.5 pl-4 sm:pl-5">
            <Link
              href="/"
              aria-label="FindMyRobo home"
              // the full-colour logo; its white version on the navy dark bar
              className="flex shrink-0 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <Image
                src="/main-logo-light.png"
                alt="FindMyRobo"
                width={1200}
                height={320}
                priority
                className="h-9 w-auto dark:hidden"
              />
              <Image
                src="/main-logo-dark.png"
                alt=""
                width={1200}
                height={320}
                priority
                className="hidden h-9 w-auto dark:block"
              />
            </Link>

            {/* menus and search, from xl (below that they're in the drawer) */}
            <ul
              className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex"
              onMouseLeave={() => setPointed(null)}
            >
              {navLinks.map((link, linkIndex) => {
                const isOpen = desktopMenu === linkIndex;
                const lit = link.current || isOpen || pointed === linkIndex;
                return (
                  <li key={link.label}>
                    <button
                      ref={(el) => {
                        triggerRefs.current[linkIndex] = el;
                      }}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls="nav-panel"
                      onMouseEnter={() => {
                        setPointed(linkIndex);
                        hoverMenu(linkIndex);
                      }}
                      onFocus={() => setPointed(linkIndex)}
                      onClick={() => (isOpen ? closeMenu() : showMenu(linkIndex))}
                      className={`relative flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap [&:lang(th)]:px-2 [&:lang(th)]:text-[12.5px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent ${
                        lit ? "text-[color:var(--nav-navy)]" : "text-[color:var(--nav-ink)] hover:text-[color:var(--nav-navy)]"
                      }`}
                    >
                      {highlight(linkIndex, isOpen || pointed === linkIndex)}
                      {/* the current section: a blue dot (the bar's one accent, with Get a quote) */}
                      {link.current && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent"
                        />
                      )}
                      <span className="relative">{link.label}</span>
                      {link.groups && (
                        <ChevronDown
                          className={`relative h-3.5 w-3.5 opacity-80 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
              <li aria-hidden="true" className="mx-1.5 h-4 w-px bg-[color:var(--nav-line)]" />
              <li>
                <button
                  ref={(el) => {
                    triggerRefs.current[searchIndex] = el;
                  }}
                  type="button"
                  aria-expanded={searchOpen}
                  aria-controls="nav-panel"
                  aria-label={t("searchPlaceholder")}
                  onMouseEnter={() => setPointed(searchIndex)}
                  onFocus={() => setPointed(searchIndex)}
                  onClick={() => (searchOpen ? closeMenu() : showMenu(searchIndex))}
                  className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent ${
                    searchOpen || pointed === searchIndex ? "text-[color:var(--nav-navy)]" : "text-[color:var(--nav-ink)]"
                  }`}
                >
                  {highlight(searchIndex, true)}
                  {searchOpen ? (
                    <X className="relative h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Search className="relative h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            </ul>

            {/* language, account, the call to action, and (below xl) the
                menu button */}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 xl:ml-0">
              <span aria-hidden="true" className="mr-1 hidden h-4 w-px bg-[color:var(--nav-line)] xl:block" />
              <LanguageSwitcher className="hidden md:flex" />
              <ProfileMenu />

              {siteConfig.cartEnabled ? (
                <button
                  type="button"
                  onClick={openDrawer}
                  aria-label={t(
                    siteConfig.showPrices ? "cartLabel" : "quotationLabel",
                    { count }
                  )}
                  className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-content transition-colors hover:bg-cloud"
                >
                  <CartIcon className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 font-mono text-[10px] font-bold text-on-accent">
                      {count}
                    </span>
                  )}
                </button>
              ) : (
                // Cart switched off: the same spot opens the quote form — the
                // site's one call to action, and the bar's one blue fill; an
                // arrow nudges on hover; a blue square with the icon on phones.
                // Folds away (width and fade) while the hero's quote strip is
                // on screen; the grid column animates from 0fr to 1fr.
                <div
                  className={`grid transition-[grid-template-columns,opacity,margin] duration-300 ease-out motion-reduce:transition-none ${
                    hideBarQuote ? "ml-0 grid-cols-[0fr] opacity-0" : "ml-1 grid-cols-[1fr] opacity-100"
                  }`}
                  inert={hideBarQuote ? true : undefined}
                  aria-hidden={hideBarQuote ? true : undefined}
                >
                <div className="-my-2 min-w-0 overflow-hidden py-2">
                <button
                  type="button"
                  onClick={() => openQuote()}
                  className="group flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-accent px-2.5 text-[13px] font-bold whitespace-nowrap text-on-accent shadow-[0_6px_16px_-8px_rgb(var(--accent-rgb)/0.8)] transition-all duration-300 hover:bg-accent-strong hover:shadow-[0_8px_22px_-6px_rgb(var(--accent-rgb)/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97] motion-reduce:transition-none sm:px-4"
                >
                  <CartIcon className="h-[18px] w-[18px] shrink-0 sm:hidden" />
                  <span className="max-sm:sr-only">{t("getQuote")}</span>
                  <ArrowRight
                    className="hidden h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none sm:block"
                    aria-hidden="true"
                  />
                </button>
                </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t("openMenu")}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[color:var(--nav-line)] text-[color:var(--nav-navy)] transition-colors hover:bg-cloud xl:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* the open menu's panel, growing out of the bar; measured for its
              height, out of the tab order and hidden from screen readers
              while shut */}
          <motion.div
            initial={false}
            animate={{ height: menuOpen ? panelH : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="overflow-hidden rounded-b-2xl"
          >
            <div ref={panelRef} id="nav-panel" inert={!menuOpen} aria-hidden={!menuOpen}>
              {shownMenu !== null && (
                <motion.div
                  key={shownMenu}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: menuOpen ? 1 : 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-forest-100 px-4 py-4"
                >
                  <div className="mx-auto max-w-[920px]">
                    {shownMenu === searchIndex ? (
                      <SearchPanel categories={searchCategories} onNavigate={closeMenu} />
                    ) : shownLink?.category && shownLink.models ? (
                      <CategoryPanel
                        category={shownLink.category}
                        models={shownLink.models}
                        onNavigate={closeMenu}
                      />
                    ) : shownLink?.groups ? (
                      <GroupsPanel groups={shownLink.groups} onNavigate={closeMenu} />
                    ) : null}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </header>

      {/* drawer (below xl): the bar's colour on top, the panel colour below —
          rendered OUTSIDE <header>,
          whose sticky positioning would otherwise be the containing block for
          these position:fixed elements. `nav-scope` re-points the colour
          tokens, so the search, language switch and condition labels inside
          match the bar. */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-[#0a1a4a]/45 backdrop-blur-sm xl:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="nav-scope fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-[color:var(--nav-panel)] text-content shadow-2xl xl:hidden"
              role="dialog"
              aria-label="Menu"
            >
              <div
                className="flex items-center justify-between border-b border-forest-100 bg-[color:var(--nav-bar)] px-5 py-4"
              >
                <Image
                  src="/main-logo-light.png"
                  alt="FindMyRobo"
                  width={1200}
                  height={320}
                  className="h-9 w-auto dark:hidden"
                />
                <Image
                  src="/main-logo-dark.png"
                  alt=""
                  width={1200}
                  height={320}
                  className="hidden h-9 w-auto dark:block"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("closeMenu")}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[color:var(--nav-navy)] hover:bg-cloud"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <CatalogSearch
                  className="mb-6 block"
                  inputClassName="h-12 w-full rounded-full border border-forest-100 bg-[color:var(--nav-card)] pl-10 pr-4 text-sm text-content placeholder:text-[color:var(--nav-tab-faint)] focus:border-accent focus:outline-none"
                  dropdownClassName="inset-x-0 w-full"
                  onNavigate={() => setOpen(false)}
                />
                <p className={`mb-1 px-4 ${groupHeadingClass}`}>{t("productsHeading")}</p>
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.3 }}
                    >
                      {/* the categories, then a rule before About */}
                      {!link.category && <div className="mx-4 my-3 h-px bg-forest-100" aria-hidden="true" />}
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        aria-expanded={expanded === i}
                        className={`flex min-h-[48px] w-full cursor-pointer items-center justify-between rounded-xl px-4 text-left text-[15px] font-bold transition-colors hover:bg-cloud hover:text-accent-600 ${
                          link.current ? "text-accent-600" : "text-content"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {link.label}
                          {link.current && (
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full bg-accent"
                            />
                          )}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                            expanded === i ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mx-4 mb-2 border-l border-forest-100 pl-3">
                              {link.category && link.models ? (
                                <ul>
                                  {link.models.map((model) => (
                                    <li key={model.key}>
                                      <Link
                                        href={model.href}
                                        onClick={() => setOpen(false)}
                                        className="flex min-h-[44px] flex-col justify-center rounded-lg px-3 py-2 text-[14px] text-ink-muted transition-colors hover:bg-cloud hover:text-accent-600"
                                      >
                                        <span>{productLabel(model.product)}</span>
                                        {showsCondition(model.product.conditions) && (
                                          <ConditionLine conditions={model.product.conditions} />
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                  <li>
                                    <Link
                                      href={categoryHref(link.category)}
                                      onClick={() => setOpen(false)}
                                      className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold text-accent-600 transition-colors hover:bg-cloud"
                                    >
                                      {t("viewAll")}
                                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                  </li>
                                </ul>
                              ) : (
                                link.groups?.map((group) => (
                                  <div key={group.heading} className="pb-1">
                                    <p className={`px-3 pt-3 pb-1 ${groupHeadingClass}`}>{group.heading}</p>
                                    <ul>
                                      {group.items.map((item) => (
                                        <li key={item.label}>
                                          <Link
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className="flex min-h-[44px] items-center rounded-lg px-3 text-[14px] text-ink-muted transition-colors hover:bg-cloud hover:text-accent-600"
                                          >
                                            {item.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-3 border-t border-forest-100 pt-6">
                  <LanguageSwitcher variant="inline" />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
