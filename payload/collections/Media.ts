import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { signedIn } from "../access";
import { L } from "../fields";

/**
 * Images used by the CMS content. Files are stored in the Supabase storage
 * bucket the product photos already use (payload/storage/supabase.ts), so the
 * site keeps one place for files and needs no extra storage account.
 *
 * Videos are not uploaded here on purpose: they go to the S3 media bucket
 * (lib/media.ts), compressed first for phones (see the hero video field).
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: L("Image", "รูปภาพ"), plural: L("Media", "สื่อ") },
  access: {
    // The files are public on the website anyway.
    read: () => true,
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  admin: {
    group: L("Content", "เนื้อหา"),
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  upload: {
    // Raster only — an uploaded SVG can carry script.
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    // Size limit: 4 MB, set in payload.config.ts (upload.limits).
    focalPoint: false,
    crop: false,
    // Only used for offline tests (PAYLOAD_MEDIA_STORAGE=local); gitignored.
    staticDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.payload-media"),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: L("Description (for screen readers and Google)", "คำอธิบายรูป (สำหรับโปรแกรมอ่านหน้าจอและ Google)"),
    },
  ],
};
