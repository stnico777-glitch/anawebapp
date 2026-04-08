"use client";

import { useCallback, useState } from "react";
import WorkoutLibraryShell from "@/components/WorkoutLibraryShell";
import MovementLayoutVideoOverlay, {
  type MovementLayoutVideoPayload,
} from "@/components/MovementLayoutVideoOverlay";
import { RAIL_CARD_WIDTH } from "@/components/LibraryBannerStrip";
import type {
  MovementHeroTileDTO,
  MovementLayoutDTO,
  MovementQuickieCardDTO,
} from "@/lib/movement-layout-types";
import AdminWorkoutRailCard, {
  type AdminWorkoutRailCardWorkout,
} from "./AdminWorkoutRailCard";
import WorkoutForm from "./WorkoutForm";
import MovementLandingCopyForm from "./MovementLandingCopyForm";
import MovementHeroTileForm from "./MovementHeroTileForm";
import MovementQuickieCardForm from "./MovementQuickieCardForm";
import AdminMovementHeroTileCard from "./AdminMovementHeroTileCard";
import AdminMovementQuickieRailCard from "./AdminMovementQuickieRailCard";

const addTriggerClass =
  "shrink-0 rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

export default function WorkoutLibraryAdminView({
  workouts,
  movementLayout,
}: {
  workouts: AdminWorkoutRailCardWorkout[];
  movementLayout: MovementLayoutDTO;
}) {
  const [layoutPreview, setLayoutPreview] = useState<MovementLayoutVideoPayload | null>(null);

  const previewHero = useCallback((tile: MovementHeroTileDTO) => {
    const url = tile.videoUrl?.trim();
    if (!url) return;
    setLayoutPreview({
      title: tile.title,
      subtitle: tile.subtitle,
      videoUrl: url,
      poster: tile.imageUrl,
    });
  }, []);

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

  const heroSectionBody =
    movementLayout.heroTiles.length === 0 ? (
      <p className="col-span-full px-4 py-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
        No hero tiles yet. Use <strong className="font-semibold text-foreground">Add hero tile</strong>.
      </p>
    ) : (
      movementLayout.heroTiles.map((t) => (
        <AdminMovementHeroTileCard key={t.id} tile={t} onPreviewPlay={previewHero} />
      ))
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
            <MovementHeroTileForm triggerLabel="Add hero tile" triggerClassName={addTriggerClass} />
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
