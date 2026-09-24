import type { GlobalConfig } from "payload";
import { signedIn } from "../access";
import { revalidateSite } from "../hooks";
import { bilingual, image, L } from "../fields";
import { previewUrl } from "../livePreview";

export const About: GlobalConfig = {
  slug: "about",
  label: L("About page", "หน้าเกี่ยวกับเรา"),
  admin: {
    group: L("Pages", "หน้าเว็บ"),
    description: L(
      "Everything company-specific on /about. Headings and buttons stay in the site's translation files.",
      "ทุกอย่างเกี่ยวกับบริษัทในหน้า /about ส่วนหัวข้อและปุ่มอยู่ในไฟล์แปลภาษาของเว็บ"
    ),
    livePreview: { url: previewUrl("/about") },
  },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: L("Intro & stats", "คำแนะนำและตัวเลข"),
          fields: [
            bilingual("intro", {
              label: L("Text under the page heading", "ข้อความใต้หัวข้อหน้า"),
              required: true,
              multiline: true,
              maxLength: 500,
            }),
            {
              name: "stats",
              type: "array",
              label: L("Stats", "ตัวเลข"),
              labels: { singular: L("Stat", "ตัวเลข"), plural: L("Stats", "ตัวเลข") },
              maxRows: 6,
              admin: {
                description: L(
                  "Shown as typed, e.g. 2021, 1,600+ or 24h. Only numbers you can back up. Empty hides the row.",
                  "แสดงตามที่พิมพ์ เช่น 2021, 1,600+ หรือ 24h ใช้เฉพาะสิ่งที่ยืนยันได้ ถ้าว่างจะซ่อนแถวนี้"
                ),
              },
              fields: [
                { name: "value", type: "text", label: L("Value", "ค่า"), required: true, maxLength: 12 },
                bilingual("label", { label: L("Label", "คำอธิบาย"), required: true, maxLength: 40 }),
              ],
            },
          ],
        },
        {
          label: L("Our story", "เรื่องราวของเรา"),
          fields: [
            bilingual("storyBody", {
              label: L("Story", "เรื่องราว"),
              multiline: true,
              maxLength: 6000,
              description: L("Leave an empty line between paragraphs.", "เว้นบรรทัดว่างหนึ่งบรรทัดระหว่างย่อหน้า"),
            }),
            image("storyImage", L("Photo", "รูปภาพ"), {
              required: true,
              description: L(
                "A real photo of the team, showroom or an installation works best.",
                "รูปจริงของทีมงาน โชว์รูม หรืองานติดตั้งจะดีที่สุด"
              ),
            }),
          ],
        },
        {
          label: L("Partner", "พาร์ทเนอร์"),
          fields: [
            { name: "partnerEnabled", type: "checkbox", label: L("Show the partner block", "แสดงส่วนพาร์ทเนอร์"), defaultValue: true },
            bilingual("partnerEyebrow", {
              label: L("Small label above, e.g. Official supply", "ป้ายเล็กด้านบน เช่น การจัดหาอย่างเป็นทางการ"),
              required: true,
              requiredWhen: "partnerEnabled",
              maxLength: 40,
            }),
            {
              name: "partnerName",
              type: "text",
              label: L("Partner name", "ชื่อพาร์ทเนอร์"),
              maxLength: 60,
              validate: (value: unknown, { data }: { data: unknown }) =>
                (data as { partnerEnabled?: boolean })?.partnerEnabled !== true ||
                (typeof value === "string" && value.trim())
                  ? true
                  : "Required",
            },
            bilingual("partnerStatus", {
              label: L("Status line", "บรรทัดสถานะ"),
              required: true,
              requiredWhen: "partnerEnabled",
              maxLength: 80,
              description: L(
                "Words like authorised, official or exclusive are a claim about the partner. Only use one the partner has confirmed in writing, and keep the agreement on file.",
                "คำอย่าง ตัวแทนที่ได้รับอนุญาต อย่างเป็นทางการ หรือ แต่เพียงผู้เดียว เป็นการกล่าวอ้างถึงพาร์ทเนอร์ ใช้เฉพาะคำที่พาร์ทเนอร์ยืนยันเป็นลายลักษณ์อักษรแล้ว และเก็บสัญญาไว้เป็นหลักฐาน"
              ),
            }),
            bilingual("partnerBody", {
              label: L("Text", "ข้อความ"),
              required: true,
              requiredWhen: "partnerEnabled",
              multiline: true,
              maxLength: 500,
            }),
            image("partnerLogo", L("Logo (optional)", "โลโก้ (ไม่บังคับ)")),
          ],
        },
        {
          label: L("What You Get", "สิ่งที่คุณจะได้รับ"),
          fields: [
            {
              name: "values",
              type: "array",
              label: L("Cards", "การ์ด"),
              labels: { singular: L("Card", "การ์ด"), plural: L("Cards", "การ์ด") },
              maxRows: 8,
              fields: [
                {
                  name: "icon",
                  type: "select",
                  label: L("Icon", "ไอคอน"),
                  required: true,
                  defaultValue: "shield",
                  options: [
                    { label: L("Shield — warranty", "โล่ — การรับประกัน"), value: "shield" },
                    { label: L("House — at home", "บ้าน — ที่บ้านคุณ"), value: "home" },
                    { label: L("Wrench — installation", "ประแจ — การติดตั้ง"), value: "wrench" },
                    { label: L("Headset — support", "หูฟัง — บริการช่วยเหลือ"), value: "headset" },
                  ],
                },
                bilingual("title", { label: L("Title", "หัวข้อ"), required: true, maxLength: 60 }),
                bilingual("body", { label: L("Text", "ข้อความ"), required: true, multiline: true, maxLength: 300 }),
              ],
            },
          ],
        },
        {
          label: L("Milestones", "เส้นทางของเรา"),
          fields: [
            {
              name: "milestones",
              type: "array",
              label: L("Milestones", "รายการ"),
              labels: { singular: L("Milestone", "รายการ"), plural: L("Milestones", "รายการ") },
              maxRows: 20,
              fields: [
                { name: "when", type: "text", label: L("Year, e.g. 2024 or 2024 Q3", "ปี เช่น 2024 หรือ 2024 Q3"), required: true, maxLength: 20 },
                bilingual("title", { label: L("Title", "หัวข้อ"), required: true, maxLength: 80 }),
                bilingual("body", { label: L("Text", "ข้อความ"), required: true, multiline: true, maxLength: 300 }),
              ],
            },
          ],
        },
        {
          label: L("Team", "ทีมงาน"),
          description: L(
            "Hidden while empty. Only add people who agreed to be on the website.",
            "จะซ่อนไว้ถ้าไม่มีรายชื่อ ใส่เฉพาะคนที่ยินยอมให้แสดงบนเว็บไซต์"
          ),
          fields: [
            {
              name: "team",
              type: "array",
              label: L("People", "รายชื่อ"),
              labels: { singular: L("Person", "คน"), plural: L("People", "คน") },
              maxRows: 24,
              fields: [
                { name: "name", type: "text", label: L("Name", "ชื่อ"), required: true, maxLength: 80 },
                bilingual("role", { label: L("Role", "ตำแหน่ง"), required: true, maxLength: 60 }),
                image("photo", L("Photo (optional, square works best)", "รูปภาพ (ไม่บังคับ รูปสี่เหลี่ยมจัตุรัสดีที่สุด)")),
              ],
            },
          ],
        },
      ],
    },
  ],
};
