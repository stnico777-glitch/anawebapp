"use client";

import { FormStyleRailButton, FormStyleRailCard } from "@/components/LibraryBannerStrip";
import {
  memberWorkoutRailHoverSummary,
  workoutRailMetaLine,
  workoutRailThumb,
  type WorkoutRailCardWorkout,
} from "@/lib/workout-rail-display";
import { unoptimizedRemoteImage } from "@/lib/remote-image";

export default function MemberWorkoutRailCard({
  workout,
  onSelect,
  selected,
  showDone,
  showLock = false,
  /** First visible rail cards: eager fetch for LCP without starving the whole row. */
  imagePriority = false,
}: {
  workout: WorkoutRailCardWorkout;
  onSelect?: (workout: WorkoutRailCardWorkout) => void;
  selected?: boolean;
  showDone?: boolean;
  showLock?: boolean;
  imagePriority?: boolean;
}) {
  const src = workoutRailThumb(workout);
  const unoptimized = unoptimizedRemoteImage(src);

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
        showLock={showLock}
        lockHint={showLock ? "Sign up to unlock" : undefined}
        active={selected}
        imageLoading="eager"
        imagePriority={imagePriority}
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
      imageLoading="eager"
      imagePriority={imagePriority}
    />
  );
}
