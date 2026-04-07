import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async () => {
  const rows = await prisma.audioEssentialTile.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(rows);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, subtitle, imageUrl, linkHref, sortOrder } = body;
  if (!title || subtitle == null || !imageUrl) {
    return NextResponse.json(
      { error: "title, subtitle, and imageUrl are required" },
      { status: 400 },
    );
  }
  const row = await prisma.audioEssentialTile.create({
    data: {
      title,
      subtitle,
      imageUrl,
      linkHref: typeof linkHref === "string" && linkHref.trim() ? linkHref.trim() : "/prayer#prayer-library",
      sortOrder: sortOrder != null ? parseInt(String(sortOrder), 10) : 0,
    },
  });
  return NextResponse.json(row);
});
