"use client";

import { FormStyleRailButton, FormStyleRailCard } from "@/components/LibraryBannerStrip";
import {
  memberWorkoutRailHoverSummary,
  workoutRailMetaLine,
  workoutRailThumb,
  type WorkoutRailCardWorkout,
} from "@/lib/workout-rail-display";

export default function MemberWorkoutRailCard({
  workout,
  onSelect,
  selected,
  showDone,
}: {
  workout: WorkoutRailCardWorkout;
  onSelect?: (workout: WorkoutRailCardWorkout) => void;
  selected?: boolean;
  showDone?: boolean;
}) {
  const src = workoutRailThumb(workout);
  const unoptimized = src.startsWith("http://") || src.startsWith("https://");

  if (onSelect) {
    return (
      <FormStyleRailButton
        onClick={() => onSelect(workout)}
        src={src}
        alt=""
        title={workout.title}
        metaLine={workoutRailMetaLine(workout)}
        hoverSummary={memberWorkoutRailHoverSummary(workout)}
        unoptimized={unoptimized}
        showDone={showDone}
        active={selected}
      />
    );
  }

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
