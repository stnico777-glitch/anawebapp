import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<{ params: Promise<{ id: string }> }>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { title, subtitle, imageUrl, linkHref, sortOrder } = body;
  const row = await prisma.movementHeroTile.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      ...(subtitle != null && { subtitle }),
      ...(imageUrl != null && { imageUrl }),
      ...(linkHref != null && {
        linkHref: String(linkHref).trim() || "/movement",
      }),
      ...(sortOrder != null && { sortOrder: parseInt(String(sortOrder), 10) }),
    },
  });
  return NextResponse.json(row);
});

export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.movementHeroTile.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
