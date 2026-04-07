import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<{ params: Promise<{ id: string }> }>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { title, artist, coverUrl, listenUrl, sortOrder } = body;
  const row = await prisma.musicSpotlightEntry.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      ...(artist != null && { artist }),
      ...(coverUrl != null && { coverUrl }),
      ...(listenUrl !== undefined && {
        listenUrl: listenUrl != null && String(listenUrl).trim() ? String(listenUrl).trim() : null,
      }),
      ...(sortOrder != null && { sortOrder: parseInt(String(sortOrder), 10) }),
    },
  });
  return NextResponse.json(row);
});

export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.musicSpotlightEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
