"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const INSTAGRAM_HANDLE = "awakeandalign_";

/** Natural content height — avoids a tall empty band between the feed and the sun/footer */
const INSTAGRAM_SECTION_LAYOUT =
  "flex flex-col overflow-visible bg-transparent px-4 pt-16 pb-8 md:px-8 md:pt-20 md:pb-10";

const INSTAGRAM_INNER_LAYOUT = "relative mx-auto flex w-full max-w-6xl flex-col";

const HEADING_WAVE_MASK_STYLE: CSSProperties = {
  backgroundColor: "var(--sky-blue)",
  maskImage: "url('/schedule-wave.png')",
  WebkitMaskImage: "url('/schedule-wave.png')",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskSize: "contain",
  WebkitMaskSize: "contain",
};

const HEADING_WAVE_MARK_CLASS =
  "pointer-events-none h-16 w-[6.5rem] shrink-0 sm:h-[4.5rem] sm:w-32 md:h-20 md:w-36";

const HEADING_WAVE_COUNT = 5;

const IG_HEADLINE_DELAY_MS = 0;
const IG_WAVE_BASE_MS = 95;
const IG_WAVE_STAGGER_MS = 68;
const IG_FOLLOW_DELAY_MS = IG_WAVE_BASE_MS + IG_WAVE_STAGGER_MS * HEADING_WAVE_COUNT + 24;

/** Decorative waves to the right of the Instagram section heading — stagger L→R like nav items */
function HeadingWaveMarks({ revealed, reduceMotion }: { revealed: boolean; reduceMotion: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
      {Array.from({ length: HEADING_WAVE_COUNT }, (_, i) => (
        <div
          key={i}
          className={`${HEADING_WAVE_MARK_CLASS} ${!reduceMotion && !revealed ? "opacity-0" : ""} ${
            !reduceMotion && revealed ? "instagram-heading-animate" : ""
          }`}
          style={{
            ...HEADING_WAVE_MASK_STYLE,
            ...(!reduceMotion && revealed
              ? ({ "--ig-reveal-delay": `${IG_WAVE_BASE_MS + i * IG_WAVE_STAGGER_MS}ms` } as CSSProperties)
              : {}),
          }}
        />
      ))}
    </div>
  );
}

/** Sun-over-waves mark below the feed — same mask + slate treatment as schedule sun */
function InstagramSunBelowIcon() {
  return (
    <div className="mt-8 flex w-full justify-center pt-4 md:mt-10 md:pt-6">
      <div
        className="h-[132px] w-[132px] shrink-0 opacity-[0.92] md:h-[156px] md:w-[156px] lg:h-[172px] lg:w-[172px]"
        role="img"
        aria-label="Sunrise over waves"
        style={{
          backgroundColor: "#788287",
          maskImage: "url('/instagram-sun-waves.png')",
          WebkitMaskImage: "url('/instagram-sun-waves.png')",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    </div>
  );
}

const EMBEDSOCIAL_SCRIPT_ID = "EmbedSocialHashtagScript";

/** Renders EmbedSocial widget via their script + div (data-ref). */
function EmbedSocialWidget({ dataRef }: { dataRef: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dataRef || !containerRef.current) return;
    /**
     * ht.js only scans on load. Reusing a script tag from a previous mount (React Strict Mode, client
     * navigation, or lazy section mounting after the script ran) leaves a new `.embedsocial-hashtag` inert.
     * Single widget on the site: remove and reinject so the feed always initializes.
     */
    document.getElementById(EMBEDSOCIAL_SCRIPT_ID)?.remove();

    const script = document.createElement("script");
    script.id = EMBEDSOCIAL_SCRIPT_ID;
    script.src = "https://embedsocial.com/cdn/ht.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.getElementById(EMBEDSOCIAL_SCRIPT_ID)?.remove();
    };
  }, [dataRef]);

  return (
    <div ref={containerRef} className="instagram-embed-inner min-h-[480px] w-full md:min-h-[520px]">
      <div className="embedsocial-hashtag" data-ref={dataRef} />
    </div>
  );
}

const IG_EMBED_SKELETON_CLASS =
  "instagram-embed-inner min-h-[480px] w-full md:min-h-[520px] rounded-md bg-sand/25";

const IG_LAZY_ROOT_MARGIN_PX = 280;

function isNearViewport(el: Element, marginPx: number): boolean {
  const r = el.getBoundingClientRect();
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  return r.top < vh + marginPx && r.bottom > -marginPx;
}

/**
 * Defers iframe + EmbedSocial script/DOM until the feed is near the viewport (saves network + main thread on homepage scroll).
 */
