import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";

/** Serialized workout row for Library rail (member app + CMS preview). */
export type WorkoutRailCardWorkout = {
  id: string;
  title: string;
  duration: number;
  category: string | null;
  scripture: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
};

export function workoutRailThumb(w: WorkoutRailCardWorkout): string {
  if (w.thumbnailUrl?.trim()) return w.thumbnailUrl.trim();
  let h = 0;
  for (let i = 0; i < w.id.length; i++) h = (h + w.id.charCodeAt(i)) % 997;
  return WEEKLY_DAY_CARD_IMAGES[h % WEEKLY_DAY_CARD_IMAGES.length];
}

export function workoutRailMetaLine(w: WorkoutRailCardWorkout): string {
  return [w.category ?? "Session", `${w.duration} min`].filter(Boolean).join(" · ");
}

/** Member-facing hover copy (no CMS-only hints). */
export function memberWorkoutRailHoverSummary(w: WorkoutRailCardWorkout): string {
  const parts = [
    w.category ? `${w.category} · ${w.duration} min` : `${w.duration} min`,
    w.scripture ? w.scripture : null,
  ].filter(Boolean);
  return parts.join(". ") + ".";
}

/** CMS rail preview: same base copy plus how to preview the player. */
export function adminWorkoutRailHoverSummary(w: WorkoutRailCardWorkout): string {
  const parts = [
    w.category ? `${w.category} · ${w.duration} min` : `${w.duration} min`,
    w.scripture ? w.scripture : null,
    "Tap the image to preview the member player.",
  ].filter(Boolean);
  return parts.join(". ") + ".";
}
