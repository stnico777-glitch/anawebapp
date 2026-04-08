import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, metaLine, imageUrl, summary, videoUrl, sortOrder } = body;
  const video = typeof videoUrl === "string" ? videoUrl.trim() : "";
  if (!title || !metaLine || !imageUrl || summary == null || summary === "") {
    return NextResponse.json(
      { error: "title, metaLine, imageUrl, and summary are required" },
      { status: 400 },
    );
  }
  const row = await prisma.movementQuickieCard.create({
    data: {
      title,
      metaLine,
      imageUrl,
      summary,
      videoUrl: video,
      sortOrder: sortOrder != null ? parseInt(String(sortOrder), 10) : 0,
    },
  });
  return NextResponse.json(row);
});
