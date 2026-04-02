import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async () => {
  const posts = await prisma.carouselPost.findMany({
    orderBy: { sortOrder: "asc", createdAt: "asc" },
  });
  return NextResponse.json(posts);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { imageUrl, linkUrl, alt, sortOrder } = body;
  if (!imageUrl || !linkUrl) {
    return NextResponse.json(
      { error: "imageUrl and linkUrl required" },
      { status: 400 }
    );
  }

  const post = await prisma.carouselPost.create({
    data: {
      imageUrl,
      linkUrl,
      alt: alt || null,
      sortOrder: sortOrder != null ? parseInt(String(sortOrder), 10) : 0,
    },
  });

  return NextResponse.json(post);
});
