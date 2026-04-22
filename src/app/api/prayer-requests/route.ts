import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { resolveWallAuthor } from "@/lib/community-author";
import { rateLimit } from "@/lib/rate-limit";
import { requireMemberFromRequest } from "@/lib/auth";

const createSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET() {
  const requests = await prisma.prayerRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    // Exclude `userId` so an unauthenticated scrape of this endpoint can't
    // link public posts to internal account ids.
    select: {
      id: true,
      content: true,
      authorName: true,
      createdAt: true,
    },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const gate = await requireMemberFromRequest(request);
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const author = await resolveWallAuthor(request);
  if (!author) {
    return NextResponse.json({ error: "Sign in to post a prayer." }, { status: 401 });
  }

  /** Per-user burst cap: 5 posts per minute, 30 per hour. */
  const minute = rateLimit(`post:prayer:user:${author.userId}:1m`, 5, 60_000);
  if (!minute.ok) {
    return NextResponse.json(
      { error: "You're posting a lot — take a breath and try again in a moment." },
      { status: 429, headers: { "Retry-After": String(minute.retryAfter) } },
    );
  }
  const hour = rateLimit(`post:prayer:user:${author.userId}:1h`, 30, 60 * 60_000);
  if (!hour.ok) {
    return NextResponse.json(
      { error: "Daily post limit reached. Try again later." },
      { status: 429, headers: { "Retry-After": String(hour.retryAfter) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const prayerRequest = await prisma.prayerRequest.create({
    data: {
      content: parsed.data.content.trim(),
      /** Server-side source of truth — we never trust a client-supplied name. */
      authorName: author.displayName,
      userId: author.userId,
    },
  });

  return NextResponse.json(prayerRequest);
}
