"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  GEAR_UP_CAROUSEL_ROW_CLASS,
  FormStyleRailButton,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
import LockIcon from "@/components/LockIcon";
import { THEMED_LOCK_BADGE_LG_CLASS } from "@/constants/dayCardVisual";
import type {
  MovementHeroCollectionItemDTO,
  MovementLayoutDTO,
} from "@/lib/movement-layout-types";
import { unoptimizedRemoteImage } from "@/lib/remote-image";

/**
 * Shared Movement tab layout (Library rail + Just Getting Started + Quickie).
 * Member app passes placeholder or real workouts in `libraryRail`; hero/quickie from `movementLayout`.
 */
export default function WorkoutLibraryShell({
  libraryRail,
  libraryToolbar,
  libraryHeadingId = "library-heading",
  compactTop = false,
  movementLayout,
  justStartedToolbar,
  quickieToolbar,
  heroSectionBody,
  quickieRail,
  onPlayHeroTile,
  onPlayCollectionItem,
  onPlayQuickie,
  isGuest = false,
  /** When set, controls lock badges (subscriber paywall). Defaults to guest-only (`isGuest`). */
  contentLocked,
  lockHint,
  /** Eager-load rail thumbs so horizontal scroll does not discard decoded images on Movement tab. */
  railImageLoading = "lazy",
}: {
  libraryRail: ReactNode;
  libraryToolbar?: ReactNode;
  libraryHeadingId?: string;
  compactTop?: boolean;
  movementLayout: MovementLayoutDTO;
  justStartedToolbar?: ReactNode;
  quickieToolbar?: ReactNode;
  heroSectionBody?: ReactNode;
  quickieRail?: ReactNode;
  /** Legacy single-video hero tile click. Still used when a tile has no collection items
   *  (e.g. older CMS data before the 6-day series was introduced). */
  onPlayHeroTile?: (tile: MovementLayoutDTO["heroTiles"][number]) => void;
  /** Click on a Day N card inside the 6-item Just Getting Started grid. */
  onPlayCollectionItem?: (item: MovementHeroCollectionItemDTO) => void;
  onPlayQuickie?: (card: MovementLayoutDTO["quickieCards"][number]) => void;
  /** Logged-out preview: lock affordances on hero + quickie tiles. */
  isGuest?: boolean;
  contentLocked?: boolean;
  lockHint?: string;
  railImageLoading?: "eager" | "lazy";
}) {
  const programsRef = useRef<HTMLDivElement>(null);
  const newToPilatesRef = useRef<HTMLDivElement>(null);

  const movementLocked = contentLocked ?? isGuest;
  const effectiveLockHint =
    lockHint ?? (isGuest ? "Sign up to unlock" : "Subscribe to unlock");

  const topPad = compactTop ? "pt-0 md:pt-2" : "pt-10 md:pt-14";

  /** The "Just Getting Started" section is now a flat grid of the first hero tile's collection
   *  items (e.g. Day 1..Day 6). If no items exist yet we fall back to the legacy hero-tile
   *  button(s) for backwards compatibility with older CMS data. */
  const primaryTile = movementLayout.heroTiles[0] ?? null;
  const collectionItems = primaryTile?.items ?? [];
  const showCollectionGrid = collectionItems.length > 0;

  return (
    <div className="min-h-screen bg-app-surface">
      <div className={`mx-auto max-w-7xl px-4 md:px-6 ${topPad}`}>
        <section className="mb-14 md:mb-16" aria-labelledby={libraryHeadingId}>
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id={libraryHeadingId}
              className="text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Library
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {libraryToolbar}
              <LibraryCarouselArrows scrollRef={programsRef} />
            </div>
          </div>
          <div
            ref={programsRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {libraryRail}
          </div>
        </section>
      </div>

      {/* Just Getting Started — full-bleed so the 6 day cards span edge-to-edge with no gaps. */}
      <section
        className="relative left-1/2 mb-14 w-screen max-w-[100vw] -translate-x-1/2 md:mb-16"
        aria-labelledby="just-getting-started-heading"
      >
        <div className="mx-auto mb-4 max-w-7xl px-4 md:mb-5 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2
                id="just-getting-started-heading"
                className="text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]"
              >
                Just Getting Started
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:text-[0.9375rem]">
                {movementLayout.copy.justStartedTagline}
              </p>
            </div>
            {justStartedToolbar ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                {justStartedToolbar}
              </div>
            ) : null}
          </div>
        </div>

        {heroSectionBody ?? (
          showCollectionGrid ? (
            /** 2 rows × 3 cols, row-major so each row reads left-to-right: Day 1 | Day 2 | Day 3,
             *  then Day 4 | Day 5 | Day 6. `gap-0` + no rounded corners so cards butt up against
             *  each other edge-to-edge; the section itself is full-bleed above, so the overall
             *  grid spans from the left edge of the viewport to the right. */
            <div className="grid w-full grid-cols-3 grid-rows-2 gap-0">
              {collectionItems.map((item, itemIndex) => {
                const unoptimized = unoptimizedRemoteImage(item.imageUrl);
                const playable = !!item.videoUrl?.trim();
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPlayCollectionItem?.(item)}
                    disabled={!playable && !isGuest}
                    aria-label={`Day ${item.dayIndex} — ${item.title}`}
                    className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden bg-sand text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-blue disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {movementLocked ? (
                      <span
                        className={`absolute left-2 top-2 z-10 ${THEMED_LOCK_BADGE_LG_CLASS}`}
                        title={effectiveLockHint}
                        aria-hidden
                      >
                        <LockIcon size="sm" className="text-white" />
                      </span>
                    ) : null}
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      priority={itemIndex < 2}
                      fetchPriority={itemIndex < 2 ? "high" : "low"}
                      unoptimized={unoptimized}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 from-[22%] via-black/10 to-transparent"
                      aria-hidden
                    />
                    {/* Hover tint — signals clickability at a glance without adding a translate
                        that would open a gap between touching cards. */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/15 motion-reduce:transition-none"
                      aria-hidden
                    />
                    <span className="absolute right-2 top-2 z-10 rounded-sm bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
                      Day {item.dayIndex}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                      <p className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-background md:text-base [font-family:var(--font-headline),sans-serif]">
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-0">
              {movementLayout.heroTiles.map((tile, heroIndex) => {
                const unoptimized = unoptimizedRemoteImage(tile.imageUrl);
                const isPrimaryHero = heroIndex === 0;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => onPlayHeroTile?.(tile)}
                    aria-label={`Play ${tile.title}`}
                    className="group relative aspect-[16/9] w-full overflow-hidden bg-sand text-left sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
                  >
                    {movementLocked ? (
                      <span
                        className={`absolute left-4 top-4 z-10 ${THEMED_LOCK_BADGE_LG_CLASS}`}
                        title={effectiveLockHint}
                        aria-hidden
                      >
                        <LockIcon size="sm" className="text-white" />
                      </span>
                    ) : null}
                    <Image
                      src={tile.imageUrl}
                      alt={tile.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority={isPrimaryHero}
                      fetchPriority={isPrimaryHero ? "high" : "low"}
                      unoptimized={unoptimized}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
                      <p className="text-xl font-semibold tracking-tight text-background md:text-2xl [font-family:var(--font-headline),sans-serif]">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-xs lowercase tracking-[0.12em] text-background/85 [font-family:var(--font-body),sans-serif]">
                        {tile.subtitle}
                      </p>
                      <span className="essentials-explore-glass-cream mt-4">Explore</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
        <section className="mb-14 md:mb-16" aria-labelledby="quickie-heading">
          <div className="mb-4 flex flex-col gap-2 sm:mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2
                  id="quickie-heading"
                  className="text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]"
                >
                  Quickie
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:text-[0.9375rem]">
                  {movementLayout.copy.quickieIntro}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pt-1">
                {quickieToolbar}
                <LibraryCarouselArrows scrollRef={newToPilatesRef} />
              </div>
            </div>
          </div>
          <div
            ref={newToPilatesRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {quickieRail ??
              movementLayout.quickieCards.map((p) => (
                <FormStyleRailButton
                  key={p.id}
                  onClick={() => onPlayQuickie?.(p)}
                  src={p.imageUrl}
                  title={p.title}
                  metaLine={p.metaLine}
                  hoverSummary={p.summary}
                  unoptimized={unoptimizedRemoteImage(p.imageUrl)}
                  showLock={movementLocked}
                  lockHint={movementLocked ? effectiveLockHint : undefined}
                  imageLoading={railImageLoading}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
