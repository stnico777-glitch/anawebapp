"use client";

import { useEffect, useRef } from "react";
import type { DotLottie } from "@lottiefiles/dotlottie-web";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/** Hosted .lottie — Christian music spotlight divider (full-bleed under marquee). */
export const MUSIC_SPOTLIGHT_LOTTIE_SRC =
  "https://lottie.host/6c86419d-88c4-48bd-92c0-4c8fd3629d98/CfuVw7ru8R.lottie";

/** Cap DPR to reduce GPU fill rate (ribbon is decorative). */
const RIBBON_RENDER_CONFIG = {
  autoResize: true,
  devicePixelRatio: 1.5,
  quality: 80,
} as const;

/** 0–1: vertical squeeze only (full width unchanged). 1 = native 2880×1000 proportions. */
const RIBBON_VERTICAL_SQUEEZE = 0.3;

/** Playback speed (1 = default; lower = slower). */
const RIBBON_PLAYBACK_SPEED = 0.45;

/**
 * Frame uses the real comp width (2880) but a shorter height than 1000 — `fit: fill` scales the
 * animation to the frame without cropping (non-uniform scale = “squeeze”), so the ribbon stays
 * edge-to-edge and fully visible, just thinner.
 */
export default function MusicSpotlightLottie() {
  const frameH = 1000 * RIBBON_VERTICAL_SQUEEZE;
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<DotLottie | null>(null);
  /** In viewport — pause when off-screen to avoid idle GPU work. */
  const inViewRef = useRef(false);

  const syncPlayback = () => {
    const inst = lottieRef.current;
    if (!inst) return;
    const docVisible = typeof document !== "undefined" && document.visibilityState === "visible";
    if (inViewRef.current && docVisible) inst.play();
    else inst.pause();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: "48px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => syncPlayback();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-w-full max-w-none shrink-0 bg-transparent leading-none"
    >
      <div
        className="relative w-full min-w-full max-w-none shrink-0"
        style={{ aspectRatio: `2880 / ${frameH}` }}
        aria-hidden
      >
        <DotLottieReact
          src={MUSIC_SPOTLIGHT_LOTTIE_SRC}
          loop
          autoplay
          speed={RIBBON_PLAYBACK_SPEED}
          layout={{ fit: "fill", align: [0.5, 0.5] }}
          renderConfig={RIBBON_RENDER_CONFIG}
          dotLottieRefCallback={(inst) => {
            lottieRef.current = inst;
            syncPlayback();
          }}
          className="absolute inset-0 block h-full w-full max-w-none min-w-full"
          aria-hidden
        />
      </div>
    </div>
  );
}
