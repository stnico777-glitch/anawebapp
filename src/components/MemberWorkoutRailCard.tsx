"use client";

import { FormStyleRailCard } from "@/components/LibraryBannerStrip";
import {
  memberWorkoutRailHoverSummary,
  workoutRailMetaLine,
  workoutRailThumb,
  type WorkoutRailCardWorkout,
} from "@/lib/workout-rail-display";

export default function MemberWorkoutRailCard({ workout }: { workout: WorkoutRailCardWorkout }) {
  const src = workoutRailThumb(workout);
  const unoptimized = src.startsWith("http://") || src.startsWith("https://");
  return (
    <FormStyleRailCard
      href={`/movement/${workout.id}`}
      src={src}
      alt=""
      title={workout.title}
      metaLine={workoutRailMetaLine(workout)}
      hoverSummary={memberWorkoutRailHoverSummary(workout)}
      unoptimized={unoptimized}
    />
  );
}
