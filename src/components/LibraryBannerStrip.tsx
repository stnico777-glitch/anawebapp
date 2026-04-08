"use client";

import Link from "next/link";
import Image from "next/image";
import LockIcon from "@/components/LockIcon";
import {
  DAY_CARD_IMAGE_HOVER,
  DAY_CARD_SHELL_HOVER,
  WEEKDAY_CARD_SHADOW_RING,
} from "@/constants/dayCardVisual";

/** Horizontal row for Programs / Plans / short banner strips — top/bottom padding so hover lift isn’t clipped (sticky header + overflow-x) */
export const LIBRARY_CAROUSEL_ROW_CLASS =
  "flex items-start gap-2.5 overflow-x-auto scroll-smooth scrollbar-hide md:gap-3 pt-5 pb-3";

/** Nike-style gear-up row: very tight gutters, big portrait cards */
export const GEAR_UP_CAROUSEL_ROW_CLASS =
  "flex items-start gap-2 overflow-x-auto scroll-smooth scrollbar-hide pt-5 pb-3 md:gap-2";

export const LIBRARY_BANNER_IMAGE_SIZES = "(max-width: 768px) 236px, 268px";

/** Sizes for tall portrait workout / program cards (sharp thumbs) */
export const GEAR_UP_IMAGE_SIZES = "(max-width: 640px) 82vw, (max-width: 1024px) 300px, 360px";

/** FORM-style browse: ~4 tiles across at lg, 16:9 thumbs, ~16px gutters (digital.joinform.co browse) */
export const FORM_BROWSE_CAROUSEL_CLASS =
  "flex items-start gap-4 overflow-x-auto scroll-smooth scrollbar-hide pt-2 pb-1";

export const FORM_BROWSE_CARD_WIDTH_CLASS =
  "w-[260px] shrink-0 snap-start sm:w-[278px] lg:w-[296px]";

export const FORM_BROWSE_IMAGE_SIZES = "(max-width: 640px) 260px, (max-width: 1024px) 278px, 296px";

/**
 * 16:9 landscape tile, title + meta below (sharp corners, no card chrome).
 */
