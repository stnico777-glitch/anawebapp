"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const HERO_FORWARD = "/hero-video.mp4#t=0.001";
/** Time-reversed encode of the same clip — plays forward for smooth “backward” motion (see `npm run hero:reverse`). */
const HERO_REVERSE = "/hero-video-reverse.mp4#t=0.001";

/** Opening clip, then Awake + Align hero (see `public/hero-carousel-awake-align.mp4`). */
const HERO_CAROUSEL = [
  "/hero-video.mp4#t=0.001",
  "/hero-carousel-awake-align.mp4#t=0.001",
] as const;

/** First carousel clip only — longer on-screen (timeline still runs to `ended`). */
const FIRST_HERO_CLIP_PLAYBACK_RATE = 0.75;

function playbackRateForHeroCarouselSrc(src: string): number {
  return src.startsWith("/hero-video.mp4") ? FIRST_HERO_CLIP_PLAYBACK_RATE : 1;
}

function playWhenReady(
  el: HTMLVideoElement,
  onStarted: () => void,
): void {
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

function scheduleSwapOnFirstFrame(
  video: HTMLVideoElement,
  onSwap: () => void,
) {
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
}: {
  objectPosition?: "center" | "bottom" | "top";
}) {
  const coverClass = objectCoverPositionClass(objectPosition);
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const visibleSlotRef = useRef(0);
  const currentIndexRef = useRef(0);
  /** Avoid treating a bogus `ended` at load as real (WebKit); some UIs reset `currentTime` to 0 on real `ended`. */
  const playedPastStartRef = useRef<[boolean, boolean]>([false, false]);
  const [visibleSlot, setVisibleSlot] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const src0 =
    visibleSlot === 0
      ? HERO_CAROUSEL[currentIndex]
      : HERO_CAROUSEL[(currentIndex + 1) % HERO_CAROUSEL.length];
  const src1 =
    visibleSlot === 1
      ? HERO_CAROUSEL[currentIndex]
      : HERO_CAROUSEL[(currentIndex + 1) % HERO_CAROUSEL.length];

  useEffect(() => {
    visibleSlotRef.current = visibleSlot;
  }, [visibleSlot]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const el0 = ref0.current;
    const el1 = ref1.current;
    if (el0) el0.playbackRate = playbackRateForHeroCarouselSrc(src0);
    if (el1) el1.playbackRate = playbackRateForHeroCarouselSrc(src1);
  }, [src0, src1]);

  const onSlotEnded = useCallback((slot: 0 | 1) => {
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

    const nextIdx =
      (currentIndexRef.current + 1) % HERO_CAROUSEL.length;
    hiddenEl.playbackRate = playbackRateForHeroCarouselSrc(
      HERO_CAROUSEL[nextIdx],
    );
    hiddenEl.currentTime = 0;
    let swapped = false;
    const doSwap = () => {
      if (swapped) return;
      swapped = true;
      visibleEl.pause();
      // Keep in sync immediately so a spurious `ended` from the hidden slot
      // reloading its `src` cannot fire before useEffect runs (see black-flash report).
      visibleSlotRef.current = h;
      setVisibleSlot(h);
      setCurrentIndex((i) => {
        playedPastStartRef.current[0] = false;
        playedPastStartRef.current[1] = false;
        return (i + 1) % HERO_CAROUSEL.length;
      });
    };

    playWhenReady(hiddenEl, () => {
      scheduleSwapOnFirstFrame(hiddenEl, doSwap);
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/*
        Stack both clips at full opacity (z-index only). Opacity:0 on the “hidden”
        slot prevents reliable decode/play on some browsers (esp. WebKit), so the
        second carousel file never appeared after the first clip ended.
      */}
      <video
        ref={ref0}
        src={src0}
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        style={{
          zIndex: visibleSlot === 0 ? 2 : 1,
          pointerEvents: visibleSlot === 0 ? "auto" : "none",
        }}
        autoPlay={visibleSlot === 0 && currentIndex === 0}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = playbackRateForHeroCarouselSrc(src0);
        }}
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > 0.12) playedPastStartRef.current[0] = true;
        }}
        onEnded={() => onSlotEnded(0)}
      />
      <video
        ref={ref1}
        src={src1}
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        style={{
          zIndex: visibleSlot === 1 ? 2 : 1,
          pointerEvents: visibleSlot === 1 ? "auto" : "none",
        }}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = playbackRateForHeroCarouselSrc(src1);
        }}
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > 0.12) playedPastStartRef.current[1] = true;
        }}
        onEnded={() => onSlotEnded(1)}
      />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-black/10" aria-hidden />
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

  const stepRafReverse = useCallback(
    (now: number) => {
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
    },
    [cancelRaf],
  );

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
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={forwardRef}
        src={HERO_FORWARD}
        className={`absolute inset-0 h-full w-full ${coverClass}`}
        style={{
          opacity: active === "forward" ? 1 : 0,
          pointerEvents: active === "forward" ? "auto" : "none",
        }}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = 1;
        }}
      />
      {useDual ? (
        <video
          ref={reverseRef}
          src={HERO_REVERSE}
          className={`absolute inset-0 h-full w-full ${coverClass}`}
          style={{
            opacity: active === "reverse" ? 1 : 0,
            pointerEvents: active === "reverse" ? "auto" : "none",
          }}
          muted
          playsInline
          preload="auto"
          onError={onReverseError}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 1;
          }}
        />
      ) : null}
      <div className="absolute inset-0 bg-black/10" aria-hidden />
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
  if (variant === "carousel") {
    const carouselPos =
      objectPosition === "upper" ? "top" : objectPosition;
    return <HeroVideoCarousel objectPosition={carouselPos} />;
  }
  return <HeroVideoPingPong objectPosition={objectPosition} />;
}
