"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/** Hosted .lottie — Christian music spotlight divider (full-bleed under marquee). */
export const MUSIC_SPOTLIGHT_LOTTIE_SRC =
  "https://lottie.host/6c86419d-88c4-48bd-92c0-4c8fd3629d98/CfuVw7ru8R.lottie";

const RIBBON_RENDER_CONFIG = {
  autoResize: true,
  devicePixelRatio: 2.5,
  quality: 100,
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
  return (
    <div className="relative w-full min-w-full max-w-none shrink-0 bg-transparent leading-none">
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
          className="absolute inset-0 block h-full w-full max-w-none min-w-full"
          aria-hidden
        />
      </div>
    </div>
  );
}