export function FormBrowseLandscapeLink({
  href,
  src,
  alt,
  title,
  metaLine,
  unoptimized = false,
}: {
  href: string;
  src: string;
  alt: string;
  title: string;
  metaLine: string;
  unoptimized?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex ${FORM_BROWSE_CARD_WIDTH_CLASS} flex-col rounded-none outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-none bg-neutral-100">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={FORM_BROWSE_IMAGE_SIZES}
          className="object-cover object-center"
          unoptimized={unoptimized}
        />
      </div>
      <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        {title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
        {metaLine}
      </p>
    </Link>
  );
}

export const RAIL_CARD_WIDTH =
  "w-[min(82vw,300px)] sm:w-[280px] md:w-[min(32vw,320px)] lg:w-[340px]";

/** Browse rails: lift only — no drop shadow on hover. */
export const RAIL_CARD_INTERACTION =
  "transition-all duration-300 ease-out will-change-transform hover:z-[45] hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/** Wide program / workout strip — sizing only */
export const LIBRARY_BANNER_CARD_CLASS =
  "group relative z-0 h-0 w-[236px] shrink-0 overflow-hidden rounded-lg bg-sand md:w-[268px]";

export const LIBRARY_BANNER_ASPECT_STYLE = {
  paddingBottom: "22.5%",
  scrollSnapAlign: "start" as const,
};

/**
 * Browse-rail card: sharp portrait image, bold caps title + meta tucked below (FORM-style),
 * hover reveals a compact bottom caption (title + truncated summary), not a full-image panel.
 */
export function FormStyleRailCard({
  href,
  src,
  alt,
  title,
  metaLine,
  hoverSummary,
  unoptimized = false,
  showLock = false,
}: {
  href: string;
  src: string;
  alt: string;
  title: string;
  /** Second line under title (e.g. duration, category) */
  metaLine: string;
  /** Paragraph inside the hover panel */
  hoverSummary: string;
  unoptimized?: boolean;
  showLock?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col rounded-none outline-none ${RAIL_CARD_INTERACTION}`}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-none bg-neutral-900">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={GEAR_UP_IMAGE_SIZES}
          className={DAY_CARD_IMAGE_HOVER}
          unoptimized={unoptimized}
        />
        <div
          className="pointer-events-none absolute left-2 bottom-2 z-[15] inline-flex max-h-[min(40vh,12rem)] max-w-[min(13.5rem,calc(100%-1rem))] min-h-0 flex-col gap-0 overflow-y-auto rounded-none border border-black/[0.08] bg-white/95 p-2.5 text-left opacity-0 shadow-sm transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none md:left-3 md:bottom-3 md:max-w-[min(13.5rem,calc(100%-1.5rem))]"
          aria-hidden
        >
          <p className="text-[11px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
            {title}
          </p>
          <p className="mt-1.5 line-clamp-6 text-xs leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
            {hoverSummary}
          </p>
        </div>
        {showLock && (
          <span
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
            aria-label="Subscribe to unlock"
            title="Subscribe to unlock"
          >
            <LockIcon size="sm" className="text-white" />
          </span>
        )}
      </div>
      <div className="mt-2 min-w-0 space-y-0.5">
        <p className="text-[13px] font-semibold leading-tight tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          {title}
        </p>
        <p className="text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
          {metaLine}
        </p>
      </div>
    </Link>
  );
}

/**
 * Same portrait rail tile as {@link FormStyleRailCard}, for in-page selection (e.g. audio library).
 */
export function FormStyleRailButton({
  onClick,
  src,
  alt,
  title,
  metaLine,
  hoverSummary,
  unoptimized = false,
  showLock = false,
  showDone = false,
  active = false,
  disabled = false,
}: {
  onClick: () => void;
  src: string;
  alt: string;
  title: string;
  metaLine: string;
  hoverSummary: string;
  unoptimized?: boolean;
  showLock?: boolean;
  showDone?: boolean;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Play ${title}`}
      aria-pressed={active}
      className={`group flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col rounded-none text-left outline-none ${RAIL_CARD_INTERACTION} focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-90 motion-reduce:active:opacity-100 disabled:pointer-events-none disabled:opacity-50`}
      style={{ scrollSnapAlign: "start" }}
    >
      <div
        className={`relative aspect-[4/5] w-full overflow-hidden rounded-none bg-neutral-900 ${active ? "ring-2 ring-inset ring-sky-blue/90" : ""}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={GEAR_UP_IMAGE_SIZES}
          className={DAY_CARD_IMAGE_HOVER}
          unoptimized={unoptimized}
        />
        <div
          className="pointer-events-none absolute left-2 bottom-2 z-[15] inline-flex max-h-[min(40vh,12rem)] max-w-[min(13.5rem,calc(100%-1rem))] min-h-0 flex-col gap-0 overflow-y-auto rounded-none border border-black/[0.08] bg-white/95 p-2.5 text-left opacity-0 shadow-sm transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none md:left-3 md:bottom-3 md:max-w-[min(13.5rem,calc(100%-1.5rem))]"
          aria-hidden
        >
          <p className="text-[11px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
            {title}
          </p>
          <p className="mt-1.5 line-clamp-6 text-xs leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
            {hoverSummary}
          </p>
        </div>
        {showDone && !showLock && (
          <span className="absolute left-2 top-2 z-20 bg-black/55 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            Done
          </span>
        )}
        {showLock && (
          <span
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
            aria-label="Subscribe to unlock"
            title="Subscribe to unlock"
          >
            <LockIcon size="sm" className="text-white" />
          </span>
        )}
      </div>
      <div className="mt-2 min-w-0 space-y-0.5">
        <p className="text-[13px] font-semibold leading-tight tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          {title}
        </p>
        <p className="text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
          {metaLine}
        </p>
      </div>
    </button>
  );
}

export function LibraryBannerCard({
  href,
  src,
  alt,
  subtitle,
  title,
  unoptimized = false,
  showLock = false,
}: {
  href: string;
  src: string;
  alt: string;
  subtitle: string;
  title: string;
  unoptimized?: boolean;
  showLock?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${LIBRARY_BANNER_CARD_CLASS} ${WEEKDAY_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`}
      style={LIBRARY_BANNER_ASPECT_STYLE}
    >
      {showLock && (
        <span
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
          aria-label="Subscribe to unlock"
          title="Subscribe to unlock"
        >
          <LockIcon size="sm" className="text-white" />
        </span>
      )}
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={LIBRARY_BANNER_IMAGE_SIZES}
          className={DAY_CARD_IMAGE_HOVER}
          unoptimized={unoptimized}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 from-25% to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 px-3 py-1.5">
        <p className="line-clamp-1 text-[9px] font-medium uppercase leading-none tracking-[0.18em] text-white/90">
          {subtitle}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs font-semibold leading-tight text-white [font-family:var(--font-headline),sans-serif] [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
          {title}
        </p>
      </div>
    </Link>
  );
}

export function LibraryCarouselArrows({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand bg-white text-gray transition hover:bg-cream"
        aria-label="Scroll left"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand bg-white text-gray transition hover:bg-cream"
        aria-label="Scroll right"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
