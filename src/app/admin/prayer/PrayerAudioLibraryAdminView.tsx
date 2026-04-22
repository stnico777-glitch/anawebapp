"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import PrayerAudioLibraryShell from "@/components/PrayerAudioLibraryShell";
import {
  PrayerLibraryAudioProvider,
  PrayerLibraryLayoutPadding,
  PrayerMiniPlayerBar,
  usePrayerLibraryAudio,
} from "@/app/(app)/(main-tabs)/prayer/PrayerLibraryAudioContext";
import { GEAR_UP_CAROUSEL_ROW_CLASS, RAIL_CARD_WIDTH } from "@/components/LibraryBannerStrip";
import {
  type PrayerLibraryItem,
  coverForPrayer,
  railCoversDeduped,
} from "@/lib/prayer-audio-display";
import type {
  AudioCollectionCardDTO,
  AudioEssentialTileDTO,
} from "@/lib/audio-layout-types";
import AdminPrayerRailCard from "./AdminPrayerRailCard";
import PrayerForm from "./PrayerForm";
import AudioCollectionForm from "./AudioCollectionForm";
import AudioEssentialForm from "./AudioEssentialForm";
import AdminAudioCollectionRailCard from "./AdminAudioCollectionRailCard";
import AdminEssentialTileCard from "./AdminEssentialTileCard";

const addTriggerClass =
  "shrink-0 rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

function PrayerAudioLibraryAdminViewInner({
  prayers,
  layout,
}: {
  prayers: PrayerLibraryItem[];
  layout: {
    collections: AudioCollectionCardDTO[];
    essentials: AudioEssentialTileDTO[];
  };
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { setTrack, clearTrack } = usePrayerLibraryAudio();

  useEffect(() => {
    setSelectedId((id) => (id && !prayers.some((p) => p.id === id) ? null : id));
  }, [prayers]);

  const selected = useMemo(
    () => (selectedId ? prayers.find((p) => p.id === selectedId) ?? null : null),
    [prayers, selectedId],
  );

  useLayoutEffect(() => {
    if (!selected) {
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
  }, [selected, prayers, setTrack, clearTrack]);

  const prayerRailCovers = useMemo(() => railCoversDeduped(prayers), [prayers]);

  const selectPrayer = useCallback((id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.getElementById("prayer-library-rail-admin")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const renderLibrary = useCallback(
    (audioLibraryRef: RefObject<HTMLDivElement | null>) => (
      <>
        {prayers.length === 0 ? (
          <div
            className={`flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col items-center justify-center rounded-none border border-dashed border-sand bg-white/90 p-8 text-center [font-family:var(--font-body),sans-serif]`}
            style={{ scrollSnapAlign: "start" }}
          >
            <p className="text-sm leading-relaxed text-gray">
              No audio in the library yet. Use <strong className="font-semibold text-foreground">Add audio</strong>{" "}
              to create a track — it will appear here and in the member app.
            </p>
          </div>
        ) : (
          <>
            <div id="prayer-library-rail-admin" className="scroll-mt-8">
              {!selected && (
                <p className="mb-4 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
                  Choose a session below — the same bottom player as the member app appears when you select audio.
                </p>
              )}
            </div>

            <div
              ref={audioLibraryRef}
              className={GEAR_UP_CAROUSEL_ROW_CLASS}
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              {prayers.map((p, index) => {
                const cover = prayerRailCovers[index]!;
                return (
                  <AdminPrayerRailCard
                    key={p.id}
                    prayer={p}
                    cover={cover}
                    selected={selectedId === p.id}
                    onSelect={() => selectPrayer(p.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </>
    ),
    [prayers, prayerRailCovers, selected, selectedId, selectPrayer],
  );

  const collectionsRail =
    layout.collections.length === 0 ? (
      <p className="px-1 py-6 text-sm text-gray [font-family:var(--font-body),sans-serif]">
        No collection cards yet. Use <strong className="font-semibold text-foreground">Add collection</strong>.
      </p>
    ) : (
      layout.collections.map((c) => <AdminAudioCollectionRailCard key={c.id} card={c} />)
    );

  const essentialsBody =
    layout.essentials.length === 0 ? (
      <div className="px-4 py-12 text-center text-sm text-gray md:px-6 [font-family:var(--font-body),sans-serif]">
        No essentials tiles yet. Use <strong className="font-semibold text-foreground">Add essentials tile</strong>.
      </div>
    ) : (
      layout.essentials.map((t) => <AdminEssentialTileCard key={t.id} tile={t} />)
    );

  return (
    <PrayerLibraryLayoutPadding>
      <div className="-mx-4 md:-mx-6">
        <PrayerAudioLibraryShell
          compactTop
          libraryHeadingId="cms-audio-library-heading"
          libraryToolbar={<PrayerForm triggerLabel="Add audio" triggerClassName={addTriggerClass} />}
          showLibraryArrows={prayers.length > 0}
          renderLibrary={renderLibrary}
          collectionsToolbar={
            <AudioCollectionForm triggerLabel="Add collection" triggerClassName={addTriggerClass} />
          }
          collectionCards={layout.collections}
          collectionsRail={collectionsRail}
          essentialsToolbar={
            <AudioEssentialForm triggerLabel="Add essentials tile" triggerClassName={addTriggerClass} />
          }
          essentialTiles={layout.essentials}
          essentialsBody={essentialsBody}
        />
      </div>
      <PrayerMiniPlayerBar />
    </PrayerLibraryLayoutPadding>
  );
}

export default function PrayerAudioLibraryAdminView(props: {
  prayers: PrayerLibraryItem[];
  layout: {
    collections: AudioCollectionCardDTO[];
    essentials: AudioEssentialTileDTO[];
  };
}) {
  return (
    <PrayerLibraryAudioProvider>
      <PrayerAudioLibraryAdminViewInner {...props} />
    </PrayerLibraryAudioProvider>
  );
}
