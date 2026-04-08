"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import WorkoutLibraryShell from "@/components/WorkoutLibraryShell";
import MemberWorkoutRailCard from "@/components/MemberWorkoutRailCard";
import MovementWorkoutPlayerOverlay from "@/components/MovementWorkoutPlayerOverlay";
import MovementLayoutVideoOverlay, {
  type MovementLayoutVideoPayload,
} from "@/components/MovementLayoutVideoOverlay";
import { RAIL_CARD_WIDTH } from "@/components/LibraryBannerStrip";
import type {
  MovementHeroTileDTO,
  MovementLayoutDTO,
  MovementQuickieCardDTO,
} from "@/lib/movement-layout-types";
import type { WorkoutRailCardWorkout } from "@/lib/workout-rail-display";

export default function WorkoutLibrarySection({
  movementLayout,
  workouts,
  completedWorkoutIds = [],
  isGuest = false,
}: {
  movementLayout: MovementLayoutDTO;
  workouts: WorkoutRailCardWorkout[];
  completedWorkoutIds?: string[];
  isGuest?: boolean;
}) {
  const router = useRouter();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRailCardWorkout | null>(null);
  const [layoutVideo, setLayoutVideo] = useState<MovementLayoutVideoPayload | null>(null);

  const openPlayer = useCallback(
    (w: WorkoutRailCardWorkout) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      setActiveWorkout(w);
    },
    [isGuest, router],
  );

  const closePlayer = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const closeLayoutVideo = useCallback(() => {
    setLayoutVideo(null);
  }, []);

  const onPlayHeroTile = useCallback(
    (tile: MovementHeroTileDTO) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      const url = tile.videoUrl?.trim();
      if (!url) return;
      setLayoutVideo({
        title: tile.title,
        subtitle: tile.subtitle,
        videoUrl: url,
        poster: tile.imageUrl,
      });
    },
    [isGuest, router],
  );

  const onPlayQuickie = useCallback(
    (card: MovementQuickieCardDTO) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      const url = card.videoUrl?.trim();
      if (!url) return;
      setLayoutVideo({
        title: card.title,
        subtitle: card.metaLine,
        videoUrl: url,
        poster: card.imageUrl,
      });
    },
    [isGuest, router],
  );

  const libraryHidden = activeWorkout !== null || layoutVideo !== null;

  return (
    <>
      <div className={libraryHidden ? "hidden" : undefined} aria-hidden={libraryHidden}>
        <WorkoutLibraryShell
          movementLayout={movementLayout}
          onPlayHeroTile={onPlayHeroTile}
          onPlayQuickie={onPlayQuickie}
          isGuest={isGuest}
          railImageLoading="eager"
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
              workouts.map((w, index) => (
                <MemberWorkoutRailCard
                  key={w.id}
                  workout={w}
                  onSelect={openPlayer}
                  selected={activeWorkout?.id === w.id}
                  showDone={completedWorkoutIds.includes(w.id)}
                  showLock={isGuest}
                  imagePriority={index < 2}
                />
              ))
            )
          }
        />
      </div>

      {activeWorkout ? (
        <MovementWorkoutPlayerOverlay
          workout={activeWorkout}
          isCompleted={completedWorkoutIds.includes(activeWorkout.id)}
          onClose={closePlayer}
        />
      ) : null}

      {layoutVideo ? (
        <MovementLayoutVideoOverlay payload={layoutVideo} onClose={closeLayoutVideo} />
      ) : null}
    </>
  );
}
