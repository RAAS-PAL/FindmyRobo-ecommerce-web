import type { GlobalConfig } from "payload";
import { signedIn } from "../access";
import { revalidateSite } from "../hooks";
import { bilingual, image, L } from "../fields";

/**
 * Search and share text. Not a visual page, so no Live Preview — the
 * SeoPreview field below shows the Google result and the LINE/Facebook card
 * instead.
 */
export const Seo: GlobalConfig = {
  slug: "seo",
  label: L("SEO", "SEO"),
  admin: {
    group: L("Pages", "หน้าเว็บ"),
    description: L(
      "What Google and link previews on LINE and Facebook show for the site and each product.",
      "สิ่งที่ Google และตัวอย่างลิงก์ใน LINE และ Facebook แสดง ทั้งของเว็บไซต์และสินค้าแต่ละรายการ"
    ),
  },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: L("Whole site", "ทั้งเว็บไซต์"),
          description: L(
            "The homepage title in Google, and the fallback for any page without its own. Google shows about 60 characters of a title and 160 of a description.",
            "ชื่อหน้าแรกใน Google และใช้แทนในหน้าที่ไม่มีข้อมูลของตัวเอง Google แสดงชื่อประมาณ 60 ตัวอักษร และคำอธิบายประมาณ 160 ตัวอักษร"
          ),
          fields: [
            bilingual("siteTitle", { label: L("Title", "ชื่อ (Title)"), required: true, maxLength: 120 }),
            bilingual("siteDescription", {
              label: L("Description", "คำอธิบาย (Description)"),
              required: true,
              multiline: true,
              maxLength: 320,
            }),
            image("shareImage", L("Share image", "รูปสำหรับแชร์"), {
              required: true,
              description: L(
                "Shown when a page without its own photo is shared on LINE or Facebook. 1200 × 630 works best.",
                "แสดงเมื่อแชร์หน้าที่ไม่มีรูปของตัวเอง ขนาด 1200 × 630 จะดีที่สุด"
              ),
            }),
            {
              name: "sitePreview",
              type: "ui",
              admin: { components: { Field: "@/payload/components/SeoPreview#SiteSeoPreview" } },
            },
          ],
        },
        {
          label: L("Products", "สินค้า"),
          description: L(
            "Each product already gets a title and snippet from its name and description. Add a product here only to change them; an empty field keeps the automatic one.",
            "สินค้าแต่ละรายการมีชื่อและคำอธิบายอัตโนมัติอยู่แล้ว เพิ่มสินค้าที่นี่เฉพาะเมื่อต้องการเปลี่ยน ช่องที่เว้นว่างจะใช้ค่าอัตโนมัติ"
          ),
          fields: [
            {
              name: "products",
              type: "array",
              label: L("Product overrides", "กำหนดเองรายสินค้า"),
              labels: { singular: L("Product", "สินค้า"), plural: L("Products", "สินค้า") },
              admin: {
                components: { RowLabel: "@/payload/components/SeoPreview#ProductRowLabel" },
              },
              fields: [
                {
                  name: "productId",
                  type: "text",
                  label: L("Product", "สินค้า"),
                  required: true,
                  admin: {
                    components: { Field: "@/payload/components/ProductPicker#ProductPicker" },
                  },
                  validate: (value: unknown) =>
                    typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value)
                      ? true
                      : "Pick a product",
                },
                bilingual("title", { label: L("Title", "ชื่อ (Title)"), maxLength: 120 }),
                bilingual("description", {
                  label: L("Description", "คำอธิบาย (Description)"),
                  multiline: true,
                  maxLength: 320,
                }),
                {
                  name: "productPreview",
                  type: "ui",
                  admin: { components: { Field: "@/payload/components/ProductSeoPreview#ProductSeoPreview" } },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
