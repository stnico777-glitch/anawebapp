import { getWeekScheduleForMonday } from "@/lib/schedule";
import { publicJson, publicOptions } from "@/lib/public-json";

export async function OPTIONS() {
  return publicOptions();
}

/** Mobile / external clients: current or chosen week (Monday in `weekStart` query, ISO date). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("weekStart");
  const anchor = raw ? new Date(raw) : new Date();
  if (Number.isNaN(anchor.getTime())) {
    return publicJson({ error: "Invalid weekStart" }, 400);
  }
  const week = await getWeekScheduleForMonday(anchor);
  if (!week) {
    return publicJson({ week: null });
  }
  return publicJson({
    week: {
      id: week.id,
      weekStart: week.weekStart.toISOString(),
      days: week.days.map((d) => ({
        id: d.id,
        dayIndex: d.dayIndex,
        prayerTitle: d.prayerTitle,
        prayerId: d.prayerId,
        workoutTitle: d.workoutTitle,
        workoutId: d.workoutId,
        affirmationText: d.affirmationText,
        dayImageUrl: d.dayImageUrl,
        dayVideoUrl: d.dayVideoUrl,
        daySubtext: d.daySubtext,
      })),
    },
  });
}
