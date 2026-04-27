"use client";

import { useRef, type RefObject, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LockIcon from "@/components/LockIcon";
import { THEMED_LOCK_BADGE_LG_CLASS } from "@/constants/dayCardVisual";
import {
  FormStyleRailButton,
  FormStyleRailCard,
  GEAR_UP_CAROUSEL_ROW_CLASS,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
import { unoptimizedRemoteImage } from "@/lib/remote-image";
import {
  AUDIO_COLLECTION_CATEGORIES,
  AUDIO_COLLECTION_CATEGORY_LABELS,
  type AudioCollectionCardDTO,
  type AudioCollectionCategory,
  type AudioEssentialTileDTO,
} from "@/lib/audio-layout-types";

type PerCategory<T> = Partial<Record<AudioCollectionCategory, T>>;

export default function PrayerAudioLibraryShell({
  compactTop = false,
  libraryHeadingId = "prayer-library-heading",
  libraryToolbar,
  showLibraryArrows = false,
  renderLibrary,
  collectionsToolbarByCategory,
  collectionCards,
  essentialTiles,
  essentialsToolbar,
  collectionsRailByCategory,
  essentialsBody,
  contentLocked = false,
  lockHref = "/subscribe",
  lockHint = "Subscribe to unlock",
  onPlayCollectionAudio,
  activeCollectionAudioId = null,
}: {
  compactTop?: boolean;
  libraryHeadingId?: string;
  libraryToolbar?: ReactNode;
  /** Library section is rendered ONLY when `renderLibrary` is provided (admin CMS).
   *  Member view passes neither and the section is omitted entirely. */
  showLibraryArrows?: boolean;
  renderLibrary?: (audioLibraryRef: RefObject<HTMLDivElement | null>) => ReactNode;
  /** Per-category toolbar (e.g. CMS "Add card to Affirmations" button). */
  collectionsToolbarByCategory?: PerCategory<ReactNode>;
  collectionCards: AudioCollectionCardDTO[];
  /** Essentials section is rendered ONLY when at least one tile is provided OR `essentialsBody`
   *  is set. Member view passes neither so the section is omitted entirely. */
  essentialTiles?: AudioEssentialTileDTO[];
  essentialsToolbar?: ReactNode;
  /** CMS: full per-category rail (cards with edit/delete). When omitted, `collectionCards`
   *  filtered by category render as either play-buttons (audioUrl set) or member links. */
  collectionsRailByCategory?: PerCategory<ReactNode>;
  /** CMS: Essentials grid body. When omitted, `essentialTiles` render as member tiles. */
  essentialsBody?: ReactNode;
  /** Guest or non-subscriber: collections + essentials navigate to sign-up / subscribe. */
  contentLocked?: boolean;
  lockHref?: string;
  lockHint?: string;
  /** Member click handler for cards with `audioUrl`. When omitted (or audioUrl empty),
   *  the card falls back to navigating to its `linkHref`. */
  onPlayCollectionAudio?: (card: AudioCollectionCardDTO) => void;
  /** When matched against a card's id, that card receives the active highlight. */
  activeCollectionAudioId?: string | null;
}) {
  const router = useRouter();
  const plansRef = useRef<HTMLDivElement | null>(null);
  const audioLibraryRef = useRef<HTMLDivElement | null>(null);
  const topPad = compactTop ? "pt-0 md:pt-2" : "pt-10 md:pt-14";
  const showEssentials = !!essentialsBody || (essentialTiles?.length ?? 0) > 0;
  const showLibrary = !!renderLibrary;

  return (
    <div className={`min-h-screen w-full max-w-none bg-app-surface ${topPad}`}>
      {AUDIO_COLLECTION_CATEGORIES.map((category, categoryIndex) => {
        const cards = collectionCards.filter((card) => card.category === category);
        const toolbar = collectionsToolbarByCategory?.[category];
        const customRail = collectionsRailByCategory?.[category];

        // Scripture Reading uses a full-bleed 2x2 grid for both member and admin. Admin
        // can still inject custom tiles via `customRail`; those are rendered inside the same
        // grid container so the visual layout matches the member view exactly.
        if (category === "SCRIPTURE_READING") {
          return (
            <CategoryGridSection
              key={category}
              category={category}
              cards={cards}
              toolbar={toolbar}
              customRail={customRail}
              contentLocked={contentLocked}
              lockHref={lockHref}
              lockHint={lockHint}
              onPlayAudio={onPlayCollectionAudio}
              activeAudioId={activeCollectionAudioId}
            />
          );
        }

        return (
          <div key={category} className="mx-auto max-w-7xl px-4 md:px-6">
            <CategoryRailSection
              // Different ref per section so each carousel's arrows scroll its own row.
              // We can't share `plansRef` across all three or only the last one would scroll.
              innerRef={categoryIndex === 0 ? plansRef : undefined}
              category={category}
              cards={cards}
              toolbar={toolbar}
              customRail={customRail}
              contentLocked={contentLocked}
              lockHref={lockHref}
              lockHint={lockHint}
              onPlayAudio={onPlayCollectionAudio}
              activeAudioId={activeCollectionAudioId}
            />
          </div>
        );
      })}

      {showEssentials ? (
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
              (essentialTiles?.length ?? 0) > 1 ? "sm:grid-cols-2" : ""
            }`}
          >
            {essentialsBody ??
              (essentialTiles?.length
                ? essentialTiles.map((tile) =>
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
                          <p className="text-xl font-semibold tracking-tight text-background md:text-2xl [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
                            {tile.title}
                          </p>
                          <p className="mt-1 text-xs lowercase tracking-[0.12em] text-background/85 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_4px_rgba(0,0,0,0.45)]">
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
                          <p className="text-xl font-semibold tracking-tight text-background md:text-2xl [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
                            {tile.title}
                          </p>
                          <p className="mt-1 text-xs lowercase tracking-[0.12em] text-background/85 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_4px_rgba(0,0,0,0.45)]">
                            {tile.subtitle}
                          </p>
                          <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
                        </div>
                      </Link>
                    ),
                  )
                : (
                  <div className="px-4 py-12 text-center text-sm text-gray md:px-6 [font-family:var(--font-body),sans-serif]">
                    No essentials tiles yet.
                  </div>
                ))}
          </div>
        </section>
      ) : null}

      {showLibrary ? (
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
            {renderLibrary!(audioLibraryRef)}
          </section>
        </div>
      ) : null}
    </div>
  );
}

/** Full-bleed 2x2 grid section. Used for Scripture Reading on both member and admin views.
 *  Admin can override the tile rendering via `customRail` (e.g. tiles with edit/delete buttons)
 *  while preserving the surrounding grid layout, heading, and full-bleed wrapper. */
function CategoryGridSection({
  category,
  cards,
  toolbar,
  customRail,
  contentLocked,
  lockHref,
  lockHint,
  onPlayAudio,
  activeAudioId,
}: {
  category: AudioCollectionCategory;
  cards: AudioCollectionCardDTO[];
  toolbar?: ReactNode;
  customRail?: ReactNode;
  contentLocked: boolean;
  lockHref: string;
  lockHint: string;
  onPlayAudio?: (card: AudioCollectionCardDTO) => void;
  activeAudioId?: string | null;
}) {
  const router = useRouter();
  const headingId = `audio-${category.toLowerCase()}-heading`;
  const label = AUDIO_COLLECTION_CATEGORY_LABELS[category];

  return (
    <section
      className="relative left-1/2 mb-14 w-screen max-w-[100vw] -translate-x-1/2 md:mb-16"
      aria-labelledby={headingId}
    >
      <div className="mx-auto mb-4 max-w-7xl px-4 md:mb-5 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id={headingId}
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            {label}
          </h2>
          {toolbar ? (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {toolbar}
            </div>
          ) : null}
        </div>
      </div>
      {customRail ? (
        <div className="grid w-full grid-cols-2 gap-0">{customRail}</div>
      ) : cards.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray md:px-6 [font-family:var(--font-body),sans-serif]">
          No {label.toLowerCase()} yet.
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-0">
          {cards.map((card) => {
            const playable = !!card.audioUrl?.trim() && !!onPlayAudio && !contentLocked;
            const handleClick = () => {
              if (contentLocked) {
                router.push(lockHref);
                return;
              }
              if (playable) onPlayAudio!(card);
              else if (card.linkHref) router.push(card.linkHref);
            };
            const active = activeAudioId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={handleClick}
                aria-label={contentLocked ? `${card.title} — ${lockHint}` : `Play ${card.title}`}
                aria-pressed={active}
                className={`group relative aspect-[5/2] w-full cursor-pointer overflow-hidden bg-sand text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-blue ${active ? "ring-2 ring-inset ring-sky-blue/90" : ""}`}
              >
                {contentLocked ? (
                  <span
                    className={`absolute left-2 top-2 z-10 ${THEMED_LOCK_BADGE_LG_CLASS}`}
                    title={lockHint}
                    aria-hidden
                  >
                    <LockIcon size="sm" className="text-white" />
                  </span>
                ) : null}
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  unoptimized={unoptimizedRemoteImage(card.imageUrl)}
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <p className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-background md:text-base [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
                    {card.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

/** One labeled carousel rail (e.g. "Affirmations"). Encapsulates per-row scroll ref + arrows so
 *  the parent can render three of them without juggling refs. Member view uses the default
 *  card behavior (audio playback or link); admin can override the entire rail body. */
function CategoryRailSection({
  innerRef,
  category,
  cards,
  toolbar,
  customRail,
  contentLocked,
  lockHref,
  lockHint,
  onPlayAudio,
  activeAudioId,
}: {
  innerRef?: RefObject<HTMLDivElement | null>;
  category: AudioCollectionCategory;
  cards: AudioCollectionCardDTO[];
  toolbar?: ReactNode;
  customRail?: ReactNode;
  contentLocked: boolean;
  lockHref: string;
  lockHint: string;
  onPlayAudio?: (card: AudioCollectionCardDTO) => void;
  activeAudioId?: string | null;
}) {
  // Stable second-choice ref so sections after the first still get their own scroll target.
  // (We can't share `innerRef` across all three sections — each carousel needs its own ref.)
  const localRef = useRef<HTMLDivElement | null>(null);
  const ref = innerRef ?? localRef;
  const headingId = `audio-${category.toLowerCase()}-heading`;
  const label = AUDIO_COLLECTION_CATEGORY_LABELS[category];

  return (
    <section className="mb-14 md:mb-16" aria-labelledby={headingId}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id={headingId}
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
        >
          {label}
        </h2>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {toolbar}
          <LibraryCarouselArrows scrollRef={ref} />
        </div>
      </div>
      <div
        ref={ref}
        className={GEAR_UP_CAROUSEL_ROW_CLASS}
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {customRail ??
          (cards.length === 0 ? (
            <p className="px-1 py-6 text-sm text-gray [font-family:var(--font-body),sans-serif]">
              No {label.toLowerCase()} yet.
            </p>
          ) : (
            cards.map((card) => {
              const playable = !!card.audioUrl?.trim() && !!onPlayAudio && !contentLocked;
              const hoverSummary = card.summary?.trim() || card.title;
              if (playable) {
                return (
                  <FormStyleRailButton
                    key={card.id}
                    onClick={() => onPlayAudio!(card)}
                    src={card.imageUrl}
                    title={card.title}
                    metaLine={card.metaLine}
                    hoverSummary={hoverSummary}
                    unoptimized={unoptimizedRemoteImage(card.imageUrl)}
                    active={activeAudioId === card.id}
                    imageLoading="eager"
                  />
                );
              }
              return (
                <FormStyleRailCard
                  key={card.id}
                  href={card.linkHref}
                  src={card.imageUrl}
                  alt={card.title}
                  title={card.title}
                  metaLine={card.metaLine}
                  hoverSummary={hoverSummary}
                  unoptimized={unoptimizedRemoteImage(card.imageUrl)}
                  previewLocked={contentLocked}
                  previewLockHref={lockHref}
                  lockHint={lockHint}
                  imageLoading="eager"
                />
              );
            })
          ))}
      </div>
    </section>
  );
}
