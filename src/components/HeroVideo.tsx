"use client";

import { useSyncExternalStore, useRef, useState, useEffect, useCallback } from "react";

/** Web-optimized H.264 @ 30fps (`npm run hero:30fps`). Avoids 4K HEVC + oversized carousel sources. */
const HERO_CLIP_HASH = "#t=0.001";

const HERO_VIDEO = {
  sm: `/hero-video-sm.mp4${HERO_CLIP_HASH}`,
  lg: `/hero-video-lg.mp4${HERO_CLIP_HASH}`,
} as const;

const HERO_REVERSE = {
  sm: `/hero-video-reverse-sm.mp4${HERO_CLIP_HASH}`,
  lg: `/hero-video-reverse-lg.mp4${HERO_CLIP_HASH}`,
} as const;

const HERO_CAROUSEL_CLIPS = [
  { sm: HERO_VIDEO.sm, lg: HERO_VIDEO.lg },
  {
    sm: `/hero-carousel-awake-align-sm.mp4${HERO_CLIP_HASH}`,
    lg: `/hero-carousel-awake-align-lg.mp4${HERO_CLIP_HASH}`,
  },
] as const;

const HERO_POSTER = "/hero-video-poster.jpg";

/** First carousel clip only — longer on-screen (timeline still runs to `ended`). */
const FIRST_HERO_CLIP_PLAYBACK_RATE = 0.75;

function playbackRateForCarouselClipIndex(clipIndex: number): number {
  return clipIndex === 0 ? FIRST_HERO_CLIP_PLAYBACK_RATE : 1;
}

/**
 * Visible slot always shows `currentIndex`; the other slot preloads the next clip.
 * (Indexing only by slot number was wrong after the first swap and broke A→B order.)
 */
function carouselClipIndexForSlot(
  slot: 0 | 1,
  currentIndex: number,
  visibleSlot: 0 | 1,
  len: number,
): number {
  if (visibleSlot === slot) return currentIndex;
  return (currentIndex + 1) % len;
}

function HeroResponsiveSources({
  sm,
  lg,
  /** Smaller transcodes only — less decode work when user prefers reduced motion (still plays video). */
  preferSmOnly = false,
}: {
  sm: string;
  lg: string;
  preferSmOnly?: boolean;
}) {
  if (preferSmOnly) {
    return <source src={sm} type="video/mp4" />;
  }
  return (
    <>
      <source media="(max-width: 768px)" src={sm} type="video/mp4" />
      <source src={lg} type="video/mp4" />
    </>
  );
}

function playWhenReady(el: HTMLVideoElement, onStarted: () => void): void {
  const run = () => {
    void el.play().then(onStarted).catch(() => {});
  };
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    run();
    return;
  }
  const onCanPlay = () => {
    el.removeEventListener("canplay", onCanPlay);
    run();
  };
  el.addEventListener("canplay", onCanPlay);
}

function scheduleSwapOnFirstFrame(video: HTMLVideoElement, onSwap: () => void) {
  const rvfc = video.requestVideoFrameCallback?.bind(video);
  if (typeof rvfc === "function") {
    rvfc(() => {
      onSwap();
    });
    return;
  }
  const onTimeUpdate = () => {
    if (video.currentTime > 0.01) {
      video.removeEventListener("timeupdate", onTimeUpdate);
      onSwap();
    }
  };
  video.addEventListener("timeupdate", onTimeUpdate);
}

function subscribePrefersReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false,
  );
}

/**
 * Pauses decode/playback when the hero is off-screen (major GPU/CPU save while scrolling).
 * Resumes when the hero intersects the viewport again.
 */
function useHeroInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView] as const;
}

/** Bias for `object-fit: cover` when the hero band is short — `upper` shows more of the top/middle of the source. */
function objectCoverPositionClass(
  pos: "center" | "bottom" | "top" | "upper",
): string {
  switch (pos) {
    case "bottom":
      return "object-cover object-bottom";
    case "top":
      return "object-cover object-top";
    case "upper":
      return "object-cover object-[50%_52%]";
    default:
      return "object-cover object-center";
  }
}

