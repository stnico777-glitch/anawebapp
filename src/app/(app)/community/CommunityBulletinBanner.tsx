"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CommunityFeedItem } from "@/lib/community-feed";
import {
  IconCelebrate,
  IconComment,
  IconEncourage,
  IconPrayer,
} from "@/components/CommunityIcons";
import CommunityPostDetailModal from "./CommunityPostDetailModal";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const MAX_PER_ROW = 48;
const BULLETIN_ICON = "h-5 w-5 shrink-0 opacity-[0.92] sm:h-[1.35rem] sm:w-[1.35rem]";

const TILTS_PRAYER = ["-1deg", "0.6deg", "-0.5deg", "0.8deg", "-0.4deg", "0.5deg"];
const TILTS_PRAISE = ["0.7deg", "-0.6deg", "0.4deg", "-0.8deg", "0.5deg", "-0.4deg"];

function prayersFrom(items: CommunityFeedItem[]): CommunityFeedItem[] {
  return [...items]
    .filter((x): x is CommunityFeedItem & { kind: "prayer" } => x.kind === "prayer")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, MAX_PER_ROW);
}

function praisesFrom(items: CommunityFeedItem[]): CommunityFeedItem[] {
  return [...items]
    .filter((x): x is CommunityFeedItem & { kind: "praise" } => x.kind === "praise")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, MAX_PER_ROW);
}

