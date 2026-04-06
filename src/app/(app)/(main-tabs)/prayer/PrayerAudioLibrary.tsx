"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PrayerPlayer from "./PrayerPlayer";
import MusicSpotlightLottie from "@/components/MusicSpotlightLottie";
import {
  FormStyleRailButton,
  FormStyleRailCard,
  GEAR_UP_CAROUSEL_ROW_CLASS,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
import { DAY_CARD_IMAGE_HOVER } from "@/constants/dayCardVisual";
import { PRAYER_COVER_PATHS } from "@/constants/prayerCovers";
import { AUDIO_LIBRARY_MIXED_COVER_CYCLE } from "@/constants/audioLibraryCovers";

export type PrayerLibraryItem = {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  audioUrl: string;
  duration: number;
  coverImageUrl: string | null;
};

/** Curated plans — same rail pattern as Movement “Programs” (portrait cards + hover summary) */
const PRAYER_PLAN_PLACEHOLDERS = [
  {
    title: "7 Days of Morning Prayer",
    meta: "Plan · 7 sessions",
    image: PRAYER_COVER_PATHS[6],
    summary:
      "Gentle guided openings for the first week—short listens you can stack daily or repeat when mornings feel full.",
  },
  {
    title: "Peace & Stillness Series",
    meta: "Series · 5 sessions",
    image: PRAYER_COVER_PATHS[1],
    summary:
      "Slower tempos and breath-led pauses when you need your nervous system to catch up with your spirit.",
  },
  {
    title: "Anxiety to Rest",
    meta: "Journey · 4 sessions",
    image: PRAYER_COVER_PATHS[7],
    summary:
      "Honest prayers that name worry, trade it for truth, and land in a quieter mind before you sleep.",
  },
  {
    title: "Gratitude & Praise",
    meta: "Collection · 6 sessions",
    image: PRAYER_COVER_PATHS[0],
    summary:
      "Celebrate small wins and big mercy—audio that turns your attention toward what God is already doing.",
  },
  {
    title: "Sabbath Soul Sundays",
    meta: "Rest · 3 sessions",
    image: PRAYER_COVER_PATHS[5],
    summary:
      "Lower volume, fewer words, more room—ideal when you want rest without rushing back to the week.",
  },
  {
    title: "Affirmations Intensive",
    meta: "Challenge · 7 sessions",
    image: PRAYER_COVER_PATHS[3],
    summary:
      "Short declarative listens you can loop while driving, walking, or folding laundry—truth on repeat.",
  },
  {
    title: "Scripture Listening Path",
    meta: "Audio · 8 sessions",
    image: PRAYER_COVER_PATHS[4],
    summary:
      "Let the Word read to you—clean pacing and space between phrases so sentences can land.",
  },
  {
    title: "Evening Wind-Down",
    meta: "Night · 5 sessions",
    image: PRAYER_COVER_PATHS[0],
    summary:
      "Unhook from the day with slower voice and softer music—bridge the gap between doing and sleeping.",
  },
  {
    title: "Healing & Hope",
    meta: "Focus · 4 sessions",
    image: PRAYER_COVER_PATHS[2],
    summary:
      "When you’re tender-hearted but still believing—honest language and steady reminders you’re held.",
  },
];

/** Lofi prayer art + music spotlight + workout stills (matches seed mix). */
const FALLBACK_COVERS = [...AUDIO_LIBRARY_MIXED_COVER_CYCLE];

const PLAN_HREF = "/prayer#prayer-library";

type MusicSpotlightAlbum = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  listenUrl?: string | null;
};

