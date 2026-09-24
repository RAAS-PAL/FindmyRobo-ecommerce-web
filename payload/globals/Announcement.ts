import type { GlobalConfig } from "payload";
import { signedIn } from "../access";
import { revalidateSite } from "../hooks";
import { bilingual, L } from "../fields";
import { previewUrl } from "../livePreview";

export const Announcement: GlobalConfig = {
  slug: "announcement",
  label: L("Announcement bar", "แถบประกาศ"),
  admin: {
    group: L("Pages", "หน้าเว็บ"),
    description: L(
      "The gold scrolling bar at the top of every page.",
      "แถบสีทองที่เลื่อนอยู่ด้านบนสุดของทุกหน้า"
    ),
    livePreview: { url: previewUrl("/") },
  },
  access: { read: signedIn, update: signedIn, readVersions: signedIn },
  versions: { drafts: true, max: 50 },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: L("Show the announcement bar", "แสดงแถบประกาศ"),
      defaultValue: true,
      admin: {
        description: L(
          "Switch off to hide the bar everywhere without deleting the messages.",
          "ปิดเพื่อซ่อนแถบในทุกหน้าโดยไม่ต้องลบข้อความ"
        ),
      },
    },
    {
      name: "messages",
      type: "array",
      label: L("Messages", "ข้อความ"),
      labels: { singular: L("Message", "ข้อความ"), plural: L("Messages", "ข้อความ") },
      maxRows: 6,
      fields: [bilingual("message", { label: L("Message", "ข้อความ"), required: true, maxLength: 140 })],
    },
  ],
};
