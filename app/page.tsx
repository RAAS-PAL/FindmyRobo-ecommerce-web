import HeroSection from "@/components/sections/HeroSection";
import ProductGrid from "@/components/sections/ProductGrid";
import TrustSection from "@/components/sections/TrustSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import PartnersSection from "@/components/sections/PartnersSection";
import NewsSection from "@/components/sections/NewsSection";
import YouTubeCTA from "@/components/sections/YouTubeCTA";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProductGrid />
      <TrustSection />
      <WhyUsSection />
      <PartnersSection />
      <NewsSection />
      <YouTubeCTA />
    </main>
  );
}
