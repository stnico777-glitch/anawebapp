import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public API: returns carousel posts for the homepage (no auth).
 * Used when live Instagram API isn't configured and admin has added posts.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (typeof prisma.carouselPost?.findMany !== "function") {
      return NextResponse.json({ posts: [] });
    }
    const posts = await prisma.carouselPost.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, imageUrl: true, linkUrl: true, alt: true },
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
