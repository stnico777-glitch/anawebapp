import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest, requireMemberFromRequest } from "@/lib/auth";

const patchSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireMemberFromRequest(req);
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const user = gate.user;

  const { id } = await ctx.params;
  const existing = await prisma.prayerRequest.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.prayerRequest.update({
    where: { id },
    data: { content: parsed.data.content.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireAuthFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.prayerRequest.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.prayerRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
