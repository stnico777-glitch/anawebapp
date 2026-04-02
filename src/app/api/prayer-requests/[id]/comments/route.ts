import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
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

const postBodySchema = z.object({
  body: z.string().min(1).max(2000),
  authorName: z.string().max(80).optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: prayerRequestId } = await ctx.params;
  const exists = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await prisma.prayerRequestComment.findMany({
    where: { prayerRequestId },
    orderBy: { createdAt: "asc" },
    select: { id: true, authorName: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    comments: rows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { participantKey, userId, visitorCookie } = await resolveParticipant(req);
  const { id: prayerRequestId } = await ctx.params;

  const exists = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
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

  const session = await auth();
  const trimmedName = parsed.data.authorName?.trim() ?? "";
  const fromSession =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0]?.trim() ||
    "";
  const authorName = (trimmedName || fromSession || "Anonymous").slice(0, 80);

  const created = await prisma.prayerRequestComment.create({
    data: {
      prayerRequestId,
      participantKey,
      userId,
      authorName,
      body: parsed.data.body.trim(),
    },
    select: { id: true, authorName: true, body: true, createdAt: true },
  });

  const res = NextResponse.json({
    comment: {
      id: created.id,
      authorName: created.authorName,
      body: created.body,
      createdAt: created.createdAt.toISOString(),
    },
  });
  if (visitorCookie) {
    res.cookies.set(COMMUNITY_VISITOR_COOKIE, visitorCookie, VISITOR_COOKIE_OPTS);
  }
  return res;
}
