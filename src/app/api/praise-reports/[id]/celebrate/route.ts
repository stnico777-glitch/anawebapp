import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMMUNITY_VISITOR_COOKIE } from "@/lib/community-participant";
import {
  resolveWallParticipant,
  VISITOR_COOKIE_OPTS,
} from "@/lib/community-author";
import { rateLimit, rateLimitActor } from "@/lib/rate-limit";
import { requireMemberFromRequest } from "@/lib/auth";

async function snapshotForPraise(praiseReportId: string, participantKey: string) {
  const [count, row] = await Promise.all([
    prisma.praiseReportLike.count({ where: { praiseReportId } }),
    prisma.praiseReportLike.findUnique({
      where: { praiseReportId_participantKey: { praiseReportId, participantKey } },
    }),
  ]);
  return {
    count,
    viewerCelebrated: !!row,
  };
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireMemberFromRequest(req);
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const { participantKey, userId, visitorCookie } = await resolveWallParticipant(req);

  /** Anti-spam: 60 celebrates per minute per actor. */
  const actor = rateLimitActor(userId, req);
  const limit = rateLimit(`celebrate:${actor}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Slow down a moment — too many reactions too fast." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
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

  const existing = await prisma.praiseReportLike.findUnique({
    where: { praiseReportId_participantKey: { praiseReportId, participantKey } },
  });

  if (existing) {
    await prisma.praiseReportLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.praiseReportLike.create({
      data: { praiseReportId, userId, participantKey },
    });
  }

  const snapshot = await snapshotForPraise(praiseReportId, participantKey);
  const res = NextResponse.json({
    count: snapshot.count,
    viewerCelebrated: snapshot.viewerCelebrated,
  });
  if (visitorCookie) {
    res.cookies.set(COMMUNITY_VISITOR_COOKIE, visitorCookie, VISITOR_COOKIE_OPTS);
  }
  return res;
}