function HeroVideoCarousel({
  objectPosition = "center",
  preferLowBandwidth = false,
}: {
  objectPosition?: "center" | "bottom" | "top";
  preferLowBandwidth?: boolean;
}) {
  const coverClass = objectCoverPositionClass(objectPosition);
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const visibleSlotRef = useRef(0);
  const currentIndexRef = useRef(0);
  /** Avoid treating a bogus `ended` at load as real (WebKit); some UIs reset `currentTime` to 0 on real `ended`. */
  const playedPastStartRef = useRef<[boolean, boolean]>([false, false]);
  const [visibleSlot, setVisibleSlot] = useState<0 | 1>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrapRef, heroInView] = useHeroInView<HTMLDivElement>();
  const heroInViewRef = useRef(heroInView);
  useEffect(() => {
    heroInViewRef.current = heroInView;
  }, [heroInView]);

  const len = HERO_CAROUSEL_CLIPS.length;
  const idx0 = carouselClipIndexForSlot(0, currentIndex, visibleSlot, len);
  const idx1 = carouselClipIndexForSlot(1, currentIndex, visibleSlot, len);
  const clip0 = HERO_CAROUSEL_CLIPS[idx0];
  const clip1 = HERO_CAROUSEL_CLIPS[idx1];

  useEffect(() => {
    visibleSlotRef.current = visibleSlot;
  }, [visibleSlot]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const el0 = ref0.current;
    const el1 = ref1.current;
    if (el0) el0.playbackRate = playbackRateForCarouselClipIndex(idx0);
    if (el1) el1.playbackRate = playbackRateForCarouselClipIndex(idx1);
  }, [idx0, idx1]);

  useEffect(() => {
    const v0 = ref0.current;
    const v1 = ref1.current;
    if (!v0 || !v1) return;
    if (!heroInView) {
      v0.pause();
      v1.pause();
      return;
    }
    const active = visibleSlot === 0 ? v0 : v1;
    void active.play().catch(() => {});
  }, [heroInView, visibleSlot]);

  const onSlotEnded = useCallback((slot: 0 | 1) => {
    if (!heroInViewRef.current) return;
    if (visibleSlotRef.current !== slot) return;
    const endedEl = slot === 0 ? ref0.current : ref1.current;
    if (
      endedEl &&
      Number.isFinite(endedEl.duration) &&
      endedEl.duration > 1 &&
      endedEl.currentTime < 0.05 &&
      !playedPastStartRef.current[slot]
    ) {
      return;
    }
    const v = slot;
    const h = (1 - v) as 0 | 1;
    const visibleEl = v === 0 ? ref0.current : ref1.current;
    const hiddenEl = h === 0 ? ref0.current : ref1.current;
    if (!visibleEl || !hiddenEl) return;

    const nextIdx = (currentIndexRef.current + 1) % len;
    hiddenEl.playbackRate = playbackRateForCarouselClipIndex(nextIdx);
    hiddenEl.currentTime = 0;
    let swapped = false;
    const doSwap = () => {
      if (swapped) return;
      swapped = true;
      visibleEl.pause();
      visibleSlotRef.current = h;
      setVisibleSlot(h);
      setCurrentIndex((i) => {
        playedPastStartRef.current[0] = false;
        playedPastStartRef.current[1] = false;
        return (i + 1) % len;
      });
    };

    playWhenReady(hiddenEl, () => {
      scheduleSwapOnFirstFrame(hiddenEl, doSwap);
    });
  }, [len]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 isolate overflow-hidden bg-black [transform:translateZ(0)]"
    >
      {/*
        Stack both clips at full opacity (z-index only). Opacity:0 on the “hidden”
        slot prevents reliable decode/play on some browsers (esp. WebKit), so the
        second carousel file never appeared after the first clip ended.
      */}
      <video
        key={`c0-${idx0}`}
        ref={ref0}
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        style={{
          zIndex: visibleSlot === 0 ? 2 : 1,
          pointerEvents: visibleSlot === 0 ? "auto" : "none",
        }}
        autoPlay={visibleSlot === 0 && currentIndex === 0}
        muted
        playsInline
        disablePictureInPicture
        preload={visibleSlot === 0 ? "auto" : "metadata"}
        poster={HERO_POSTER}
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = playbackRateForCarouselClipIndex(idx0);
        }}
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > 0.12) playedPastStartRef.current[0] = true;
        }}
        onEnded={() => onSlotEnded(0)}
      >
        <HeroResponsiveSources
          sm={clip0.sm}
          lg={clip0.lg}
          preferSmOnly={preferLowBandwidth}
        />
      </video>
      <video
        key={`c1-${idx1}`}
        ref={ref1}
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        style={{
          zIndex: visibleSlot === 1 ? 2 : 1,
          pointerEvents: visibleSlot === 1 ? "auto" : "none",
        }}
        muted
        playsInline
        disablePictureInPicture
        preload={visibleSlot === 1 ? "auto" : "metadata"}
        poster={HERO_POSTER}
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = playbackRateForCarouselClipIndex(idx1);
        }}
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > 0.12) playedPastStartRef.current[1] = true;
        }}
        onEnded={() => onSlotEnded(1)}
      >
        <HeroResponsiveSources
          sm={clip1.sm}
          lg={clip1.lg}
          preferSmOnly={preferLowBandwidth}
        />
      </video>
      <div className="pointer-events-none absolute inset-0 z-[3] bg-black/5" aria-hidden />
    </div>
  );
}

