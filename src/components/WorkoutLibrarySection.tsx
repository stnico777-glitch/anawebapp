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
  MovementHeroCollectionItemDTO,
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
  isSubscriber = false,
}: {
  movementLayout: MovementLayoutDTO;
  workouts: WorkoutRailCardWorkout[];
  completedWorkoutIds?: string[];
  isGuest?: boolean;
  /** Signed-in members only; ignored for guests (`isGuest`). */
  isSubscriber?: boolean;
}) {
  const router = useRouter();
  const movementLocked = isGuest || !isSubscriber;
  const lockHint = isGuest ? "Sign up to unlock" : "Subscribe to unlock";
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRailCardWorkout | null>(null);
  const [layoutVideo, setLayoutVideo] = useState<MovementLayoutVideoPayload | null>(null);

  const openPlayer = useCallback(
    (w: WorkoutRailCardWorkout) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      if (!isSubscriber) {
        router.push("/subscribe");
        return;
      }
      setActiveWorkout(w);
    },
    [isGuest, isSubscriber, router],
  );

  const closePlayer = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const closeLayoutVideo = useCallback(() => {
    setLayoutVideo(null);
  }, []);

  /** Legacy single-video hero tile (pre-collection data shape). Only reachable when
   *  the primary hero tile has zero items; otherwise the 6-card grid is rendered instead. */
  const onPlayHeroTile = useCallback(
    (tile: MovementHeroTileDTO) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      if (!isSubscriber) {
        router.push("/subscribe");
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
    [isGuest, isSubscriber, router],
  );

  const onPlayCollectionItem = useCallback(
    (item: MovementHeroCollectionItemDTO) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      if (!isSubscriber) {
        router.push("/subscribe");
        return;
      }
      const url = item.videoUrl?.trim();
      if (!url) return;
      setLayoutVideo({
        title: item.title,
        subtitle: `Day ${item.dayIndex}`,
        videoUrl: url,
        poster: item.imageUrl,
      });
    },
    [isGuest, isSubscriber, router],
  );

  const onPlayQuickie = useCallback(
    (card: MovementQuickieCardDTO) => {
      if (isGuest) {
        router.push("/register");
        return;
      }
      if (!isSubscriber) {
        router.push("/subscribe");
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
    [isGuest, isSubscriber, router],
  );

  const libraryHidden = activeWorkout !== null || layoutVideo !== null;

  return (
    <>
      <div className={libraryHidden ? "hidden" : undefined} aria-hidden={libraryHidden}>
        <WorkoutLibraryShell
          movementLayout={movementLayout}
          onPlayHeroTile={onPlayHeroTile}
          onPlayCollectionItem={onPlayCollectionItem}
          onPlayQuickie={onPlayQuickie}
          isGuest={isGuest}
          contentLocked={movementLocked}
          lockHint={lockHint}
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
                  showLock={movementLocked}
                  railLockHint={lockHint}
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
