import { ClipboardList, ShoppingCart } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

/**
 * The cart glyph, or a clipboard while the site sells by quotation.
 *
 * A shopping cart promises "buy now, pay at checkout" — exactly the mental
 * model quotation mode removes. A clipboard reads as "a list of items you have
 * selected", which is what the drawer actually holds.
 *
 * Centralised so the header, drawer, buttons, and empty states can never end
 * up showing two different metaphors at once.
 */
export default function CartIcon({ className }: { className?: string }) {
  const Icon = siteConfig.showPrices ? ShoppingCart : ClipboardList;
  return <Icon className={className} aria-hidden="true" />;
}