/**
 * Ping‑pong loop using two files: forward clip, then reversed clip (still decoded forward).
 * Browsers can’t smoothly scrub `currentTime` backward on typical HEVC/H.264; without `hero-video-reverse.mp4`
 * we fall back to rAF scrubbing (choppy). Regenerate the reverse file any time `hero-video.mp4` changes.
 */
function HeroVideoPingPong({
  objectPosition = "center",
}: {
  objectPosition?: "center" | "bottom" | "top" | "upper";
}) {
  const coverClass = objectCoverPositionClass(objectPosition);
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState<"forward" | "reverse">("forward");
  const [useDual, setUseDual] = useState(true);
  const useDualRef = useRef(true);
  const [wrapRef, heroInView] = useHeroInView<HTMLDivElement>();

  useEffect(() => {
    useDualRef.current = useDual;
  }, [useDual]);

  const rafRef = useRef(0);
  const phaseRef = useRef<"forward" | "reverse">("forward");
  const lastFrameRef = useRef(0);

  const cancelRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const stepRafReverse = useCallback(function stepRafReverse(now: number) {
    const v = forwardRef.current;
    if (!v) return;
    const last = lastFrameRef.current;
    const raw = (now - last) / 1000;
    const dt = Math.min(Math.max(raw, 0), 1 / 24);
    lastFrameRef.current = now;
    const next = v.currentTime - dt;
    if (next <= 0.02) {
      cancelRaf();
      v.currentTime = 0;
      phaseRef.current = "forward";
      v.playbackRate = 1;
      void v.play().catch(() => {});
      return;
    }
    v.currentTime = next;
    rafRef.current = requestAnimationFrame(stepRafReverse);
  }, [cancelRaf]);

  const startRafReverse = useCallback(() => {
    const v = forwardRef.current;
    if (!v) return;
    cancelRaf();
    v.pause();
    phaseRef.current = "reverse";
    if (!Number.isFinite(v.duration) || v.duration <= 0) {
      phaseRef.current = "forward";
      v.currentTime = 0;
      void v.play().catch(() => {});
      return;
    }
    v.currentTime = v.duration;
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(stepRafReverse);
  }, [cancelRaf, stepRafReverse]);

  useEffect(() => {
    const fwd = forwardRef.current;
    const rev = reverseRef.current;
    if (!heroInView) {
      cancelRaf();
      fwd?.pause();
      rev?.pause();
      return;
    }
    if (active === "forward" && fwd) void fwd.play().catch(() => {});
    else if (active === "reverse" && rev) void rev.play().catch(() => {});
  }, [heroInView, active, cancelRaf]);

  useEffect(() => {
    const fwd = forwardRef.current;
    if (!fwd) return;

    const onForwardEnded = () => {
      if (!useDualRef.current) {
        if (phaseRef.current !== "forward") return;
        startRafReverse();
        return;
      }
      const rev = reverseRef.current;
      fwd.pause();
      if (!rev) {
        startRafReverse();
        return;
      }
      rev.currentTime = 0;
      setActive("reverse");
      void rev.play().catch(() => {
        useDualRef.current = false;
        setUseDual(false);
        setActive("forward");
        startRafReverse();
      });
    };

    fwd.addEventListener("ended", onForwardEnded);
    return () => fwd.removeEventListener("ended", onForwardEnded);
  }, [startRafReverse]);

  useEffect(() => {
    const rev = reverseRef.current;
    if (!rev || !useDual) return;

    const onReverseEnded = () => {
      const fwd = forwardRef.current;
      rev.pause();
      if (fwd) {
        fwd.currentTime = 0;
        setActive("forward");
        void fwd.play().catch(() => {});
      }
    };

    rev.addEventListener("ended", onReverseEnded);
    return () => rev.removeEventListener("ended", onReverseEnded);
  }, [useDual]);

  const onReverseError = () => {
    useDualRef.current = false;
    setUseDual(false);
    setActive("forward");
    const fwd = forwardRef.current;
    if (fwd) {
      fwd.currentTime = 0;
      void fwd.play().catch(() => {});
    }
  };

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 isolate overflow-hidden bg-black [transform:translateZ(0)]"
    >
      <video
        ref={forwardRef}
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        style={{
          opacity: active === "forward" ? 1 : 0,
          pointerEvents: active === "forward" ? "auto" : "none",
        }}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        preload={active === "forward" ? "auto" : "metadata"}
        poster={HERO_POSTER}
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = 1;
        }}
      >
        <HeroResponsiveSources sm={HERO_VIDEO.sm} lg={HERO_VIDEO.lg} />
      </video>
      {useDual ? (
        <video
          ref={reverseRef}
          className={`absolute inset-0 h-full w-full ${coverClass}`}
          style={{
            opacity: active === "reverse" ? 1 : 0,
            pointerEvents: active === "reverse" ? "auto" : "none",
          }}
          muted
          playsInline
          disablePictureInPicture
          preload={active === "reverse" ? "auto" : "metadata"}
          poster={HERO_POSTER}
          onError={onReverseError}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 1;
          }}
        >
          <HeroResponsiveSources sm={HERO_REVERSE.sm} lg={HERO_REVERSE.lg} />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-black/5" aria-hidden />
    </div>
  );
}

