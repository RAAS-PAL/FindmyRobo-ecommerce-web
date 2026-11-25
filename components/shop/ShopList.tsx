import { getTranslations } from "next-intl/server";
import RobotCard from "@/components/ui/RobotCard";
import ServiceRow from "@/components/ui/ServiceRow";
import SectionHeader from "@/components/ui/SectionHeader";
import { collapseInstallTiers, isInstallTier } from "@/lib/installTiers";
import { SERVICE_CATEGORY, productLabel, type Locale, type Product } from "@/data/products";

/**
 * What a shop page lists: the robots as one card grid, then the services
 * (installation, a demo at home) as plain rows under their own heading.
 * Either part is left out when it has nothing.
 */
export default async function ShopList({
  products,
  locale,
}: {
  products: Product[];
  locale: string;
}) {
  const t = await getTranslations("shop");
  const robots = products.filter((p) => p.category !== SERVICE_CATEGORY);
  const services = collapseInstallTiers(products.filter((p) => p.category === SERVICE_CATEGORY));
  const loc = locale as Locale;

  return (
    <>
      {robots.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {robots.map((product) => (
            <RobotCard key={product.id} product={product} headingAs="h2" dense />
          ))}
        </div>
      )}
      {services.length > 0 && (
        <section className={robots.length > 0 ? "mt-16 sm:mt-24" : ""}>
          {/* its own heading only under robots: on the Services page the page
              title already says "Services" */}
          {robots.length > 0 && <SectionHeader title={t("servicesHeading")} as="h2" />}
          <div className={`border-b border-forest-100 ${robots.length > 0 ? "mt-6" : ""}`}>
            {services.map((service) => {
              const install = isInstallTier(service);
              return (
                <ServiceRow
                  key={service.id}
                  href={`/products/${service.id}`}
                  name={install ? t("installCardName") : productLabel(service)}
                  line={install ? t("installCardTagline") : service.tagline[loc]}
                  action={t("serviceDetails")}
                />
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
