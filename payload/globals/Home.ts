import type { GlobalConfig } from "payload";
import { signedIn } from "../access";
import { revalidateSite } from "../hooks";
import { bilingual, image, L, link } from "../fields";
import { previewUrl } from "../livePreview";

export const Home: GlobalConfig = {
  slug: "home",
  label: L("Homepage", "หน้าแรก"),
  admin: {
    group: L("Pages", "หน้าเว็บ"),
    description: L(
      "Hero, feature showcase, video gallery and the Who We Are block.",
      "ส่วนบนสุด ส่วนแนะนำฟีเจอร์ แกลเลอรีวิดีโอ และส่วนเกี่ยวกับเรา"
    ),
    livePreview: { url: previewUrl("/") },
  },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: L("Hero", "ส่วนบนสุด"),
          fields: [
            bilingual("heroHeadline", {
              label: L("Headline", "หัวข้อหลัก"),
              required: true,
              maxLength: 80,
              description: L("Shown very large — keep it short.", "แสดงตัวใหญ่มาก ควรสั้นกระชับ"),
            }),
            bilingual("heroAccent", {
              label: L("Second line (gold)", "บรรทัดที่สอง (สีทอง)"),
              maxLength: 80,
              description: L("Optional. Always starts on its own line.", "ไม่บังคับ ขึ้นบรรทัดใหม่เสมอ"),
            }),
            bilingual("heroSub", {
              label: L("Text under the headline", "ข้อความใต้หัวข้อ"),
              required: true,
              multiline: true,
              maxLength: 300,
            }),
            {
              name: "heroVideos",
              type: "array",
              label: L("Background videos", "วิดีโอพื้นหลัง"),
              labels: { singular: L("Video", "วิดีโอ"), plural: L("Videos", "วิดีโอ") },
              maxRows: 6,
              admin: {
                description: L(
                  "Played in order, then looped; none shows the animated lawn instead. Upload videos to Cloudinary and put q_auto/ac_none/ right after /upload/ in the link — it compresses the video and drops the sound. A raw phone video will stall on mobile.",
                  "เล่นตามลำดับแล้ววนซ้ำ ถ้าไม่มีจะแสดงภาพสนามหญ้าแบบเคลื่อนไหว ให้อัปโหลดวิดีโอขึ้น Cloudinary แล้วใส่ q_auto/ac_none/ ต่อจาก /upload/ ในลิงก์ เพื่อบีบอัดและตัดเสียง วิดีโอจากมือถือที่ไม่ได้บีบอัดจะกระตุกบนมือถือ"
                ),
              },
              fields: [link("url", L("Video link", "ลิงก์วิดีโอ"), { required: true })],
            },
          ],
        },
        {
          label: L("Feature showcase", "แนะนำฟีเจอร์"),
          description: L(
            "The full-screen section where the photo changes as you scroll. Empty hides it.",
            "ส่วนเต็มจอที่รูปเปลี่ยนตามการเลื่อน ถ้าว่างจะซ่อนส่วนนี้"
          ),
          fields: [
            {
              name: "featureShowcase",
              type: "array",
              label: L("Features", "ฟีเจอร์"),
              labels: { singular: L("Feature", "ฟีเจอร์"), plural: L("Features", "ฟีเจอร์") },
              maxRows: 8,
              fields: [
                image("image", L("Photo", "รูปภาพ"), {
                  required: true,
                  description: L(
                    "Give each feature its own photo, or the change is not visible.",
                    "ใช้รูปต่างกันในแต่ละฟีเจอร์ ไม่เช่นนั้นจะไม่เห็นการเปลี่ยนรูป"
                  ),
                }),
                bilingual("heading", { label: L("Heading", "หัวข้อ"), required: true, maxLength: 80 }),
                bilingual("body", { label: L("Text", "ข้อความ"), required: true, multiline: true, maxLength: 400 }),
              ],
            },
          ],
        },
        {
          label: L("Video gallery", "แกลเลอรีวิดีโอ"),
          description: L(
            "The See It in Action cards. The first two are shown large.",
            "การ์ดวิดีโอ See It in Action สองรายการแรกแสดงขนาดใหญ่"
          ),
          fields: [
            {
              name: "videoGallery",
              type: "array",
              label: L("Videos", "วิดีโอ"),
              labels: { singular: L("Video", "วิดีโอ"), plural: L("Videos", "วิดีโอ") },
              maxRows: 12,
              fields: [
                link("url", L("Video link", "ลิงก์วิดีโอ"), {
                  required: true,
                  description: L(
                    "A YouTube or YouTube Shorts link, or a direct .mp4 link.",
                    "ลิงก์ YouTube หรือ YouTube Shorts หรือลิงก์ไฟล์ .mp4 โดยตรง"
                  ),
                }),
                image("poster", L("Thumbnail", "ภาพปก"), {
                  description: L(
                    "Optional. Without it, YouTube videos use their YouTube thumbnail.",
                    "ไม่บังคับ ถ้าไม่ใส่ วิดีโอ YouTube จะใช้ภาพปกของ YouTube"
                  ),
                }),
                {
                  type: "row",
                  fields: [
                    { name: "title", type: "text", label: L("Title", "ชื่อวิดีโอ"), required: true, maxLength: 100, admin: { width: "50%" } },
                    { name: "tag", type: "text", label: L("Tag, e.g. the robot shown", "ป้ายกำกับ เช่น รุ่นหุ่นยนต์"), maxLength: 40, admin: { width: "50%" } },
                  ],
                },
                { name: "author", type: "text", label: L("Credit (optional)", "เครดิต (ไม่บังคับ)"), maxLength: 60 },
              ],
            },
          ],
        },
        {
          label: L("Who We Are", "เกี่ยวกับเรา"),
          description: L("The block with the three counting stat cards.", "ส่วนที่มีการ์ดตัวเลขนับขึ้นสามใบ"),
          fields: [
            bilingual("trustHeading", { label: L("Heading", "หัวข้อ"), required: true, maxLength: 120 }),
            bilingual("trustBody", { label: L("Text", "ข้อความ"), required: true, multiline: true, maxLength: 600 }),
            {
              name: "trustStats",
              type: "array",
              label: L("Stat cards", "การ์ดตัวเลข"),
              labels: { singular: L("Stat", "ตัวเลข"), plural: L("Stats", "ตัวเลข") },
              maxRows: 3,
              admin: {
                description: L(
                  "Only numbers you can back up if a customer asks. Robots deployed also appears on the About page — keep the two the same.",
                  "ใช้เฉพาะตัวเลขที่ยืนยันได้ จำนวนหุ่นยนต์ที่ติดตั้งแล้วแสดงในหน้าเกี่ยวกับเราด้วย ควรใช้ตัวเลขเดียวกัน"
                ),
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", type: "number", label: L("Number", "ตัวเลข"), required: true, min: 0, admin: { width: "34%", step: 0.1 } },
                    {
                      name: "decimals",
                      type: "number",
                      label: L("Decimal places (0 or 1)", "ทศนิยม (0 หรือ 1)"),
                      min: 0,
                      max: 2,
                      defaultValue: 0,
                      admin: { width: "33%" },
                    },
                    { name: "suffix", type: "text", label: L("After the number, e.g. + or ★", "ต่อท้าย เช่น + หรือ ★"), maxLength: 4, admin: { width: "33%" } },
                  ],
                },
                bilingual("label", { label: L("Label", "คำอธิบาย"), required: true, maxLength: 40 }),
              ],
            },
          ],
        },
      ],
    },
  ],
};
