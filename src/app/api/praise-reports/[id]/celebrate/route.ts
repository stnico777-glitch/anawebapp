import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  COMMUNITY_VISITOR_COOKIE,
  newVisitorId,
} from "@/lib/community-participant";

const VISITOR_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

async function resolveParticipant(req: NextRequest): Promise<{
  participantKey: string;
  userId: string | null;
  visitorCookie: string | null;
}> {
  const session = await auth();
  if (session?.user?.id) {
    return {
      participantKey: `user:${session.user.id}`,
      userId: session.user.id,
      visitorCookie: null,
    };
  }
  let vid = req.cookies.get(COMMUNITY_VISITOR_COOKIE)?.value ?? null;
  if (!vid) {
    vid = newVisitorId();
    return { participantKey: `v:${vid}`, userId: null, visitorCookie: vid };
  }
  return { participantKey: `v:${vid}`, userId: null, visitorCookie: null };
}

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
  const { participantKey, userId, visitorCookie } = await resolveParticipant(req);

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