function HeroVideoStaticPoster({
  objectPosition = "center",
}: {
  objectPosition?: "center" | "bottom" | "top" | "upper";
}) {
  const coverClass = objectCoverPositionClass(objectPosition);
  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-black [transform:translateZ(0)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static local poster; avoids next/image config for one asset */}
      <img
        src={HERO_POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        decoding="async"
        fetchPriority="high"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/5" aria-hidden />
    </div>
  );
}

export type HeroVideoVariant = "pingpong" | "carousel";

export type HeroVideoObjectPosition = "center" | "bottom" | "top" | "upper";

export default function HeroVideo({
  variant = "pingpong",
  /** Where `object-fit: cover` anchors when the band is shorter than the video (`upper` = show more of the top/middle). */
  objectPosition = "center",
}: {
  variant?: HeroVideoVariant;
  objectPosition?: HeroVideoObjectPosition;
}) {
  const reducedMotion = usePrefersReducedMotion();
  if (variant === "carousel") {
    const carouselPos =
      objectPosition === "upper" ? "top" : objectPosition;
    return (
      <HeroVideoCarousel
        objectPosition={carouselPos}
        preferLowBandwidth={reducedMotion}
      />
    );
  }
  if (reducedMotion) {
    return <HeroVideoStaticPoster objectPosition={objectPosition} />;
  }
  return <HeroVideoPingPong objectPosition={objectPosition} />;
}