function LazyInstagramFeedEmbed({
  embedIframeUrl,
  embedRef,
}: {
  embedIframeUrl: string | null;
  embedRef: string | null;
}) {
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load || (!embedIframeUrl && !embedRef) || !sentinelEl) return;

    let cancelled = false;
    let io: IntersectionObserver | null = null;

    const activate = () => {
      if (cancelled) return;
      setLoad(true);
    };

    const trySyncNear = () => {
      if (isNearViewport(sentinelEl, IG_LAZY_ROOT_MARGIN_PX)) {
        activate();
        return true;
      }
      return false;
    };

    if (trySyncNear()) return;

    const raf = requestAnimationFrame(() => {
      if (cancelled || trySyncNear()) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            io?.disconnect();
            io = null;
            activate();
          }
        },
        { rootMargin: `${IG_LAZY_ROOT_MARGIN_PX}px 0px`, threshold: 0 },
      );
      io.observe(sentinelEl);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [embedIframeUrl, embedRef, load, sentinelEl]);

  return (
    <div ref={setSentinelEl} className="w-full">
      {load && embedIframeUrl ? (
        <iframe
          src={embedIframeUrl}
          title="Instagram feed"
          className="h-[420px] min-w-full shrink-0 border-0 md:h-[520px] md:min-w-0"
          loading="lazy"
        />
      ) : load && embedRef ? (
        <EmbedSocialWidget dataRef={embedRef} />
      ) : (
        <div className={IG_EMBED_SKELETON_CLASS} aria-hidden />
      )}
    </div>
  );
}

type InstagramCarouselProps = {
  /** EmbedSocial data-ref from server env. */
  embedRef?: string | null;
  /** Optional iframe embed URL from server env. */
  embedIframeUrl?: string | null;
};

export default function InstagramCarousel({ embedRef, embedIframeUrl }: InstagramCarouselProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [headingRevealed, setHeadingRevealed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      const rm = mq.matches;
      setReduceMotion(rm);
      if (rm) setHeadingRevealed(true);
    };
    syncMotion();
    mq.addEventListener("change", syncMotion);
    return () => mq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const el = sectionRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setHeadingRevealed(true);
          ob.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduceMotion]);

  const igHeadlineClass =
    `text-lg font-normal leading-[1.4] tracking-[0.135em] text-sky-blue [font-synthesis:none] md:text-xl [font-family:var(--font-headline),sans-serif] ${!reduceMotion && !headingRevealed ? "opacity-0" : ""} ${!reduceMotion && headingRevealed ? "instagram-heading-animate" : ""}`;

  const igFollowClass =
    `text-sm font-medium text-sky-blue [font-family:var(--font-body),sans-serif] hover:underline ${!reduceMotion && !headingRevealed ? "opacity-0" : ""} ${!reduceMotion && headingRevealed ? "instagram-heading-animate" : ""}`;

  return (
    <section
      ref={sectionRef}
      className={INSTAGRAM_SECTION_LAYOUT}
      aria-labelledby="instagram-carousel-heading"
    >
      <div className={INSTAGRAM_INNER_LAYOUT}>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <h2
            id="instagram-carousel-heading"
            className={igHeadlineClass}
            style={
              !reduceMotion && headingRevealed
                ? ({ "--ig-reveal-delay": `${IG_HEADLINE_DELAY_MS}ms` } as CSSProperties)
                : undefined
            }
          >
            <span className="capitalize">Join the movement</span>{" "}
            <span className="normal-case">@{INSTAGRAM_HANDLE}</span>
          </h2>
          <HeadingWaveMarks revealed={headingRevealed} reduceMotion={reduceMotion} />
        </div>
        <a
          href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 inline-block ${igFollowClass}`}
          style={
            !reduceMotion && headingRevealed
              ? ({ "--ig-reveal-delay": `${IG_FOLLOW_DELAY_MS}ms` } as CSSProperties)
              : undefined
          }
        >
          Follow on Instagram →
        </a>
        <div className="instagram-embed-mobile-scroll mt-6 overflow-hidden rounded-lg border border-sand bg-background/90 md:overflow-visible">
          <div className="instagram-embed-scroll-container flex max-h-[420px] overflow-x-auto overflow-y-hidden px-[calc((100vw-280px)/2)] -mx-4 md:mx-0 md:px-0 md:max-h-none md:overflow-visible md:block scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {embedIframeUrl || embedRef ? (
              <LazyInstagramFeedEmbed embedIframeUrl={embedIframeUrl ?? null} embedRef={embedRef ?? null} />
            ) : null}
          </div>
        </div>
        <InstagramSunBelowIcon />
      </div>
    </section>
  );
}
