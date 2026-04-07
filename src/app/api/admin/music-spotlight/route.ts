import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async () => {
  const rows = await prisma.musicSpotlightEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(rows);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, artist, coverUrl, listenUrl, sortOrder } = body;
  if (!title || !artist || !coverUrl) {
    return NextResponse.json(
      { error: "title, artist, and coverUrl are required" },
      { status: 400 },
    );
  }
  const row = await prisma.musicSpotlightEntry.create({
    data: {
      title,
      artist,
      coverUrl,
      listenUrl: listenUrl != null && String(listenUrl).trim() ? String(listenUrl).trim() : null,
      sortOrder: sortOrder != null ? parseInt(String(sortOrder), 10) : 0,
    },
  });
  return NextResponse.json(row);
});
