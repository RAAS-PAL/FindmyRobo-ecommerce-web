import type { GlobalConfig } from "payload";
import { signedIn } from "../access";
import { revalidateSite } from "../hooks";
import { bilingual, image, L, link } from "../fields";
import { previewUrl } from "../livePreview";

/** Digits, spaces, dashes, + and brackets — phone numbers as people write them. */
const PHONE_RE = /^[0-9+()\-\s]{6,24}$/;

export const Contact: GlobalConfig = {
  slug: "contact",
  label: L("Contact & social", "ช่องทางติดต่อ"),
  admin: {
    group: L("Pages", "หน้าเว็บ"),
    description: L(
      "Used in the footer, the contact page, order emails and Google. The company address is not here: it has to match the company registration, so it is changed in code.",
      "ใช้ที่ส่วนท้ายเว็บ หน้าติดต่อ อีเมลคำสั่งซื้อ และ Google ที่อยู่บริษัทไม่ได้อยู่ที่นี่ เพราะต้องตรงกับหนังสือรับรองบริษัท จึงแก้ไขในโค้ด"
    ),
    livePreview: { url: previewUrl("/contact-sales") },
  },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          label: L("Phone", "โทรศัพท์"),
          required: true,
          admin: { width: "50%" },
          validate: (value: unknown) =>
            typeof value === "string" && PHONE_RE.test(value.trim())
              ? true
              : "Digits, spaces, dashes, + and brackets only",
        },
        {
          name: "email",
          type: "email",
          label: L("Email", "อีเมล"),
          required: true,
          admin: {
            width: "50%",
            description: L(
              "Shown to customers. New-order alerts go to the addresses set on the server, not here.",
              "ลูกค้าจะเห็นอีเมลนี้ ส่วนการแจ้งเตือนคำสั่งซื้อใหม่ส่งไปยังอีเมลที่ตั้งไว้บนเซิร์ฟเวอร์"
            ),
          },
        },
      ],
    },
    bilingual("phoneHours", {
      label: L("Opening hours", "เวลาทำการ"),
      maxLength: 60,
      description: L("Shown under the phone number. Empty hides it.", "แสดงใต้เบอร์โทร เว้นว่างเพื่อซ่อน"),
    }),
    {
      type: "collapsible",
      label: L("LINE", "LINE"),
      fields: [
        {
          type: "row",
          fields: [
            { name: "lineId", type: "text", label: L("LINE ID", "LINE ID"), required: true, maxLength: 40, admin: { width: "50%" } },
            {
              ...link("lineUrl", L("Add-friend link", "ลิงก์เพิ่มเพื่อน"), { httpsOnly: true }),
              admin: { width: "50%" },
            },
          ],
        },
        image("lineQrImage", L("QR code", "QR โค้ด"), {
          description: L(
            "If you change the QR code, change the add-friend link to the same account too.",
            "ถ้าเปลี่ยน QR โค้ด ให้เปลี่ยนลิงก์เพิ่มเพื่อนเป็นบัญชีเดียวกันด้วย"
          ),
        }),
      ],
    },
    {
      name: "socials",
      type: "group",
      label: L("Social media", "โซเชียลมีเดีย"),
      admin: {
        description: L(
          "Leave a platform empty if there is no account — its icon disappears from the footer.",
          "เว้นว่างไว้ถ้าไม่มีบัญชี ไอคอนจะหายไปจากส่วนท้ายเว็บ"
        ),
      },
      fields: [
        link("facebook", L("Facebook", "Facebook"), { httpsOnly: true }),
        link("youtube", L("YouTube", "YouTube"), { httpsOnly: true }),
        link("tiktok", L("TikTok", "TikTok"), { httpsOnly: true }),
      ],
    },
  ],
};
