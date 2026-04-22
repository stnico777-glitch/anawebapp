import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveWallAuthor } from "@/lib/community-author";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuthFromRequest, requireMemberFromRequest } from "@/lib/auth";

const postBodySchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: praiseReportId } = await ctx.params;
  const exists = await prisma.praiseReport.findUnique({
    where: { id: praiseReportId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const viewer = await requireAuthFromRequest(req);

  const rows = await prisma.praiseReportComment.findMany({
    where: { praiseReportId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      authorName: true,
      body: true,
      createdAt: true,
      userId: true,
    },
  });

  return NextResponse.json({
    comments: rows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      ownedByViewer: Boolean(viewer && r.userId && r.userId === viewer.id),
    })),
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireMemberFromRequest(req);
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const author = await resolveWallAuthor(req);
  if (!author) {
    return NextResponse.json(
      { error: "Sign in to comment." },
      { status: 401 },
    );
  }

  /** Per-user: 10 comments per minute, 120 per hour. */
  const minute = rateLimit(`comment:praise:user:${author.userId}:1m`, 10, 60_000);
  if (!minute.ok) {
    return NextResponse.json(
      { error: "You're commenting a lot — take a breath and try again in a moment." },
      { status: 429, headers: { "Retry-After": String(minute.retryAfter) } },
    );
  }
  const hour = rateLimit(`comment:praise:user:${author.userId}:1h`, 120, 60 * 60_000);
  if (!hour.ok) {
    return NextResponse.json(
      { error: "Comment limit reached. Try again later." },
      { status: 429, headers: { "Retry-After": String(hour.retryAfter) } },
    );
  }

  const { id: praiseReportId } = await ctx.params;
  const exists = await prisma.praiseReport.findUnique({
    where: { id: praiseReportId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = postBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await prisma.praiseReportComment.create({
    data: {
      praiseReportId,
      participantKey: `user:${author.userId}`,
      userId: author.userId,
      /** Server-side source of truth — ignore any client-supplied name. */
      authorName: author.displayName,
      body: parsed.data.body.trim(),
    },
    select: { id: true, authorName: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    comment: {
      id: created.id,
      authorName: created.authorName,
      body: created.body,
      createdAt: created.createdAt.toISOString(),
      ownedByViewer: true,
    },
  });
}
