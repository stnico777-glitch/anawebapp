import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin";

const MAX_BYTES = 4 * 1024 * 1024;

export const POST = withAdmin(async (_, request) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "File upload is not configured (set BLOB_READ_WRITE_TOKEN)." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected file field" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 400 });
  }

  const type = file.type || "";
  if (!type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  const safeExt =
    type === "image/png"
      ? "png"
      : type === "image/webp"
        ? "webp"
        : type === "image/gif"
          ? "gif"
          : "jpg";

  const pathname = `prayer-journal/broadcast/${Date.now()}.${safeExt}`;
  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ url: blob.url });
});