/** Full text for the card; ellipsis only from CSS line-clamp (uses visible space). */
function bulletinCardBodyText(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

/** Pushpin “through” the top edge of each note (rotates with the card). */
function BulletinCardEngagement({ item }: { item: CommunityFeedItem }) {
  if (item.kind === "prayer") {
    return (
      <div
        className="flex shrink-0 items-center gap-2 text-base tabular-nums text-foreground/90 sm:text-lg [font-family:var(--font-body),system-ui,sans-serif]"
        aria-hidden
      >
        <span
          className="inline-flex items-center gap-0.5"
          title={`${item.counts.pray} praying`}
        >
          <IconPrayer className={BULLETIN_ICON} />
          {item.counts.pray}
        </span>
        <span
          className="inline-flex items-center gap-0.5 tabular-nums"
          title={`${item.counts.encourage} encouragements`}
        >
          <IconEncourage className={BULLETIN_ICON} />
          {item.counts.encourage}
        </span>
        <span
          className="inline-flex items-center gap-0.5 tabular-nums"
          title={`${item.commentCount} comments`}
        >
          <IconComment className={BULLETIN_ICON} />
          {item.commentCount}
        </span>
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-base tabular-nums text-foreground/90 sm:text-lg [font-family:var(--font-body),system-ui,sans-serif]"
      aria-hidden
    >
      <span
        className="inline-flex items-center gap-0.5"
        title={`${item.counts.celebrate} celebrating`}
      >
        <IconCelebrate className={BULLETIN_ICON} />
        {item.counts.celebrate}
      </span>
      <span
        className="inline-flex items-center gap-0.5"
        title={`${item.commentCount} comments`}
      >
        <IconComment className={BULLETIN_ICON} />
        {item.commentCount}
      </span>
    </div>
  );
}

function bulletinCardAriaLabel(h: CommunityFeedItem): string {
  if (h.kind === "prayer") {
    return `Open full prayer from ${h.authorName}. ${h.counts.pray} praying, ${h.counts.encourage} encouragements, ${h.commentCount} comments`;
  }
  return `Open full praise from ${h.authorName}. ${h.counts.celebrate} celebrating, ${h.commentCount} comments`;
}

function BulletinCardPin({ kind }: { kind: "prayer" | "praise" }) {
  const head =
    kind === "prayer" ? "bg-sky-blue" : "bg-accent-amber";
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-[36%] flex-col items-center"
      aria-hidden
    >
      <span
        className={`relative block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#4a3d32] shadow-[0_2px_5px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.42)] ring-[1.5px] ring-white/55 sm:h-4 sm:w-4 ${head}`}
      />
      <span
        className="-mt-px h-2 w-[2px] shrink-0 rounded-full bg-gradient-to-b from-[#3a3028] via-[#3a3028]/70 to-transparent"
        aria-hidden
      />
    </span>
  );
}

type RowDirection = "forward" | "reverse";

function BulletinMarqueeRow({
  label,
  rowItems,
  reduceMotion,
  direction,
  tilts,
  onOpen,
  cardClassName,
  whenEmpty,
  pauseAnimation,
}: {
  label: string;
  rowItems: CommunityFeedItem[];
  reduceMotion: boolean;
  direction: RowDirection;
  tilts: string[];
  onOpen: (item: CommunityFeedItem) => void;
  /** Optional extra card classes */
  cardClassName?: string;
  whenEmpty?: ReactNode;
  /** When true, infinite marquee CSS is paused (e.g. section off-screen). */
  pauseAnimation?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [sway, setSway] = useState<{ driftPx: number; durationSec: number }>(() => ({
    driftPx: 40,
    durationSec: 18,
  }));

  if (rowItems.length === 0) {
    if (whenEmpty == null) return null;
    return (
      <div className="mt-6 first:mt-0">
        <p className="mb-3 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85 md:mb-4">
          {label}
        </p>
        {whenEmpty}
      </div>
    );
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const compute = () => {
      const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const driftPx = Math.max(40, Math.min(520, maxScroll || 56));
      // Heuristic: longer drift => longer cycle, keep within a pleasant range.
      const durationSec = Math.max(14, Math.min(34, 14 + driftPx / 18));
      setSway({ driftPx, durationSec });
    };

    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [rowItems.length]);

  const motionClass =
    reduceMotion
      ? ""
      : direction === "forward"
        ? "community-bulletin-sway-track"
        : "community-bulletin-sway-track-reverse";
  const pauseClass = motionClass && pauseAnimation ? " marquee-pause-when-hidden" : "";

  return (
    <div className="mt-6 first:mt-0">
      <p className="mb-3 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85 md:mb-4">
        {label}
      </p>
      <div
        ref={viewportRef}
        className={`relative px-0 ${
          reduceMotion ? "overflow-x-visible" : "[overflow-x:clip]"
        }`}
      >
        <div
          ref={trackRef}
          className={`flex gap-3 px-4 pb-1 pt-4 md:gap-4 md:px-6 ${
            reduceMotion
              ? "w-full max-w-full flex-wrap justify-center"
              : `w-max ${motionClass}${pauseClass}`
          }`}
          style={
            reduceMotion
              ? undefined
              : ({
                  ["--community-bulletin-sway-drift" as any]: `${sway.driftPx}px`,
                  ["--community-bulletin-sway-duration" as any]: `${sway.durationSec}s`,
                } as React.CSSProperties)
          }
        >
          {rowItems.map((h, i) => (
            <button
              key={`${h.kind}-${h.id}-row-${direction}-${i}`}
              type="button"
              onClick={() => onOpen(h)}
              aria-label={bulletinCardAriaLabel(h)}
              className={`relative flex h-[min(40vw,236px)] w-[min(40vw,220px)] shrink-0 flex-col overflow-visible rounded-xl border-2 border-[#B5A088] bg-[#F8F3EA] px-3.5 pb-2 pt-3.5 text-left shadow-md transition hover:ring-2 hover:ring-sky-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue sm:h-[244px] sm:w-[222px] md:h-[254px] md:w-[232px] ${cardClassName ?? ""}`}
              style={{
                transform: `rotate(${tilts[i % tilts.length]})`,
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.45) inset",
              }}
            >
              <BulletinCardPin kind={h.kind} />
              <div className="mb-1 flex flex-wrap items-center gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-sm font-bold uppercase tracking-wide sm:text-[0.9375rem] ${
                    h.kind === "prayer"
                      ? "bg-sky-blue/25 text-foreground"
                      : "bg-accent-amber/25 text-foreground"
                  }`}
                >
                  {h.kind === "prayer" ? "Prayer" : "Praise"}
                </span>
              </div>
              <p
                className="line-clamp-4 min-h-0 flex-1 text-xl leading-snug text-foreground sm:text-2xl sm:leading-snug"
                style={{
                  fontFamily: "var(--font-caveat), cursive",
                }}
              >
                {bulletinCardBodyText(h.content)}
              </p>
              <div className="mt-1 shrink-0 border-t border-sand/80 pt-1.5">
                <div className="flex items-end justify-between gap-2">
                  <p className="min-w-0 truncate text-base font-medium text-gray sm:text-lg">
                    {h.authorName}
                  </p>
                  <BulletinCardEngagement item={h} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CommunityBulletinBanner({
  items,
  locked = false,
  isGuest = false,
}: {
  items: CommunityFeedItem[];
  locked?: boolean;
  isGuest?: boolean;
}) {
  const prayerRow = useMemo(() => prayersFrom(items), [items]);
  const praiseRow = useMemo(() => praisesFrom(items), [items]);
  const [expanded, setExpanded] = useState<CommunityFeedItem | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [bulletinInView, setBulletinInView] = useState(true);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setBulletinInView(entry.isIntersecting);
      },
      { root: null, rootMargin: "48px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prayerRow.length, praiseRow.length]);

  const pauseMarquee = !bulletinInView && !reduceMotion;

  if (prayerRow.length === 0 && praiseRow.length === 0) return null;

  return (
    <>
      <section
        ref={sectionRef}
        className="community-bloom-scroll-enter relative mb-8 w-full overflow-x-hidden border-y border-[#C4B49A] py-6 pt-8 shadow-inner md:py-8 md:pt-10"
        style={{
          backgroundColor: "#C9B896",
          backgroundImage: [
            "linear-gradient(to bottom, rgba(255, 253, 248, 0.82) 0%, transparent 28%)",
            "linear-gradient(to top, rgba(255, 253, 248, 0.82) 0%, transparent 28%)",
            "linear-gradient(to right, rgba(255, 253, 248, 0.62) 0%, transparent 22%)",
            "linear-gradient(to left, rgba(255, 253, 248, 0.62) 0%, transparent 22%)",
            "radial-gradient(ellipse 95% 70% at 50% 35%, rgba(255,255,255,0.14) 0%, transparent 52%)",
            "radial-gradient(ellipse 55% 45% at 85% 92%, rgba(0,0,0,0.045) 0%, transparent 48%)",
          ].join(", "),
        }}
        aria-label="The Bloom Scroll — community prayer and praise highlights"
      >
        {/* Thumbtack: keep fully inside section (was clipped by overflow-hidden). */}
        <span
          className="absolute left-1/2 top-3 z-20 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#6B5344] bg-sky-blue shadow-md ring-2 ring-white/50 md:top-4 md:h-5 md:w-5"
          aria-hidden
        />
        <p className="mb-4 max-w-2xl px-4 text-center text-sm leading-snug text-foreground/90 [font-family:var(--font-body),sans-serif] md:mx-auto md:mb-5 md:text-[0.9375rem]">
          The Bloom Scroll is a living stream of community prayer and praise—tap a note to read it in full.
        </p>
        <BulletinMarqueeRow
          label="Prayer requests"
          rowItems={prayerRow}
          reduceMotion={reduceMotion}
          direction="forward"
          tilts={TILTS_PRAYER}
          onOpen={setExpanded}
          pauseAnimation={pauseMarquee}
        />

        {(prayerRow.length > 0 || praiseRow.length > 0) &&
          prayerRow.length > 0 && (
            <div
              className="mx-4 my-6 border-t border-[#A69076]/50 md:mx-6"
              aria-hidden
            />
          )}

        <BulletinMarqueeRow
          label="Praise reports"
          rowItems={praiseRow}
          reduceMotion={reduceMotion}
          direction="reverse"
          tilts={TILTS_PRAISE}
          onOpen={setExpanded}
          pauseAnimation={pauseMarquee}
          whenEmpty={
            <div className="mx-4 rounded-xl border-2 border-dashed border-[#A69076]/70 bg-[#F8F3EA]/90 px-4 py-8 text-center md:mx-6">
              <p className="text-sm font-medium text-foreground [font-family:var(--font-headline),sans-serif]">
                No praise posts yet
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray">
                When someone shares good news or gratitude, it’ll scroll here
                (opposite direction from prayers). Tap{" "}
                <span className="font-semibold text-sky-blue">+</span> to report
                praise anytime.
              </p>
            </div>
          }
        />

        {reduceMotion && (prayerRow.length > 1 || praiseRow.length > 1) && (
          <p className="mt-5 px-4 text-center text-[11px] text-foreground/75">
            Tap any card to read it in full.
          </p>
        )}
      </section>

      <CommunityPostDetailModal
        item={expanded}
        onClose={() => setExpanded(null)}
        locked={locked}
        isGuest={isGuest}
      />
    </>
  );
}
