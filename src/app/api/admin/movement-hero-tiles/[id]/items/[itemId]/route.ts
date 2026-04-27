import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<{ params: Promise<{ id: string; itemId: string }> }>(
  async (_, request, { params }) => {
    const { id: heroTileId, itemId } = await params;
    const body = await request.json();
    const { dayIndex, title, imageUrl, videoUrl, sortOrder } = body ?? {};

    /** Scope the update to the parent tile so admins can't accidentally patch an item that
     *  belongs to a different hero tile by guessing an itemId. */
    const existing = await prisma.movementHeroCollectionItem.findFirst({
      where: { id: itemId, heroTileId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "collection item not found" }, { status: 404 });
    }

    const data: {
      dayIndex?: number;
      title?: string;
      imageUrl?: string;
      videoUrl?: string;
      sortOrder?: number;
    } = {};
    if (dayIndex != null) {
      const parsed = Number.parseInt(String(dayIndex), 10);
      if (!Number.isFinite(parsed) || parsed < 1) {
        return NextResponse.json(
          { error: "dayIndex must be a positive integer" },
          { status: 400 },
        );
      }
      data.dayIndex = parsed;
    }
    if (title != null) data.title = String(title);
    if (imageUrl != null) data.imageUrl = String(imageUrl);
    if (videoUrl != null) data.videoUrl = String(videoUrl).trim();
    if (sortOrder != null) data.sortOrder = Number.parseInt(String(sortOrder), 10) || 0;

    try {
      const row = await prisma.movementHeroCollectionItem.update({
        where: { id: itemId },
        data,
      });
      return NextResponse.json(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed to update";
      if (/Unique constraint/i.test(msg)) {
        return NextResponse.json(
          { error: `Day ${data.dayIndex} already exists in this collection` },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  },
);

export const DELETE = withAdmin<{ params: Promise<{ id: string; itemId: string }> }>(
  async (_, _request, { params }) => {
    const { id: heroTileId, itemId } = await params;
    const existing = await prisma.movementHeroCollectionItem.findFirst({
      where: { id: itemId, heroTileId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "collection item not found" }, { status: 404 });
    }
    await prisma.movementHeroCollectionItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  },
);
