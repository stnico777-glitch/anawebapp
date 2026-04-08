"use client";

import { useEffect, useRef, useState, type RefObject, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LockIcon from "@/components/LockIcon";
import { THEMED_LOCK_BADGE_CLASS, THEMED_LOCK_BADGE_LG_CLASS } from "@/constants/dayCardVisual";
import {
  FormStyleRailCard,
  GEAR_UP_CAROUSEL_ROW_CLASS,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
import { DAY_CARD_IMAGE_HOVER } from "@/constants/dayCardVisual";
import type {
  AudioCollectionCardDTO,
  AudioEssentialTileDTO,
  MusicSpotlightAlbumDTO,
} from "@/lib/audio-layout-types";

const ALBUM_CARD_WIDTH_CLASS =
  "w-[min(44vw,188px)] sm:w-[188px] md:w-[204px] lg:w-[216px]";

const ALBUM_IMAGE_SIZES = "(max-width: 640px) 44vw, (max-width: 1024px) 188px, 216px";

const MUSIC_SPOTLIGHT_SHELL_CLASS = `group flex ${ALBUM_CARD_WIDTH_CLASS} shrink-0 flex-col rounded-sm text-left ring-1 ring-sky-blue/35 transition-transform duration-300 ease-out motion-safe:hover:will-change-transform hover:z-[2] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`;

function MusicSpotlightAlbumTile({
  album,
  contentLocked = false,
  lockHref = "/subscribe",
  lockHint = "Subscribe to unlock",
}: {
  album: MusicSpotlightAlbumDTO;
  contentLocked?: boolean;
  lockHref?: string;
  lockHint?: string;
}) {
  const router = useRouter();
  const body = (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-neutral-900">
        <Image
          src={album.coverUrl}
          alt={`${album.title} — ${album.artist}`}
          fill
          sizes={ALBUM_IMAGE_SIZES}
          className={`${DAY_CARD_IMAGE_HOVER} rounded-sm`}
          unoptimized={
            album.coverUrl.startsWith("http://") || album.coverUrl.startsWith("https://")
          }
        />
        {contentLocked ? (
          <span className={`absolute right-2 top-2 z-10 ${THEMED_LOCK_BADGE_CLASS}`} title={lockHint} aria-hidden>
            <LockIcon size="sm" className="text-white" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        {album.title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
        {album.artist}
      </p>
    </>
  );

  if (contentLocked) {
    return (
      <button
        type="button"
        onClick={() => router.push(lockHref)}
        className={`${MUSIC_SPOTLIGHT_SHELL_CLASS} cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface`}
        aria-label={`${album.title} — ${lockHint}`}
      >
        {body}
      </button>
    );
  }

  const url = album.listenUrl?.trim();
  if (url) {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${MUSIC_SPOTLIGHT_SHELL_CLASS} outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface`}
      >
        {body}
      </Link>
    );
  }

  return <div className={MUSIC_SPOTLIGHT_SHELL_CLASS}>{body}</div>;
}

export default function PrayerAudioLibraryShell({
  compactTop = false,
  libraryHeadingId = "prayer-library-heading",
  libraryToolbar,
  showLibraryArrows,
  renderLibrary,
  collectionsToolbar,
  collectionCards,
  essentialTiles,
  spotlightAlbums,
  essentialsToolbar,
  spotlightToolbar,
  collectionsRail,
  essentialsBody,
  spotlightMarquee,
  contentLocked = false,
  lockHref = "/subscribe",
  lockHint = "Subscribe to unlock",
}: {
  compactTop?: boolean;
  libraryHeadingId?: string;
  libraryToolbar?: ReactNode;
  showLibraryArrows: boolean;
  renderLibrary: (audioLibraryRef: RefObject<HTMLDivElement | null>) => ReactNode;
  collectionsToolbar?: ReactNode;
  collectionCards: AudioCollectionCardDTO[];
  essentialTiles: AudioEssentialTileDTO[];
  spotlightAlbums: MusicSpotlightAlbumDTO[];
  essentialsToolbar?: ReactNode;
  spotlightToolbar?: ReactNode;
  /** CMS: full Collections rail (cards with edit/delete). When omitted, `collectionCards` are rendered as member links. */
  collectionsRail?: ReactNode;
  /** CMS: Essentials grid body. When omitted, `essentialTiles` render as member tiles. */
  essentialsBody?: ReactNode;
  /** CMS: spotlight marquee. When omitted, `spotlightAlbums` render as the member marquee. */
  spotlightMarquee?: ReactNode;
  /** Guest or non-subscriber: collections, essentials, spotlight navigate to sign-up / subscribe. */
  contentLocked?: boolean;
  lockHref?: string;
  lockHint?: string;
}) {
  const router = useRouter();
  const plansRef = useRef<HTMLDivElement | null>(null);
  const audioLibraryRef = useRef<HTMLDivElement | null>(null);
  const musicSpotlightMarqueeRef = useRef<HTMLDivElement | null>(null);
  const [musicSpotlightMarqueeInView, setMusicSpotlightMarqueeInView] = useState(true);
  const topPad = compactTop ? "pt-0 md:pt-2" : "pt-10 md:pt-14";

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
  }, []);

  return (
    <div className="min-h-screen w-full max-w-none bg-app-surface">
      <div className={`mx-auto max-w-7xl px-4 md:px-6 ${topPad}`}>
        <section className="mb-14 md:mb-16" aria-labelledby="audio-collections-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="audio-collections-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Collections
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {collectionsToolbar}
              <LibraryCarouselArrows scrollRef={plansRef} />
            </div>
          </div>
          <div
            ref={plansRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {collectionsRail ??
              (collectionCards.length === 0 ? (
                <p className="px-1 py-6 text-sm text-gray [font-family:var(--font-body),sans-serif]">
                  No collection cards yet.
                </p>
              ) : (
                collectionCards.map((p) => (
                  <FormStyleRailCard
                    key={p.id}
                    href={p.linkHref}
                    src={p.imageUrl}
                    alt={p.title}
                    title={p.title}
                    metaLine={p.metaLine}
                    hoverSummary={p.summary}
                    unoptimized={
                      p.imageUrl.startsWith("http://") || p.imageUrl.startsWith("https://")
                    }
                    previewLocked={contentLocked}
                    previewLockHref={lockHref}
                    lockHint={lockHint}
                  />
                ))
              ))}
          </div>
        </section>
      </div>

      <section
        className="relative left-1/2 mb-14 w-screen max-w-[100vw] -translate-x-1/2 md:mb-16"
        aria-labelledby="audio-essentials-heading"
      >
        <div className="mx-auto mb-4 max-w-7xl px-4 md:mb-5 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="audio-essentials-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Essentials
            </h2>
            {essentialsToolbar ? (
              <div className="flex flex-wrap items-center justify-end gap-2">{essentialsToolbar}</div>
            ) : null}
          </div>
        </div>
        <div
          className={`grid w-full grid-cols-1 gap-0 ${
            essentialTiles.length > 1 ? "sm:grid-cols-2" : ""
          }`}
        >
          {essentialsBody ??
            (essentialTiles.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-gray md:px-6 [font-family:var(--font-body),sans-serif]">
                No essentials tiles yet.
              </div>
            ) : (
              essentialTiles.map((tile) =>
                contentLocked ? (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => router.push(lockHref)}
                    className="group relative block aspect-[16/9] w-full cursor-pointer overflow-hidden bg-neutral-900 text-left sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
                    aria-label={`${tile.title} — ${lockHint}`}
                  >
                    <span className={`absolute left-4 top-4 z-10 ${THEMED_LOCK_BADGE_LG_CLASS}`} aria-hidden>
                      <LockIcon size="sm" className="text-white" />
                    </span>
                    <Image
                      src={tile.imageUrl}
                      alt={tile.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority={false}
                      unoptimized={
                        tile.imageUrl.startsWith("http://") || tile.imageUrl.startsWith("https://")
                      }
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
                      <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
                        {tile.subtitle}
                      </p>
                      <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
                    </div>
                  </button>
                ) : (
                  <Link
                    key={tile.id}
                    href={tile.linkHref}
                    className="group relative block aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
                  >
                    <Image
                      src={tile.imageUrl}
                      alt={tile.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority={false}
                      unoptimized={
                        tile.imageUrl.startsWith("http://") || tile.imageUrl.startsWith("https://")
                      }
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
                      <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
                        {tile.subtitle}
                      </p>
                      <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
                    </div>
                  </Link>
                ),
              )
            ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
        <section
          className="mb-8 scroll-mt-6 md:mb-10"
          id="prayer-library"
          aria-labelledby={libraryHeadingId}
        >
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id={libraryHeadingId}
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Library
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {libraryToolbar}
              {showLibraryArrows ? <LibraryCarouselArrows scrollRef={audioLibraryRef} /> : null}
            </div>
          </div>
          {renderLibrary(audioLibraryRef)}
        </section>
      </div>

      <section
        className="mt-12 w-full max-w-none scroll-mt-8 border-t border-sand pt-10 pb-12 md:mt-14 md:pt-12 md:pb-16"
        id="christian-music-spotlight"
        aria-labelledby="christian-music-spotlight-heading"
      >
        <div className="mx-auto mb-5 max-w-7xl px-4 sm:mb-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray [font-family:var(--font-body),sans-serif]">
                Worship &amp; listen
              </p>
              <h2
                id="christian-music-spotlight-heading"
                className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
              >
                Christian music spotlight
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:text-base">
                A living shelf of picks—this row scrolls on its own so it never feels empty. Add streaming links on
                each entry when you’re ready.
              </p>
            </div>
            {spotlightToolbar ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{spotlightToolbar}</div>
            ) : null}
          </div>
        </div>

        {spotlightMarquee ??
          (spotlightAlbums.length === 0 ? (
            <p className="px-4 pb-8 text-center text-sm text-gray md:px-6 [font-family:var(--font-body),sans-serif]">
              No spotlight albums yet.
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
                  {spotlightAlbums.map((album) => (
                    <MusicSpotlightAlbumTile
                      key={album.id}
                      album={album}
                      contentLocked={contentLocked}
                      lockHref={lockHref}
                      lockHint={lockHint}
                    />
                  ))}
                </div>
                <div className="flex shrink-0 items-start gap-2 pr-2 md:gap-2" aria-hidden="true">
                  {spotlightAlbums.map((album) => (
                    <MusicSpotlightAlbumTile
                      key={`marquee-b-${album.id}`}
                      album={album}
                      contentLocked={contentLocked}
                      lockHref={lockHref}
                      lockHint={lockHint}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

        <div
          className="relative z-0 mt-2 h-1.5 w-screen max-w-none shrink-0 ml-[calc(50%-50vw)] bg-gradient-to-r from-transparent via-sky-blue/25 to-transparent md:mt-3 md:h-2"
          aria-hidden
        />
      </section>
    </div>
  );
}
