import type { PrismaClient } from "@prisma/client";
import { MOVEMENT_SAMPLE_VIDEO_URL } from "@/lib/movement-layout-defaults";

/**
 * Same resolution as `/schedule/movement/[scheduleDayId]` — use with a single
 * `placeholderFallback` from `resolveScheduleDayPlaceholderVideoUrl` when batching.
 */
export function resolveScheduleDayMovementVideoSrcSync(
  day: { dayVideoUrl: string | null },
  workoutVideoUrl: string | null | undefined,
  placeholderFallback: string,
): string {
  const from = (day.dayVideoUrl?.trim() || workoutVideoUrl?.trim() || "").trim();
  return from || placeholderFallback;
}

/**
 * Encouragement step video before the workout. Uses CMS URL or the same placeholder chain as the workout.
 */
export function resolveScheduleDayEncouragementVideoSrcSync(
  day: { movementEncouragementVideoUrl: string | null },
  placeholderFallback: string,
): string {
  const from = day.movementEncouragementVideoUrl?.trim() || "";
  return from || placeholderFallback;
}

/**
 * Fallback MP4 when a schedule day has no CMS `dayVideoUrl` and no linked workout `videoUrl`.
 *
 * 1. `NEXT_PUBLIC_SCHEDULE_DAY_PLACEHOLDER_VIDEO_URL` (e.g. Supabase public URL)
 * 2. Library workout titled **HIIT Burn** (`videoUrl` in CMS/DB)
 * 3. `MOVEMENT_SAMPLE_VIDEO_URL`
 */
export async function resolveScheduleDayPlaceholderVideoUrl(
  prisma: PrismaClient,
): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SCHEDULE_DAY_PLACEHOLDER_VIDEO_URL?.trim();
  if (fromEnv) return fromEnv;
  try {
    const hiit = await prisma.workout.findFirst({
      where: { title: "HIIT Burn" },
      select: { videoUrl: true },
    });
    if (hiit?.videoUrl?.trim()) return hiit.videoUrl.trim();
  } catch {
    /* ignore */
  }
  return MOVEMENT_SAMPLE_VIDEO_URL;
}
