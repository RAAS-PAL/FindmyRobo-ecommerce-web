import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Product photo upload for the admin panel. Takes one file per request and
 * returns its public URL, which the product form drops into the image fields —
 * so the stored product still just holds URLs, exactly as when they're pasted
 * by hand.
 *
 * Uploads are admin-only (session checked here) and land in the public
 * `product-photos` bucket via the service key; see
 * supabase/add-product-photos-bucket.sql.
 */

const BUCKET = "product-photos";
const MAX_BYTES = 5 * 1024 * 1024;
/** Raster formats only — an uploaded SVG is a script-execution vector. */
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, AVIF, or GIF image" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is larger than 5 MB — compress it and try again" },
      { status: 400 }
    );
  }

  // random name: never trust the client's, and it sidesteps collisions
  const path = `products/${crypto.randomUUID()}.${extension}`;
  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 502 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
