/**
 * Routine day cards (schedule) & prayer portrait tiles — keep Sunday + prayer in sync.
 */
export const DAY_CARD_IMAGE_HOVER =
  "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

export const DAY_CARD_SHELL_HOVER =
  "transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:will-change-transform hover:z-[45] hover:-translate-y-3 hover:scale-[1.02] hover:ring-2 hover:ring-accent-amber/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100";

/** Monday–Saturday schedule column — ring only, no drop shadow */
export const WEEKDAY_CARD_SHADOW_RING = "ring-1 ring-sky-blue/40";

/** Sunday Sabbath + prayer / audio portrait cards */
export const SABBATH_CARD_SHADOW_RING = "ring-1 ring-accent-amber/50";

/** Primary line — Sunday on weekly grid (no photo tint; type reads on art as before) */
export const SABBATH_CARD_TITLE_CLASS =
  "text-sm font-light tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]";

/** Secondary line — Sunday on weekly grid */
export const SABBATH_CARD_SUBTITLE_CLASS =
  "mt-0.5 text-[11px] font-normal tracking-wide text-gray";

/** Sky-blue lock chip on locked / guest-preview tiles (marketing schedule strip, rails, hero tiles). */
export const THEMED_LOCK_BADGE_CLASS =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-blue text-white shadow-[0_2px_8px_rgba(110,173,228,0.45)]";

/** Slightly larger lock chip for wide landscape hero / essentials tiles. */
export const THEMED_LOCK_BADGE_LG_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-blue text-white shadow-[0_2px_8px_rgba(110,173,228,0.45)]";

/** Carousel portrait: fixed width + snap + same aspect & hover as schedule Sunday */
export const SABBATH_PORTRAIT_CAROUSEL_CLASS =
  `group relative z-0 aspect-[3/4.85] w-[148px] shrink-0 snap-start overflow-hidden rounded-lg bg-transparent sm:w-[156px] md:w-[164px] ${SABBATH_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`;
