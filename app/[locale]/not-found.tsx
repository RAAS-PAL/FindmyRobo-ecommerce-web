import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import TextLink from "@/components/ui/TextLink";

/**
 * A page that does not exist: inside the site (navbar and footer from the
 * layout), one line and two ways on. Replaces the framework's plain 404.
 */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="flex-1 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <EmptyState
          as="h1"
          title={t("title")}
          body={t("body")}
          action={
            <>
              <Button href="/shop">{t("shop")}</Button>
              <TextLink href="/">{t("home")}</TextLink>
            </>
          }
        />
      </div>
    </main>
  );
}
