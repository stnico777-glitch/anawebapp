"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import PrayerPlayer from "./PrayerPlayer";
import PrayerAudioLibraryShell from "@/components/PrayerAudioLibraryShell";
import { FormStyleRailButton, GEAR_UP_CAROUSEL_ROW_CLASS } from "@/components/LibraryBannerStrip";
import {
  type PrayerLibraryItem,
  coverForPrayer,
  railCoversDeduped,
  prayerMetaLine,
  prayerHoverSummary,
  CatalogCoverImage,
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

export default function PrayerAudioLibrary({
  prayers,
  completedIds,
  isSubscriber,
  layout,
}: PrayerAudioLibraryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? prayers.find((p) => p.id === selectedId) ?? null : null),
    [prayers, selectedId],
  );

  const prayerRailCovers = useMemo(() => railCoversDeduped(prayers), [prayers]);

  const selectPrayer = useCallback((id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.getElementById("prayer-now-playing")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <div id="prayer-now-playing" className="scroll-mt-8">
              {selected ? (
                <div className="mb-6 overflow-hidden rounded-none border border-black/[0.08] bg-white shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    <div className="relative aspect-video w-full shrink-0 bg-neutral-100 md:aspect-auto md:h-auto md:w-[min(42%,380px)] md:min-h-[200px]">
                      {(() => {
                        const { src, unoptimized } = coverForPrayer(
                          selected,
                          prayers.findIndex((x) => x.id === selected.id),
                        );
                        return (
                          <CatalogCoverImage
                            src={src}
                            unoptimized={unoptimized}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 380px"
                            priority
                          />
                        );
                      })()}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center bg-white p-5 md:p-8">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray">Now playing</p>
                      <p className="mt-1 text-xl font-semibold uppercase leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif] md:text-2xl">
                        {selected.title}
                      </p>
                      {(selected.scripture || selected.description) && (
                        <p className="mt-2 text-sm text-gray">
                          {selected.scripture && (
                            <span className="italic text-foreground/90">{selected.scripture}</span>
                          )}
                          {selected.scripture && selected.description ? " · " : null}
                          {selected.description}
                        </p>
                      )}
                      <div className="mt-4 md:mt-6">
                        <PrayerPlayer
                          prayerId={selected.id}
                          src={selected.audioUrl}
                          title={selected.title}
                          duration={selected.duration}
                          description={selected.description ?? undefined}
                          scripture={selected.scripture ?? undefined}
                          isCompleted={completedIds.includes(selected.id)}
                          isLocked={!isSubscriber}
                          showMeta={false}
                          hidePlayerTitle
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mb-5 text-center text-sm text-gray">Choose a session below to start listening.</p>
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
    [
      prayers,
      prayerRailCovers,
      selected,
      selectedId,
      completedIds,
      isSubscriber,
      selectPrayer,
    ],
  );

  return (
    <PrayerAudioLibraryShell
      collectionCards={layout.collections}
      essentialTiles={layout.essentials}
      spotlightAlbums={layout.spotlight}
      showLibraryArrows={prayers.length > 0}
      renderLibrary={renderLibrary}
    />
  );
}
