import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<{ params: Promise<{ id: string }> }>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { title, metaLine, imageUrl, summary, videoUrl, sortOrder } = body;
  const row = await prisma.movementQuickieCard.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      ...(metaLine != null && { metaLine }),
      ...(imageUrl != null && { imageUrl }),
      ...(summary != null && { summary }),
      ...(videoUrl != null && {
        videoUrl: String(videoUrl).trim(),
      }),
      ...(sortOrder != null && { sortOrder: parseInt(String(sortOrder), 10) }),
    },
  });
  return NextResponse.json(row);
});

export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.movementQuickieCard.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
