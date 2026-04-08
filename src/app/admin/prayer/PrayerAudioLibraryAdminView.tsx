"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
  MusicSpotlightAlbumDTO,
} from "@/lib/audio-layout-types";
import AdminPrayerRailCard from "./AdminPrayerRailCard";
import PrayerForm from "./PrayerForm";
import AudioCollectionForm from "./AudioCollectionForm";
import AudioEssentialForm from "./AudioEssentialForm";
import MusicSpotlightAlbumForm from "./MusicSpotlightAlbumForm";
import AdminAudioCollectionRailCard from "./AdminAudioCollectionRailCard";
import AdminEssentialTileCard from "./AdminEssentialTileCard";
import AdminMusicSpotlightAlbumTile from "./AdminMusicSpotlightAlbumTile";

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
    spotlight: MusicSpotlightAlbumDTO[];
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

  const musicSpotlightMarqueeRef = useRef<HTMLDivElement | null>(null);
  const [musicSpotlightMarqueeInView, setMusicSpotlightMarqueeInView] = useState(true);

  useEffect(() => {
    const el = musicSpotlightMarqueeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setMusicSpotlightMarqueeInView(entry.isIntersecting);
      },
      { root: null, rootMargin: "48px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [layout.spotlight.length]);

  const spotlightMarquee =
    layout.spotlight.length === 0 ? (
      <p className="px-4 pb-8 text-center text-sm text-gray md:px-6 [font-family:var(--font-body),sans-serif]">
        No spotlight albums yet. Use <strong className="font-semibold text-foreground">Add spotlight album</strong>.
      </p>
    ) : (
      <div
        ref={musicSpotlightMarqueeRef}
        className="relative w-full overflow-hidden pb-8 motion-reduce:overflow-x-auto md:pb-10"
        role="region"
        aria-roledescription="carousel"
        aria-label="Christian music spotlight albums"
        aria-live="off"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-app-surface to-transparent md:w-12"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-app-surface to-transparent md:w-12"
          aria-hidden
        />
        <div
          className={`music-spotlight-marquee-track items-start py-1 motion-reduce:px-4 md:motion-reduce:px-6${
            musicSpotlightMarqueeInView ? "" : " marquee-pause-when-hidden"
          }`}
        >
          <div className="flex shrink-0 items-start gap-2 pr-2 md:gap-2">
            {layout.spotlight.map((a) => (
              <AdminMusicSpotlightAlbumTile key={a.id} album={a} />
            ))}
          </div>
          <div className="flex shrink-0 items-start gap-2 pr-2 md:gap-2" aria-hidden="true">
            {layout.spotlight.map((a) => (
              <AdminMusicSpotlightAlbumTile key={`marquee-b-${a.id}`} album={a} />
            ))}
          </div>
        </div>
      </div>
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
          spotlightToolbar={
            <MusicSpotlightAlbumForm triggerLabel="Add spotlight album" triggerClassName={addTriggerClass} />
          }
          spotlightAlbums={layout.spotlight}
          spotlightMarquee={spotlightMarquee}
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
    spotlight: MusicSpotlightAlbumDTO[];
  };
}) {
  return (
    <PrayerLibraryAudioProvider>
      <PrayerAudioLibraryAdminViewInner {...props} />
    </PrayerLibraryAudioProvider>
  );
}
