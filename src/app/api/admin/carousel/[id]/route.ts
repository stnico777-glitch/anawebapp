import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<
  { params: Promise<{ id: string }> }
>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { imageUrl, linkUrl, alt, sortOrder } = body;

  const post = await prisma.carouselPost.update({
    where: { id },
    data: {
      ...(imageUrl != null && { imageUrl }),
      ...(linkUrl != null && { linkUrl }),
      ...(alt != null && { alt }),
      ...(sortOrder != null && { sortOrder: parseInt(String(sortOrder), 10) }),
    },
  });

  return NextResponse.json(post);
});

export const DELETE = withAdmin<
  { params: Promise<{ id: string }> }
>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.carouselPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
