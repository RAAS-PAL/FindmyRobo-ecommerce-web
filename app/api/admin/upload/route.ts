import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Photo upload for the admin panel. Takes one file per request and returns
 * its public URL, which the form drops into the image field — so what is
 * stored is still just a URL, exactly as when one is pasted by hand.
 *
 * Open to all staff (admin and marketing — the Content editor uploads too),
 * session checked here. Files land in the public `product-photos` bucket via
 * the service key (supabase/add-product-photos-bucket.sql), under
 * `products/` or `content/` depending on who asked, so the two can be told
 * apart when the bucket is tidied.
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
  if (!(await getStaffUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: FormDataEntryValue | null;
  let folder: "products" | "content";
  try {
    const form = await request.formData();
    file = form.get("file");
    folder = form.get("folder") === "content" ? "content" : "products";
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
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
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
