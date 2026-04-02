import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidEncouragePresetKey } from "@/constants/community";
import {
  COMMUNITY_VISITOR_COOKIE,
  newVisitorId,
} from "@/lib/community-participant";
import { PrayerRequestInteractionKind } from "@prisma/client";

const bodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("PRAY") }),
  z.object({ kind: z.literal("LIKE") }),
  z.object({
    kind: z.literal("ENCOURAGE"),
    remove: z.boolean().optional(),
    presetKey: z.string().nullable().optional(),
    message: z.string().max(200).nullable().optional(),
  }),
]);

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

async function snapshotForPrayer(prayerRequestId: string, participantKey: string) {
  const [prayCount, likeCount, encourageCount, userRows] = await Promise.all([
    prisma.prayerRequestInteraction.count({
      where: { prayerRequestId, kind: PrayerRequestInteractionKind.PRAY },
    }),
    prisma.prayerRequestInteraction.count({
      where: { prayerRequestId, kind: PrayerRequestInteractionKind.LIKE },
    }),
    prisma.prayerRequestInteraction.count({
      where: { prayerRequestId, kind: PrayerRequestInteractionKind.ENCOURAGE },
    }),
    prisma.prayerRequestInteraction.findMany({
      where: { prayerRequestId, participantKey },
    }),
  ]);

  const prayOn = userRows.some((r) => r.kind === PrayerRequestInteractionKind.PRAY);
  const likeOn = userRows.some((r) => r.kind === PrayerRequestInteractionKind.LIKE);
  const enc = userRows.find((r) => r.kind === PrayerRequestInteractionKind.ENCOURAGE);
  return {
    counts: { pray: prayCount, like: likeCount, encourage: encourageCount },
    viewer: {
      pray: prayOn,
      like: likeOn,
      encourage: enc
        ? { presetKey: enc.presetKey, message: enc.message }
        : null,
    },
  };
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { participantKey, userId, visitorCookie } = await resolveParticipant(req);

  const { id: prayerRequestId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const exists = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.kind === "PRAY" || parsed.data.kind === "LIKE") {
    const kind =
      parsed.data.kind === "PRAY"
        ? PrayerRequestInteractionKind.PRAY
        : PrayerRequestInteractionKind.LIKE;
    const existing = await prisma.prayerRequestInteraction.findUnique({
      where: { prayerRequestId_participantKey_kind: { prayerRequestId, participantKey, kind } },
    });
    if (existing) {
      await prisma.prayerRequestInteraction.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.prayerRequestInteraction.create({
        data: {
          prayerRequestId,
          userId,
          participantKey,
          kind,
        },
      });
    }
  } else {
    const { remove, presetKey: rawPreset, message: rawMessage } = parsed.data;
    if (remove) {
      await prisma.prayerRequestInteraction.deleteMany({
        where: {
          prayerRequestId,
          participantKey,
          kind: PrayerRequestInteractionKind.ENCOURAGE,
        },
      });
    } else {
      const preset =
        rawPreset != null && rawPreset !== "" ? rawPreset.trim() : null;
      const message =
        rawMessage != null && rawMessage !== "" ? rawMessage.trim() : null;

      const presetOk = preset != null && isValidEncouragePresetKey(preset);
      if (preset != null && !presetOk) {
        return NextResponse.json({ error: "Invalid presetKey" }, { status: 400 });
      }
      if (!presetOk && (!message || message.length === 0)) {
        return NextResponse.json(
          { error: "Encourage requires a preset or a short message" },
          { status: 400 },
        );
      }

      await prisma.prayerRequestInteraction.upsert({
        where: {
          prayerRequestId_participantKey_kind: {
            prayerRequestId,
            participantKey,
            kind: PrayerRequestInteractionKind.ENCOURAGE,
          },
        },
        create: {
          prayerRequestId,
          userId,
          participantKey,
          kind: PrayerRequestInteractionKind.ENCOURAGE,
          presetKey: presetOk ? preset : null,
          message: message || null,
        },
        update: {
          presetKey: presetOk ? preset : null,
          message: message || null,
        },
      });
    }
  }

  const out = await snapshotForPrayer(prayerRequestId, participantKey);
  const res = NextResponse.json(out);
  if (visitorCookie) {
    res.cookies.set(COMMUNITY_VISITOR_COOKIE, visitorCookie, VISITOR_COOKIE_OPTS);
  }
  return res;
}
