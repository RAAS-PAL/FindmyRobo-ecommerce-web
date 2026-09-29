/**
 * Site-wide settings that need a code change and a deploy to alter.
 *
 * Content that marketing edits (hero videos, homepage copy, the video gallery,
 * phone/LINE/socials, the About page, SEO text) moved to the admin panel's
 * Content section — see data/siteContent.ts for its types and defaults. What
 * stays here is either a business switch (showPrices), or a legal fact that
 * has to match the company registration (address, legal name).
 */
export const siteConfig = {
  /**
   * Customer-facing price visibility.
   *
   * false = quotation mode: no price is rendered anywhere a customer can see.
   * Prices are still read from the catalogue, still priced server-side at
   * checkout, and still shown to sales in the alert email and the admin panel —
   * they are the starting point for the quotation, not a published offer.
   *
   * Set back to true when card payment goes live and the site sells directly.
   */
  showPrices: false,

  /**
   * Whether visitors can build a list in the cart and go through /checkout.
   *
   * false = every "add" button opens the quote form instead, with the product
   * already selected, and the navbar's cart icon opens that form too. /checkout
   * redirects home. The cart code is all still here — set this back to true
   * (and showPrices, and the Omise keys) when the site sells online.
   */
  cartEnabled: false,

  /**
   * The registered company contact. Phone, LINE and socials are edited in
   * Admin → Content (data/siteContent.ts); these stay in code because they are
   * legal and operational facts, not marketing copy.
   *
   * email — the fallback recipient for new-order alerts when SALES_ALERT_EMAIL
   * is unset (lib/email.ts), and the default public email before Content is
   * first saved.
   */
  salesContact: {
    email: "sales@raaspal.com",
    /**
     * Registered office. Rendered on /contact-sales and in the footer.
     * This is not decoration: a visible business address is what Omise's
     * merchant review looks for, and PDPA requires the data controller to be
     * reachable. Keep it in sync with the company registration document.
     */
    addressLines: [
      "99/40 Software Park Building Moo 4,",
      "Chaengwattana rd., Khlong Kluea, Pak Kret, Nonthaburi Thailand 11120",
    ],
    /**
     * The same address, split into the fields schema.org's PostalAddress
     * wants — Google reads structure, not prose. This is the source for the
     * Organization structured data (lib/structuredData.ts). If the office
     * moves, change BOTH this and addressLines above; they are one address
     * written two ways.
     */
    postalAddress: {
      streetAddress: "99/40 Software Park Building Moo 4, Chaengwattana Rd., Khlong Kluea",
      addressLocality: "Pak Kret",
      addressRegion: "Nonthaburi",
      postalCode: "11120",
      addressCountry: "TH",
    },
    /**
     * How Google Maps finds the office: the company's own Google Business
     * listing, by its name there. The street address alone matches several
     * "Software Park" places (one of them streets away), while the listing
     * lands on the named pin with directions and reviews. Update it if the
     * listing is renamed.
     */
    mapsPlace: "บริษัท ราส พอล จำกัด (RAAS PAL : Robot As A Service)",
  },

  /**
   * The company behind the site, for the Organization structured data and the
   * legal disclosures. Trading name and legal entity differ on purpose: Google
   * shows `name` in the brand panel; `legalName` is what appears on the DBD
   * certificate (source: docs/legal-pages-information.xlsx, rows 1–2).
   */
  organization: {
    name: "FindMyRobo",
    legalName: "Raas Pal Company Limited",
    legalNameTh: "ราส พอล จำกัด",
    /** Logo for search results — the light-background variant, on white. */
    logo: "/main-logo-light.png",
  },
};

const mapsQuery = encodeURIComponent(siteConfig.salesContact.mapsPlace);

/** The office on Google Maps — every "open in Maps" link uses this one place. */
export const salesMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

/** Turn-by-turn directions to the office from wherever the visitor is. */
export const salesDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

/** The same place as an embeddable map (no API key needed), labelled in the page's language. */
export const salesMapEmbedUrl = (locale: string) =>
  `https://maps.google.com/maps?q=${mapsQuery}&hl=${locale}&z=16&output=embed`;
