import { setRequestLocale } from "next-intl/server";
import HeroSection from "@/components/sections/HeroSection";
import ProductGrid from "@/components/sections/ProductGrid";
import FeatureShowcase from "@/components/sections/FeatureShowcase";
import TechAnatomy from "@/components/sections/TechAnatomy";
import VideoShowcase from "@/components/sections/VideoShowcase";
import TrustSection from "@/components/sections/TrustSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import NewsSection from "@/components/sections/NewsSection";
import YouTubeCTA from "@/components/sections/YouTubeCTA";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <HeroSection />
      <ProductGrid />
      <FeatureShowcase />
      <TechAnatomy />
      <VideoShowcase />
      <TrustSection />
      <WhyUsSection />
      <NewsSection />
      <YouTubeCTA />
    </main>
  );
}
