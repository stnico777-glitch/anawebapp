import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ success: true }); // no-op when not logged in

  const { id } = await params;
  const prayer = await prisma.prayerAudio.findUnique({ where: { id } });
  if (!prayer) {
    return NextResponse.json({ error: "Prayer not found" }, { status: 404 });
  }

  await prisma.userPrayerCompletion.upsert({
    where: {
      userId_prayerId: { userId: user.id, prayerId: id },
    },
    update: { completedAt: new Date() },
    create: {
      userId: user.id,
      prayerId: id,
    },
  });

  return NextResponse.json({ success: true });
}
