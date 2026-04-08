"use client";

import { useCallback, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import PrayerAudioLibraryShell from "@/components/PrayerAudioLibraryShell";
import {
  PrayerLibraryAudioProvider,
  PrayerLibraryLayoutPadding,
  PrayerMiniPlayerBar,
  usePrayerLibraryAudio,
} from "./PrayerLibraryAudioContext";
import PrayerLibraryCompletionBridge from "./PrayerLibraryCompletionBridge";
import { FormStyleRailButton, GEAR_UP_CAROUSEL_ROW_CLASS } from "@/components/LibraryBannerStrip";
import {
  type PrayerLibraryItem,
  coverForPrayer,
  railCoversDeduped,
  prayerMetaLine,
  prayerHoverSummary,
} from "@/lib/prayer-audio-display";
import type {
  AudioCollectionCardDTO,
  AudioEssentialTileDTO,
  MusicSpotlightAlbumDTO,
} from "@/lib/audio-layout-types";

export type { PrayerLibraryItem };

type PrayerAudioLibraryProps = {
  prayers: PrayerLibraryItem[];
  completedIds: string[];
  isSubscriber: boolean;
  layout: {
    collections: AudioCollectionCardDTO[];
    essentials: AudioEssentialTileDTO[];
    spotlight: MusicSpotlightAlbumDTO[];
  };
};

function PrayerAudioLibraryInner({
  prayers,
  completedIds,
  isSubscriber,
  layout,
}: PrayerAudioLibraryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { setTrack, clearTrack } = usePrayerLibraryAudio();

  const selected = useMemo(
    () => (selectedId ? prayers.find((p) => p.id === selectedId) ?? null : null),
    [prayers, selectedId],
  );

  useLayoutEffect(() => {
    if (!selected) {
      clearTrack();
      return;
    }
    if (!isSubscriber) {
      clearTrack();
      return;
    }
    const idx = prayers.findIndex((x) => x.id === selected.id);
    const cover = coverForPrayer(selected, idx);
    const subtitle =
      [selected.scripture?.trim(), selected.description?.trim()].filter(Boolean).join(" · ") ||
      "Guided audio";
    setTrack({
      prayerId: selected.id,
      src: selected.audioUrl,
      title: selected.title,
      subtitle,
      duration: selected.duration,
      coverSrc: cover.src,
      coverUnoptimized: cover.unoptimized,
      locked: false,
    });
  }, [selected, isSubscriber, prayers, setTrack, clearTrack]);

  const prayerRailCovers = useMemo(() => railCoversDeduped(prayers), [prayers]);

  const selectPrayer = useCallback((id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.getElementById("prayer-library-rail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const renderLibrary = useCallback(
    (audioLibraryRef: RefObject<HTMLDivElement | null>) => (
      <>
        {prayers.length === 0 ? (
          <div className="rounded-sm border border-dashed border-sand bg-cream/60 py-16 text-center">
            <p className="text-gray [font-family:var(--font-body),sans-serif]">
              No sessions yet. Run{" "}
              <code className="rounded-sm bg-cream px-1.5 py-0.5 text-sm">npm run db:seed</code> for sample
              entries.
            </p>
          </div>
        ) : (
          <>
            <div id="prayer-library-rail" className="scroll-mt-8">
              {!selected && (
                <p className="mb-4 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
                  Choose a session below — playback controls are at the bottom of the screen.
                </p>
              )}
            </div>

            <div
              ref={audioLibraryRef}
              className={GEAR_UP_CAROUSEL_ROW_CLASS}
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              {prayers.map((p, index) => {
                const { src, unoptimized } = prayerRailCovers[index]!;
                const done = completedIds.includes(p.id);
                const active = selectedId === p.id;
                const locked = !isSubscriber;

                return (
                  <FormStyleRailButton
                    key={p.id}
                    onClick={() => selectPrayer(p.id)}
                    src={src}
                    alt={p.title}
                    title={p.title}
                    metaLine={prayerMetaLine(p, done)}
                    hoverSummary={prayerHoverSummary(p)}
                    unoptimized={unoptimized}
                    showLock={locked}
                    showDone={done}
                    active={active}
                  />
                );
              })}
            </div>
          </>
        )}
      </>
    ),
    [prayers, prayerRailCovers, selected, selectedId, completedIds, isSubscriber, selectPrayer],
  );

  return (
    <PrayerLibraryLayoutPadding>
      {selected && isSubscriber ? (
        <PrayerLibraryCompletionBridge
          prayerId={selected.id}
          isCompleted={completedIds.includes(selected.id)}
          isLocked={false}
        />
      ) : null}
      <PrayerAudioLibraryShell
        collectionCards={layout.collections}
        essentialTiles={layout.essentials}
        spotlightAlbums={layout.spotlight}
        showLibraryArrows={prayers.length > 0}
        renderLibrary={renderLibrary}
      />
      <PrayerMiniPlayerBar />
    </PrayerLibraryLayoutPadding>
  );
}

export default function PrayerAudioLibrary(props: PrayerAudioLibraryProps) {
  return (
    <PrayerLibraryAudioProvider>
      <PrayerAudioLibraryInner {...props} />
    </PrayerLibraryAudioProvider>
  );
}
