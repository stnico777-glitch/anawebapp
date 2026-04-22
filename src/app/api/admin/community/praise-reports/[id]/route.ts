import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Cascade deletes likes + comments (configured in the Prisma schema). */
export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(
  async (_, _request, { params }) => {
    const { id } = await params;
    const existing = await prisma.praiseReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Praise report not found" }, { status: 404 });
    }
    await prisma.praiseReport.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  },
);
