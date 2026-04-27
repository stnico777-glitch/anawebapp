import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUDIO_COLLECTION_CATEGORIES } from "@/lib/audio-layout-types";

function normalizeCategory(raw: unknown): string {
  return (AUDIO_COLLECTION_CATEGORIES as readonly string[]).includes(String(raw))
    ? String(raw)
    : "AFFIRMATIONS";
}

export const GET = withAdmin(async () => {
  const rows = await prisma.audioCollectionCard.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(rows);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, imageUrl } = body;
  if (!title || !imageUrl) {
    return NextResponse.json(
      { error: "title and imageUrl are required" },
      { status: 400 },
    );
  }
  const row = await prisma.audioCollectionCard.create({
    data: {
      category: normalizeCategory(body.category),
      title: String(title),
      metaLine: typeof body.metaLine === "string" ? body.metaLine : "",
      imageUrl: String(imageUrl),
      summary: typeof body.summary === "string" ? body.summary : "",
      audioUrl: typeof body.audioUrl === "string" ? body.audioUrl.trim() : "",
      linkHref:
        typeof body.linkHref === "string" && body.linkHref.trim()
          ? body.linkHref.trim()
          : "/prayer#prayer-library",
      sortOrder: body.sortOrder != null ? parseInt(String(body.sortOrder), 10) || 0 : 0,
    },
  });
  return NextResponse.json(row);
});
