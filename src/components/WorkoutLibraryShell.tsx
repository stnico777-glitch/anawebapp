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
import type { MovementLayoutDTO } from "@/lib/movement-layout-types";

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
  onPlayQuickie,
  isGuest = false,
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
  onPlayHeroTile?: (tile: MovementLayoutDTO["heroTiles"][number]) => void;
  onPlayQuickie?: (card: MovementLayoutDTO["quickieCards"][number]) => void;
  /** Logged-out preview: lock affordances on hero + quickie tiles. */
  isGuest?: boolean;
}) {
  const programsRef = useRef<HTMLDivElement>(null);
  const newToPilatesRef = useRef<HTMLDivElement>(null);

  const topPad = compactTop ? "pt-0 md:pt-2" : "pt-10 md:pt-14";

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
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{justStartedToolbar}</div>
            ) : null}
          </div>
        </div>
        <div
          className={`grid w-full grid-cols-1 gap-0 ${
            movementLayout.heroTiles.length > 1 ? "sm:grid-cols-2" : ""
          }`}
        >
          {heroSectionBody ??
            movementLayout.heroTiles.map((tile) => {
              const unoptimized =
                tile.imageUrl.startsWith("http://") || tile.imageUrl.startsWith("https://");
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onPlayHeroTile?.(tile)}
                  className="group relative aspect-[16/9] w-full overflow-hidden bg-sand text-left sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
                >
                  {isGuest ? (
                    <span
                      className={`absolute left-4 top-4 z-10 ${THEMED_LOCK_BADGE_LG_CLASS}`}
                      title="Sign up to unlock"
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
                    priority
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
                  alt={p.title}
                  title={p.title}
                  metaLine={p.metaLine}
                  hoverSummary={p.summary}
                  unoptimized={
                    p.imageUrl.startsWith("http://") || p.imageUrl.startsWith("https://")
                  }
                  showLock={isGuest}
                  lockHint={isGuest ? "Sign up to unlock" : undefined}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