/** Curated covers in `public/music-spotlight/` — add `listenUrl` for outbound streaming. */
const CHRISTIAN_MUSIC_SPOTLIGHT: MusicSpotlightAlbum[] = [
  {
    id: "trust-in-god",
    title: "Trust in God",
    artist: "feat. Chris Brown",
    cover: "/music-spotlight/01-trust-in-god.png",
  },
  {
    id: "creation-vinyl",
    title: "The Gift of Sound",
    artist: "Sunday Hymnal",
    cover: "/music-spotlight/02-creation-vinyl.png",
  },
  {
    id: "scratch-amen",
    title: "Scratch the Amen",
    artist: "DJ Whiskers",
    cover: "/music-spotlight/03-dj-cat.png",
  },
  {
    id: "no-longer-bound",
    title: "No Longer Bound",
    artist: "Rise Collective",
    cover: "/music-spotlight/04-no-longer-bound.png",
  },
  {
    id: "out-on-the-water",
    title: "Out on the Water",
    artist: "Selah Blue",
    cover: "/music-spotlight/05-ocean-solitude.png",
  },
  {
    id: "god-is-good",
    title: "God Is Good",
    artist: "Glow Worship",
    cover: "/music-spotlight/06-god-is-good.png",
  },
  {
    id: "through-the-veil",
    title: "Through the Veil",
    artist: "Cloud & Crown",
    cover: "/music-spotlight/07-heaven-gaze.png",
  },
  {
    id: "neon-psalms",
    title: "Neon Psalms",
    artist: "Retro Saints",
    cover: "/music-spotlight/08-night-drive.png",
  },
];

const ALBUM_CARD_WIDTH_CLASS =
  "w-[min(44vw,188px)] sm:w-[188px] md:w-[204px] lg:w-[216px]";

const ALBUM_IMAGE_SIZES = "(max-width: 640px) 44vw, (max-width: 1024px) 188px, 216px";

const MUSIC_SPOTLIGHT_SHELL_CLASS = `group flex ${ALBUM_CARD_WIDTH_CLASS} shrink-0 flex-col rounded-sm text-left ring-1 ring-sky-blue/35 transition-all duration-300 ease-out will-change-transform hover:z-[2] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`;

