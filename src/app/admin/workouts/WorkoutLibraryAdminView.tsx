"use client";

import { useCallback, useState } from "react";
import WorkoutLibraryShell from "@/components/WorkoutLibraryShell";
import MovementLayoutVideoOverlay, {
  type MovementLayoutVideoPayload,
} from "@/components/MovementLayoutVideoOverlay";
import { RAIL_CARD_WIDTH } from "@/components/LibraryBannerStrip";
import type {
  MovementHeroCollectionItemDTO,
  MovementLayoutDTO,
  MovementQuickieCardDTO,
} from "@/lib/movement-layout-types";
import AdminWorkoutRailCard, {
  type AdminWorkoutRailCardWorkout,
} from "./AdminWorkoutRailCard";
import WorkoutForm from "./WorkoutForm";
import MovementLandingCopyForm from "./MovementLandingCopyForm";
import MovementHeroCollectionItemForm from "./MovementHeroCollectionItemForm";
import MovementQuickieCardForm from "./MovementQuickieCardForm";
import AdminMovementHeroTileCard from "./AdminMovementHeroTileCard";
import AdminMovementQuickieRailCard from "./AdminMovementQuickieRailCard";

const addTriggerClass =
  "shrink-0 rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

/** Mirrors the member "Just Getting Started" section for admins:
 *  - Section heading + tagline (editable via `MovementLandingCopyForm`)
 *  - 6-item grid of collection days (2 rows × 3 cols, row-major) with Edit/Delete overlays
 *    and an onClick preview that plays the item's video in the overlay — same as members see.
 *  - "Add day" toolbar button creates a new item under the singleton hero tile.
 *  Parent hero tile metadata (title/subtitle/image) still lives in the DB but is intentionally
 *  hidden here — it no longer drives any member-facing visual, so we don't ask admins to fill it.
 */
export default function WorkoutLibraryAdminView({
  workouts,
  movementLayout,
}: {
  workouts: AdminWorkoutRailCardWorkout[];
  movementLayout: MovementLayoutDTO;
}) {
  const [layoutPreview, setLayoutPreview] = useState<MovementLayoutVideoPayload | null>(null);

  const previewItem = useCallback(
    (item: MovementHeroCollectionItemDTO) => {
      const url = item.videoUrl?.trim();
      if (!url) return;
      setLayoutPreview({
        title: item.title,
        subtitle: `Day ${item.dayIndex}`,
        videoUrl: url,
        poster: item.imageUrl,
      });
    },
    [],
  );

  const previewQuickie = useCallback((card: MovementQuickieCardDTO) => {
    const url = card.videoUrl?.trim();
    if (!url) return;
    setLayoutPreview({
      title: card.title,
      subtitle: card.metaLine,
      videoUrl: url,
      poster: card.imageUrl,
    });
  }, []);

  const primaryTile = movementLayout.heroTiles[0] ?? null;
  const items = primaryTile?.items ?? [];
  /** When there are gaps (e.g. admin deleted Day 3), prefill the next "Add day" to the
   *  lowest unused slot starting at 1. Falls back to `items.length + 1` if the series is clean. */
  const usedDayIndices = new Set(items.map((i) => i.dayIndex));
  let nextDayIndex = items.length + 1;
  for (let d = 1; d <= Math.max(items.length + 1, 6); d++) {
    if (!usedDayIndices.has(d)) {
      nextDayIndex = d;
      break;
    }
  }

  const heroSectionBody = !primaryTile ? (
    <p className="rounded-md border border-dashed border-sand bg-white/80 px-4 py-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
      No collection yet. Click{" "}
      <strong className="font-semibold text-foreground">Add day</strong> above to create the
      first day of the series.
    </p>
  ) : items.length === 0 ? (
    <p className="rounded-md border border-dashed border-sand bg-white/80 px-4 py-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
      No days in this collection yet. Use{" "}
      <strong className="font-semibold text-foreground">Add day</strong> to build Day 1..Day N.
    </p>
  ) : (
    <div className="grid w-full grid-cols-3 grid-rows-2 gap-0">
      {items.map((item, idx) => (
        <AdminMovementHeroTileCard
          key={item.id}
          tile={primaryTile}
          item={item}
          onPreviewPlay={previewItem}
          imagePriority={idx < 2}
        />
      ))}
    </div>
  );

  const quickieRail =
    movementLayout.quickieCards.length === 0 ? (
      <p className="px-1 py-6 text-sm text-gray [font-family:var(--font-body),sans-serif]">
        No Quickie cards yet. Use <strong className="font-semibold text-foreground">Add Quickie card</strong>.
      </p>
    ) : (
      movementLayout.quickieCards.map((c) => (
        <AdminMovementQuickieRailCard key={c.id} card={c} onPreviewPlay={previewQuickie} />
      ))
    );

  return (
    <div className="-mx-4 md:-mx-6">
      <WorkoutLibraryShell
        compactTop
        libraryHeadingId="cms-movement-library-heading"
        movementLayout={movementLayout}
        libraryToolbar={
          <WorkoutForm triggerLabel="Add movement" triggerClassName={addTriggerClass} />
        }
        libraryRail={
          workouts.length === 0 ? (
            <div
              className={`flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col items-center justify-center rounded-none border border-dashed border-sand bg-white/90 p-8 text-center [font-family:var(--font-body),sans-serif]`}
              style={{ scrollSnapAlign: "start" }}
            >
              <p className="text-sm leading-relaxed text-gray">
                No sessions in the library yet. Use{" "}
                <strong className="font-semibold text-foreground">Add movement</strong> to create one — it will show
                here and in the member app.
              </p>
            </div>
          ) : (
            workouts.map((w) => <AdminWorkoutRailCard key={w.id} workout={w} />)
          )
        }
        justStartedToolbar={
          <>
            <MovementLandingCopyForm copy={movementLayout.copy} triggerLabel="Edit section copy" />
            {primaryTile ? (
              <MovementHeroCollectionItemForm
                heroTileId={primaryTile.id}
                nextDayIndex={nextDayIndex}
                triggerLabel="Add day"
                triggerClassName={addTriggerClass}
              />
            ) : null}
          </>
        }
        heroSectionBody={heroSectionBody}
        quickieToolbar={
          <MovementQuickieCardForm triggerLabel="Add Quickie card" triggerClassName={addTriggerClass} />
        }
        quickieRail={quickieRail}
      />

      {layoutPreview ? (
        <MovementLayoutVideoOverlay payload={layoutPreview} onClose={() => setLayoutPreview(null)} />
      ) : null}
    </div>
  );
}
