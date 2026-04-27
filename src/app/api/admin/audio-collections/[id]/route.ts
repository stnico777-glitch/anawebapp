import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUDIO_COLLECTION_CATEGORIES } from "@/lib/audio-layout-types";

export const PATCH = withAdmin<{ params: Promise<{ id: string }> }>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { title, metaLine, imageUrl, summary, audioUrl, linkHref, sortOrder, category } = body;
  const validCategory =
    typeof category === "string" &&
    (AUDIO_COLLECTION_CATEGORIES as readonly string[]).includes(category);
  const row = await prisma.audioCollectionCard.update({
    where: { id },
    data: {
      ...(validCategory && { category }),
      ...(title != null && { title }),
      ...(metaLine != null && { metaLine }),
      ...(imageUrl != null && { imageUrl }),
      ...(summary != null && { summary }),
      ...(audioUrl != null && { audioUrl: String(audioUrl).trim() }),
      ...(linkHref != null && {
        linkHref: String(linkHref).trim() || "/prayer#prayer-library",
      }),
      ...(sortOrder != null && { sortOrder: parseInt(String(sortOrder), 10) }),
    },
  });
  return NextResponse.json(row);
});

export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.audioCollectionCard.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
