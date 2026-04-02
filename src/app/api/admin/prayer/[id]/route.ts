import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<
  { params: Promise<{ id: string }> }
>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { title, description, scripture, audioUrl, duration, coverImageUrl } = body;

  const prayer = await prisma.prayerAudio.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      ...(description != null && { description }),
      ...(scripture != null && { scripture }),
      ...(audioUrl != null && { audioUrl }),
      ...(duration != null && { duration: parseInt(String(duration), 10) }),
      ...(coverImageUrl !== undefined && {
        coverImageUrl:
          coverImageUrl != null && String(coverImageUrl).trim()
            ? String(coverImageUrl).trim()
            : null,
      }),
    },
  });

  return NextResponse.json(prayer);
});

export const DELETE = withAdmin<
  { params: Promise<{ id: string }> }
>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.prayerAudio.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
