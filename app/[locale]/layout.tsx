import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Barlow, IBM_Plex_Mono, Noto_Sans_Thai, Prompt } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/siteUrl";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/MotionProvider";
import ProductsProvider from "@/components/ProductsProvider";
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import QuoteProvider from "@/components/quote/QuoteProvider";
import QuoteDrawer from "@/components/quote/QuoteDrawer";
import { siteConfig } from "@/data/siteConfig";
import CompareProvider from "@/components/compare/CompareProvider";
import FloatingCompareButton from "@/components/compare/FloatingCompareButton";
import SiteContentProvider from "@/components/SiteContentProvider";
import { getAllProducts } from "@/lib/productStore";
import { getSiteContent } from "@/lib/siteContentStore";
import { pick } from "@/data/siteContent";

// Barlow is not a variable font — list the weights the UI uses (body through
// the extrabold headings). Powers both --font-sans and --font-display.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* Thai script fallbacks — Barlow has no Thai glyphs */
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700", "800"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Site title, description and share image are edited in Admin → Content → SEO.
  const { seo } = await getSiteContent();
  const title = pick(seo.siteTitle, locale);
  const description = pick(seo.siteDescription, locale);

  return {
    // Without metadataBase, Next cannot turn the relative OG image path into
    // the absolute URL that LINE, Facebook, and Messenger require — link
    // previews render with no image at all.
    metadataBase: new URL(siteUrl),
    title,
    description,
    // No `alternates` and no `openGraph.url` here, deliberately. A layout only
    // knows the locale, not the route, so anything path-shaped it emits is
    // the homepage's value stamped onto every page beneath it — which is
    // exactly what used to happen: every product page declared itself a
    // duplicate of "/". Each page sets its own via pageAlternates() in
    // lib/seo.ts. A page that forgets gets no canonical (Google infers the
    // URL itself), never a wrong one.
    openGraph: {
      type: "website",
      siteName: "FindMyRobo",
      title,
      description,
      locale: locale === "th" ? "th_TH" : "en_US",
      images: [{ url: seo.shareImage, alt: "FindMyRobo" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.shareImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const [messages, products, content] = await Promise.all([
    getMessages(),
    getAllProducts(),
    getSiteContent(),
  ]);

  return (
    <html
      lang={locale}
      className={`${barlow.variable} ${plexMono.variable} ${prompt.variable} ${notoSansThai.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <ProductsProvider products={products}>
              <SiteContentProvider
                content={{
                  home: content.home,
                  contact: content.contact,
                  announcement: content.announcement,
                }}
              >
                <CartProvider>
                  <QuoteProvider>
                    <CompareProvider>
                      {/* AnnouncementBar is hidden in the 2026-09-30 redesign:
                          the page opens straight onto the navbar over the
                          hero (DJI-style), and HeroSection's full-screen
                          height assumes nothing above the bar. The component
                          and its CMS section (Admin → Content → Announcement
                          bar) are kept: re-import it and put
                          <AnnouncementBar /> back here to bring it back —
                          until then that CMS section has no effect. */}
                      <Navbar />
                      {children}
                      {/* Products are already loaded here for ProductsProvider —
                          passing them down avoids a second query per page render,
                          since getAllProducts is not cached. */}
                      <Footer products={products} />
                      {siteConfig.cartEnabled && <CartDrawer />}
                      <QuoteDrawer />
                      <FloatingCompareButton />
                    </CompareProvider>
                  </QuoteProvider>
                </CartProvider>
              </SiteContentProvider>
            </ProductsProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
