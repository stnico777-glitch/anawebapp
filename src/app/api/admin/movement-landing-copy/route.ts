import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MOVEMENT_LANDING_COPY } from "@/lib/movement-layout-defaults";

export const PATCH = withAdmin(async (_, request) => {
  const body = await request.json();
  const { justStartedTagline, quickieIntro } = body;
  const existing = await prisma.movementLandingCopy.findUnique({ where: { id: "main" } });
  const j =
    justStartedTagline != null
      ? String(justStartedTagline)
      : (existing?.justStartedTagline ?? DEFAULT_MOVEMENT_LANDING_COPY.justStartedTagline);
  const q =
    quickieIntro != null
      ? String(quickieIntro)
      : (existing?.quickieIntro ?? DEFAULT_MOVEMENT_LANDING_COPY.quickieIntro);
  await prisma.movementLandingCopy.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      justStartedTagline: j,
      quickieIntro: q,
    },
    update: {
      ...(justStartedTagline != null && { justStartedTagline: j }),
      ...(quickieIntro != null && { quickieIntro: q }),
    },
  });
  return NextResponse.json({ ok: true });
});
