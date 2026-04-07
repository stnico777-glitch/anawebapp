import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, subtitle, imageUrl, linkHref, sortOrder } = body;
  if (!title || subtitle == null || !imageUrl) {
    return NextResponse.json(
      { error: "title, subtitle, and imageUrl are required" },
      { status: 400 },
    );
  }
  const row = await prisma.movementHeroTile.create({
    data: {
      title,
      subtitle,
      imageUrl,
      linkHref: typeof linkHref === "string" && linkHref.trim() ? linkHref.trim() : "/movement",
      sortOrder: sortOrder != null ? parseInt(String(sortOrder), 10) : 0,
    },
  });
  return NextResponse.json(row);
});
