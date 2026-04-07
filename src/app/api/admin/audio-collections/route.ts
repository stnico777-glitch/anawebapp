import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async () => {
  const rows = await prisma.audioCollectionCard.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(rows);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, metaLine, imageUrl, summary, linkHref, sortOrder } = body;
  if (!title || !metaLine || !imageUrl || summary == null || summary === "") {
    return NextResponse.json(
      { error: "title, metaLine, imageUrl, and summary are required" },
      { status: 400 },
    );
  }
  const row = await prisma.audioCollectionCard.create({
    data: {
      title,
      metaLine,
      imageUrl,
      summary,
      linkHref: typeof linkHref === "string" && linkHref.trim() ? linkHref.trim() : "/prayer#prayer-library",
      sortOrder: sortOrder != null ? parseInt(String(sortOrder), 10) : 0,
    },
  });
  return NextResponse.json(row);
});
