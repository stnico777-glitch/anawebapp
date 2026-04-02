import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async () => {
  const prayers = await prisma.prayerAudio.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prayers);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, description, scripture, audioUrl, duration, coverImageUrl } = body;
  if (!title || !audioUrl || duration == null) {
    return NextResponse.json(
      { error: "title, audioUrl, and duration required" },
      { status: 400 }
    );
  }

  const prayer = await prisma.prayerAudio.create({
    data: {
      title,
      description: description || null,
      scripture: scripture || null,
      audioUrl,
      duration: parseInt(String(duration), 10),
      coverImageUrl: coverImageUrl != null && String(coverImageUrl).trim() ? String(coverImageUrl).trim() : null,
    },
  });

  return NextResponse.json(prayer);
});
