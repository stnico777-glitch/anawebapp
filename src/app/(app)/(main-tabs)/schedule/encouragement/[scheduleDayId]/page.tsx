import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  resolveScheduleDayPlaceholderVideoUrl,
  resolveScheduleDayEncouragementVideoSrcSync,
} from "@/lib/schedule-day-movement-defaults";
import ScheduleDayEncouragementSession from "./ScheduleDayEncouragementSession";

export default async function ScheduleDayEncouragementPage({
  params,
}: {
  params: Promise<{ scheduleDayId: string }>;
}) {
  const { scheduleDayId } = await params;

  let day = null as Awaited<ReturnType<typeof prisma.scheduleDay.findUnique>>;
  try {
    day = await prisma.scheduleDay.findUnique({
      where: { id: scheduleDayId },
    });
  } catch {
    day = null;
  }
  if (!day) notFound();

  const placeholder = await resolveScheduleDayPlaceholderVideoUrl(prisma);
  const encouragementSrc = resolveScheduleDayEncouragementVideoSrcSync(day, placeholder);
  const encouragementPoster = day.dayImageUrl?.trim() || undefined;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-7xl flex-col justify-center bg-app-surface px-4 py-4 md:px-6 md:py-6">
      <ScheduleDayEncouragementSession
        scheduleDayId={day.id}
        src={encouragementSrc}
        poster={encouragementPoster}
      />
    </div>
  );
}
