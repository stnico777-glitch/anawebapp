"use client";

import WorkoutLibraryShell from "@/components/WorkoutLibraryShell";
import MemberWorkoutRailCard from "@/components/MemberWorkoutRailCard";
import { RAIL_CARD_WIDTH } from "@/components/LibraryBannerStrip";
import type { MovementLayoutDTO } from "@/lib/movement-layout-types";
import type { WorkoutRailCardWorkout } from "@/lib/workout-rail-display";

export default function WorkoutLibrarySection({
  movementLayout,
  workouts,
}: {
  movementLayout: MovementLayoutDTO;
  workouts: WorkoutRailCardWorkout[];
}) {
  return (
    <WorkoutLibraryShell
      movementLayout={movementLayout}
      libraryRail={
        workouts.length === 0 ? (
          <div
            className={`flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col items-center justify-center rounded-none border border-dashed border-sand bg-white/90 p-8 text-center [font-family:var(--font-body),sans-serif]`}
            style={{ scrollSnapAlign: "start" }}
          >
            <p className="text-sm leading-relaxed text-gray">
              No sessions in the library yet. Check back soon.
            </p>
          </div>
        ) : (
          workouts.map((w) => <MemberWorkoutRailCard key={w.id} workout={w} />)
        )
      }
    />
  );
}