function MusicSpotlightAlbumTile({ album }: { album: MusicSpotlightAlbum }) {
  const body = (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-neutral-900">
        <Image
          src={album.cover}
          alt={`${album.title} — ${album.artist}`}
          fill
          sizes={ALBUM_IMAGE_SIZES}
          className={`${DAY_CARD_IMAGE_HOVER} rounded-sm`}
        />
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        {album.title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
        {album.artist}
      </p>
    </>
  );

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

function formatDurationMins(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}

function coverForPrayer(p: PrayerLibraryItem, index: number): { src: string; unoptimized: boolean } {
  if (p.coverImageUrl?.trim()) {
    const u = p.coverImageUrl.trim();
    const unoptimized = u.startsWith("http://") || u.startsWith("https://");
    return { src: u, unoptimized };
  }
  return { src: FALLBACK_COVERS[index % FALLBACK_COVERS.length], unoptimized: false };
}

/** No two adjacent tiles share the same art URL (exact match). */
function railCoversDeduped(
  list: PrayerLibraryItem[],
): { src: string; unoptimized: boolean }[] {
  const out: { src: string; unoptimized: boolean }[] = [];
  let prevSrc: string | null = null;
  list.forEach((p, index) => {
    let cov = coverForPrayer(p, index);
    if (prevSrc !== null && cov.src === prevSrc) {
      for (let k = 0; k < FALLBACK_COVERS.length; k++) {
        const alt = FALLBACK_COVERS[(index + k + 1) % FALLBACK_COVERS.length];
        if (alt !== prevSrc) {
          cov = { src: alt, unoptimized: false };
          break;
        }
      }
    }
    out.push(cov);
    prevSrc = cov.src;
  });
  return out;
}

function prayerMetaLine(p: PrayerLibraryItem, completed: boolean): string {
  if (completed) return "Completed";
  return `${formatDurationMins(p.duration)} · Audio`;
}

function prayerHoverSummary(p: PrayerLibraryItem): string {
  const bits: string[] = [];
  const scripture = p.scripture?.trim();
  if (scripture) bits.push(scripture);
  const desc = p.description?.trim();
  if (desc) bits.push(desc);
  bits.push(
    `${formatDurationMins(p.duration)} guided audio—tap to play and listen with intention.`,
  );
  return bits.join(" ");
}

function CatalogCoverImage({
  src,
  unoptimized,
  className,
  sizes,
  priority,
}: {
  src: string;
  unoptimized: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (unoptimized) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote audio library art; URLs not in next.config
      <img
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

type PrayerAudioLibraryProps = {
  prayers: PrayerLibraryItem[];
  completedIds: string[];
  isSubscriber: boolean;
};

export default function PrayerAudioLibrary({
  prayers,
  completedIds,
  isSubscriber,
}: PrayerAudioLibraryProps) {
  const plansRef = useRef<HTMLDivElement>(null);
  const audioLibraryRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="min-h-screen w-full max-w-none bg-app-surface">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <section className="mb-14 md:mb-16" aria-labelledby="audio-collections-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="audio-collections-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Collections
            </h2>
            <LibraryCarouselArrows scrollRef={plansRef} />
          </div>
          <div
            ref={plansRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {PRAYER_PLAN_PLACEHOLDERS.map((p) => (
              <FormStyleRailCard
                key={p.title}
                href={PLAN_HREF}
                src={p.image}
                alt={p.title}
                title={p.title}
                metaLine={p.meta}
                hoverSummary={p.summary}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="mb-14 w-full md:mb-16" aria-labelledby="audio-essentials-heading">
        <div className="mx-auto mb-4 max-w-7xl px-4 md:mb-5 md:px-6">
          <h2
            id="audio-essentials-heading"
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            Essentials
          </h2>
        </div>
        <div className="grid w-full grid-cols-1 gap-0 sm:grid-cols-2">
          <Link
            href={PLAN_HREF}
            className="group relative block aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
          >
            <Image
              src={PRAYER_COVER_PATHS[5]}
              alt="Guided prayer and daily devotion"
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
              <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
                Guided prayer
              </p>
              <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
                stillness · presence · breath
              </p>
              <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
            </div>
          </Link>
          <Link
            href="#prayer-library"
            className="group relative block aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
          >
            <Image
              src="/music-spotlight/02-creation-vinyl.png"
              alt="Scripture audio and restful listening"
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
              <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
                Scripture &amp; stillness
              </p>
              <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
                listen · rest · renew
              </p>
              <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
            </div>
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
        <section className="mb-8 scroll-mt-6 md:mb-10" id="prayer-library" aria-labelledby="prayer-library-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="prayer-library-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Library
            </h2>
            {prayers.length > 0 ? <LibraryCarouselArrows scrollRef={audioLibraryRef} /> : null}
          </div>

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
        </section>
      </div>

      <section
        className="mt-12 w-full max-w-none scroll-mt-8 border-t border-sand pt-10 pb-12 md:mt-14 md:pt-12 md:pb-16"
        id="christian-music-spotlight"
        aria-labelledby="christian-music-spotlight-heading"
      >
        <div className="mx-auto mb-5 max-w-7xl px-4 sm:mb-6 md:px-6">
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
        </div>

        <div
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

          <div className="music-spotlight-marquee-track items-start py-1 motion-reduce:px-4 md:motion-reduce:px-6">
            <div className="flex shrink-0 items-start gap-2 pr-2 md:gap-2">
              {CHRISTIAN_MUSIC_SPOTLIGHT.map((album) => (
                <MusicSpotlightAlbumTile key={album.id} album={album} />
              ))}
            </div>
            <div className="flex shrink-0 items-start gap-2 pr-2 md:gap-2" aria-hidden="true">
              {CHRISTIAN_MUSIC_SPOTLIGHT.map((album) => (
                <MusicSpotlightAlbumTile key={`marquee-b-${album.id}`} album={album} />
              ))}
            </div>
          </div>
        </div>

        {/* Full viewport bleed — margin trick reaches true edges even with scrollbar / containing blocks. */}
        <div className="relative z-0 mt-2 w-screen max-w-none shrink-0 ml-[calc(50%-50vw)] md:mt-3">
          <MusicSpotlightLottie />
        </div>
      </section>
    </div>
  );
}
