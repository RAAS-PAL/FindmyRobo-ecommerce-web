import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Payload storage adapter for Supabase Storage.
 *
 * CMS images go into the same public bucket as the product photos
 * (supabase/add-product-photos-bucket.sql), under `cms/`. It uses the service
 * key the site already has, so there is no S3 key pair to create or rotate.
 *
 * Files are served straight from Supabase's CDN (generateURL), not through
 * the CMS — the storefront gets a plain public URL, like any other image.
 */

const BUCKET = "product-photos";
const FOLDER = "cms";

const keyFor = (filename: string, prefix?: string) =>
  [FOLDER, prefix, filename].filter(Boolean).join("/");

const publicUrl = (key: string) =>
  createServiceClient().storage.from(BUCKET).getPublicUrl(key).data.publicUrl;

export const supabaseStorage: Adapter = () => ({
  name: "supabase-storage",

  handleUpload: async ({ file, data }) => {
    const key = keyFor(file.filename, data?.prefix);
    const { error } = await createServiceClient()
      .storage.from(BUCKET)
      .upload(key, file.buffer, { contentType: file.mimeType, upsert: true });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  },

  handleDelete: async ({ filename, doc }) => {
    const { error } = await createServiceClient()
      .storage.from(BUCKET)
      .remove([keyFor(filename, doc.prefix)]);
    if (error) throw new Error(`Supabase delete failed: ${error.message}`);
  },

  generateURL: ({ filename, prefix }) => publicUrl(keyFor(filename, prefix)),

  // Requests for /cms-api/media/file/<name> are sent to the CDN copy.
  staticHandler: (_req, { params }) =>
    Response.redirect(publicUrl(keyFor(params.filename, params.prefix)), 302),
});
