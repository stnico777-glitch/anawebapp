import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Create a new collection item (e.g. "Day 3") under a hero tile. */
export const POST = withAdmin<{ params: Promise<{ id: string }> }>(
  async (_, request, { params }) => {
    const { id: heroTileId } = await params;
    const body = await request.json();
    const { dayIndex, title, imageUrl, videoUrl, sortOrder } = body ?? {};

    const parsedDay = Number.parseInt(String(dayIndex), 10);
    if (!Number.isFinite(parsedDay) || parsedDay < 1) {
      return NextResponse.json(
        { error: "dayIndex must be a positive integer" },
        { status: 400 },
      );
    }
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "title and imageUrl are required" },
        { status: 400 },
      );
    }

    /** Verify the parent tile exists so we return 404 rather than a FK error. */
    const parent = await prisma.movementHeroTile.findUnique({
      where: { id: heroTileId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "hero tile not found" }, { status: 404 });
    }

    try {
      const row = await prisma.movementHeroCollectionItem.create({
        data: {
          heroTileId,
          dayIndex: parsedDay,
          title: String(title),
          imageUrl: String(imageUrl),
          videoUrl: typeof videoUrl === "string" ? videoUrl.trim() : "",
          sortOrder:
            sortOrder != null ? Number.parseInt(String(sortOrder), 10) || 0 : parsedDay - 1,
        },
      });
      return NextResponse.json(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed to create";
      /** Prisma P2002 (unique constraint on heroTileId + dayIndex) surfaces as a clear 409. */
      if (/Unique constraint/i.test(msg)) {
        return NextResponse.json(
          { error: `Day ${parsedDay} already exists in this collection` },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  },
);
