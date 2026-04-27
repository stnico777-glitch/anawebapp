"use client";

import PrayerAudioLibraryShell from "@/components/PrayerAudioLibraryShell";
import {
  PrayerLibraryAudioProvider,
  PrayerLibraryLayoutPadding,
  PrayerMiniPlayerBar,
} from "@/app/(app)/(main-tabs)/prayer/PrayerLibraryAudioContext";
import {
  AUDIO_COLLECTION_CATEGORIES,
  type AudioCollectionCardDTO,
  type AudioCollectionCategory,
} from "@/lib/audio-layout-types";
import type { ReactNode } from "react";
import AudioCollectionForm from "./AudioCollectionForm";
import AdminAudioCollectionRailCard from "./AdminAudioCollectionRailCard";
import AdminAudioGridTile from "./AdminAudioGridTile";

const addTriggerClass =
  "shrink-0 rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

function PrayerAudioLibraryAdminViewInner({
  layout,
}: {
  layout: { collections: AudioCollectionCardDTO[] };
}) {
  /** One rail body per category for the admin view: shows existing cards in that category with
   *  edit/delete affordances, and an "Add" button toolbar that pre-selects the right category. */
  const collectionsRailByCategory: Partial<Record<AudioCollectionCategory, ReactNode>> = {};
  const collectionsToolbarByCategory: Partial<Record<AudioCollectionCategory, ReactNode>> = {};
  for (const category of AUDIO_COLLECTION_CATEGORIES) {
    const cardsInCategory = layout.collections.filter((c) => c.category === category);
    /** Scripture Reading uses banner tiles in a 2x2 grid (matching the member view); the
     *  other rails use the portrait FORM-style cards in a horizontal carousel. Both variants
     *  carry an Edit + Delete control overlaid on the image. */
    const TileComponent =
      category === "SCRIPTURE_READING" ? AdminAudioGridTile : AdminAudioCollectionRailCard;
    collectionsRailByCategory[category] =
      cardsInCategory.length === 0 ? (
        <p className="px-1 py-6 text-sm text-gray [font-family:var(--font-body),sans-serif]">
          No cards yet in this row. Use the <strong className="font-semibold text-foreground">Add</strong> button above.
        </p>
      ) : (
        cardsInCategory.map((c) => <TileComponent key={c.id} card={c} />)
      );
    collectionsToolbarByCategory[category] = (
      <AudioCollectionForm
        defaultCategory={category}
        triggerLabel="Add card"
        triggerClassName={addTriggerClass}
      />
    );
  }

  return (
    <PrayerLibraryLayoutPadding>
      <div className="-mx-4 md:-mx-6">
        <PrayerAudioLibraryShell
          compactTop
          collectionsToolbarByCategory={collectionsToolbarByCategory}
          collectionCards={layout.collections}
          collectionsRailByCategory={collectionsRailByCategory}
        />
      </div>
      {/* Mini-player kept so future card-preview-on-click works without re-wiring providers. */}
      <PrayerMiniPlayerBar />
    </PrayerLibraryLayoutPadding>
  );
}

export default function PrayerAudioLibraryAdminView(props: {
  layout: { collections: AudioCollectionCardDTO[] };
}) {
  return (
    <PrayerLibraryAudioProvider>
      <PrayerAudioLibraryAdminViewInner {...props} />
    </PrayerLibraryAudioProvider>
  );
}
