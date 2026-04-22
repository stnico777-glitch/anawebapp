import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest, requireMemberFromRequest } from "@/lib/auth";

const patchSchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; commentId: string }> },
) {
  const gate = await requireMemberFromRequest(req);
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const user = gate.user;

  const { id, commentId } = await ctx.params;
  const existing = await prisma.prayerRequestComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, prayerRequestId: true },
  });
  if (!existing || existing.prayerRequestId !== id) {
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

  const updated = await prisma.prayerRequestComment.update({
    where: { id: commentId },
    data: { body: parsed.data.body.trim() },
    select: { id: true, authorName: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    comment: {
      id: updated.id,
      authorName: updated.authorName,
      body: updated.body,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; commentId: string }> },
) {
  const user = await requireAuthFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await ctx.params;
  const existing = await prisma.prayerRequestComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, prayerRequestId: true },
  });
  if (!existing || existing.prayerRequestId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== user.id && !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.prayerRequestComment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
