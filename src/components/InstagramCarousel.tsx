"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";
import Image from "next/image";

const INSTAGRAM_HANDLE = "awakeandalign_";

/** Natural content height — avoids a tall empty band between the feed and the sun/footer */
const INSTAGRAM_SECTION_LAYOUT =
  "flex flex-col border-t border-sand bg-transparent px-4 pt-16 pb-8 md:px-8 md:pt-20 md:pb-10";

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

export type CarouselPost = {
  id: string;
  imageUrl: string;
  linkUrl: string;
  alt: string | null;
};

/** Fallback when no posts are configured in admin – use existing public assets */
const PLACEHOLDER_IMAGES = ["/weekly-workouts.png", "/weekly-workouts2.png", "/weekly-workouts3.png"];
const PLACEHOLDER_POSTS: CarouselPost[] = PLACEHOLDER_IMAGES.flatMap((imageUrl, i) => [
  { id: `p${i}-1`, imageUrl, linkUrl: `https://instagram.com/${INSTAGRAM_HANDLE}`, alt: "Join the movement" },
  { id: `p${i}-2`, imageUrl, linkUrl: `https://instagram.com/${INSTAGRAM_HANDLE}`, alt: "Join the movement" },
]);

/** Limit feed to 1–2 rows to reduce repetition (was 3 rows) */
const MAX_POSTS = 6;

const SCROLL_AMOUNT = 280;

/** Renders EmbedSocial widget via their script + div (data-ref). */
function EmbedSocialWidget({ dataRef }: { dataRef: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dataRef || !containerRef.current) return;
    const id = "EmbedSocialHashtagScript";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://embedsocial.com/cdn/ht.js";
    script.async = true;
    document.head.appendChild(script);
  }, [dataRef]);

  return (
    <div ref={containerRef} className="instagram-embed-inner min-h-[480px] w-full md:min-h-[520px]">
      <div
        className="embedsocial-hashtag"
        data-ref={dataRef}
      />
    </div>
  );
}

type InstagramCarouselProps = {
  posts?: CarouselPost[];
  /** From server: EmbedSocial data-ref. When set, show widget only (no carousel). */
  embedRef?: string | null;
  /** From server: iframe embed URL. When set, show iframe only (no carousel). */
  embedIframeUrl?: string | null;
};

export default function InstagramCarousel({ posts = [], embedRef, embedIframeUrl }: InstagramCarouselProps) {
  const useWidget = Boolean(embedRef || embedIframeUrl);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [headingRevealed, setHeadingRevealed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [livePosts, setLivePosts] = useState<CarouselPost[] | null>(null);
  const [adminPosts, setAdminPosts] = useState<CarouselPost[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (useWidget) return;
    fetch("/api/instagram/feed")
      .then((r) => r.json())
      .then((body: { posts?: CarouselPost[] }) => {
        if (Array.isArray(body.posts) && body.posts.length > 0) {
          setLivePosts(body.posts);
          return;
        }
        return fetch("/api/carousel").then((r) => r.json());
      })
      .then((body?: { posts?: CarouselPost[] }) => {
        if (body && Array.isArray(body.posts) && body.posts.length > 0) setAdminPosts(body.posts);
      })
      .catch(() => {});
  }, [useWidget]);

  const rawPosts =
    livePosts?.length
      ? livePosts
      : adminPosts?.length
        ? adminPosts
        : posts?.length
          ? posts
          : PLACEHOLDER_POSTS;
  const displayPosts = rawPosts.slice(0, MAX_POSTS);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const onScroll = () => updateScrollState();

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.x;
    el.scrollLeft = dragStart.current.scrollLeft - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (el) el.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  useEffect(() => {
    const el = scrollRef.current;
    const run = () => requestAnimationFrame(updateScrollState);
    run();
    if (el) el.addEventListener("scroll", run);
    window.addEventListener("resize", run);
    return () => {
      if (el) el.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, [updateScrollState]);

  const igHeadlineClass =
    `text-xl font-light text-sky-blue md:text-2xl [font-family:var(--font-headline),sans-serif] ${!reduceMotion && !headingRevealed ? "opacity-0" : ""} ${!reduceMotion && headingRevealed ? "instagram-heading-animate" : ""}`;

  const igFollowClass =
    `text-sm font-medium text-sky-blue hover:underline ${!reduceMotion && !headingRevealed ? "opacity-0" : ""} ${!reduceMotion && headingRevealed ? "instagram-heading-animate" : ""}`;

  if (useWidget) {
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
              Join the movement @{INSTAGRAM_HANDLE}
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
              {embedIframeUrl ? (
                <iframe
                  src={embedIframeUrl}
                  title="Instagram feed"
                  className="h-[420px] min-w-full shrink-0 border-0 md:h-[520px] md:min-w-0"
                  loading="lazy"
                />
              ) : embedRef ? (
                <EmbedSocialWidget dataRef={embedRef} />
              ) : null}
            </div>
          </div>
          <InstagramSunBelowIcon />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={INSTAGRAM_SECTION_LAYOUT}
      aria-labelledby="instagram-carousel-heading"
    >
      <div className={INSTAGRAM_INNER_LAYOUT}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <h2
              id="instagram-carousel-heading"
              className={`min-w-0 ${igHeadlineClass}`}
              style={
                !reduceMotion && headingRevealed
                  ? ({ "--ig-reveal-delay": `${IG_HEADLINE_DELAY_MS}ms` } as CSSProperties)
                  : undefined
              }
            >
              Join the movement @{INSTAGRAM_HANDLE}
            </h2>
            <HeadingWaveMarks revealed={headingRevealed} reduceMotion={reduceMotion} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-blue/60 bg-white text-sky-blue transition hover:border-sky-blue hover:bg-light-yellow/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Scroll carousel left"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-blue/60 bg-white text-sky-blue transition hover:border-sky-blue hover:bg-light-yellow/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Scroll carousel right"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:inline ${igFollowClass}`}
              style={
                !reduceMotion && headingRevealed
                  ? ({ "--ig-reveal-delay": `${IG_FOLLOW_DELAY_MS}ms` } as CSSProperties)
                  : undefined
              }
            >
              Follow on Instagram
            </a>
          </div>
        </div>
        <a
          href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 inline-flex sm:hidden ${igFollowClass}`}
          style={
            !reduceMotion && headingRevealed
              ? ({ "--ig-reveal-delay": `${IG_FOLLOW_DELAY_MS}ms` } as CSSProperties)
              : undefined
          }
        >
          Follow on Instagram →
        </a>
        <div
          ref={scrollRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="mt-6 flex gap-4 overflow-x-auto scroll-smooth py-2 scrollbar-hide touch-pan-x"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          role="list"
          aria-label="Instagram posts"
        >
          {displayPosts.map((post) => (
            <a
              key={post.id}
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => isDragging && e.preventDefault()}
              className={`relative flex h-72 w-52 shrink-0 overflow-hidden rounded-lg bg-sand ring-1 ring-sand transition hover:ring-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 ${isDragging ? "pointer-events-none" : ""}`}
              role="listitem"
            >
              {post.imageUrl.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt={post.alt || "Instagram post"}
                  className="h-full w-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <Image
                  src={post.imageUrl}
                  alt={post.alt || "Instagram post"}
                  fill
                  sizes="208px"
                  className="object-cover select-none"
                  draggable={false}
                />
              )}
            </a>
          ))}
        </div>
        <InstagramSunBelowIcon />
      </div>
    </section>
  );
}
