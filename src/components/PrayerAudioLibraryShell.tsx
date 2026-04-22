"use client";

import { useRef, type RefObject, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LockIcon from "@/components/LockIcon";
import { THEMED_LOCK_BADGE_LG_CLASS } from "@/constants/dayCardVisual";
import {
  FormStyleRailCard,
  GEAR_UP_CAROUSEL_ROW_CLASS,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
import { unoptimizedRemoteImage } from "@/lib/remote-image";
import type {
  AudioCollectionCardDTO,
  AudioEssentialTileDTO,
} from "@/lib/audio-layout-types";

export default function PrayerAudioLibraryShell({
  compactTop = false,
  libraryHeadingId = "prayer-library-heading",
  libraryToolbar,
  showLibraryArrows,
  renderLibrary,
  collectionsToolbar,
  collectionCards,
  essentialTiles,
  essentialsToolbar,
  collectionsRail,
  essentialsBody,
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
  essentialsToolbar?: ReactNode;
  /** CMS: full Collections rail (cards with edit/delete). When omitted, `collectionCards` are rendered as member links. */
  collectionsRail?: ReactNode;
  /** CMS: Essentials grid body. When omitted, `essentialTiles` render as member tiles. */
  essentialsBody?: ReactNode;
  /** Guest or non-subscriber: collections + essentials navigate to sign-up / subscribe. */
  contentLocked?: boolean;
  lockHref?: string;
  lockHint?: string;
}) {
  const router = useRouter();
  const plansRef = useRef<HTMLDivElement | null>(null);
  const audioLibraryRef = useRef<HTMLDivElement | null>(null);
  const topPad = compactTop ? "pt-0 md:pt-2" : "pt-10 md:pt-14";

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
                    unoptimized={unoptimizedRemoteImage(p.imageUrl)}
                    previewLocked={contentLocked}
                    previewLockHref={lockHref}
                    lockHint={lockHint}
                    imageLoading="eager"
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
                    className="group relative block aspect-[16/9] w-full cursor-pointer overflow-hidden bg-sand text-left sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
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
                      unoptimized={unoptimizedRemoteImage(tile.imageUrl)}
                      loading="eager"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
                      <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_4px_rgba(0,0,0,0.45)]">
                        {tile.subtitle}
                      </p>
                      <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
                    </div>
                  </button>
                ) : (
                  <Link
                    key={tile.id}
                    href={tile.linkHref}
                    className="group relative block aspect-[16/9] overflow-hidden bg-sand sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
                  >
                    <Image
                      src={tile.imageUrl}
                      alt={tile.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority={false}
                      unoptimized={unoptimizedRemoteImage(tile.imageUrl)}
                      loading="eager"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
                      <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_4px_rgba(0,0,0,0.45)]">
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
    </div>
  );
}
