"use client";

import Image from "next/image";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ABOUT_WAVE_AMP,
  ABOUT_WAVE_SECTION_BG,
  ABOUT_WAVE_VIEW_W,
  type AboutWaveSeg,
  buildWaveFramePathBBox,
} from "@/lib/aboutWaveGeometry";

const ABOUT_PHOTO_SRC = "/Firefly%20(5).png";

/** Ignore sub-pixel jitter from ResizeObserver / resize so we do not re-render when the segment is unchanged. */
const SEG_EPS = 1e-3;

/** Softer than {@link ABOUT_WAVE_AMP} so the card edge matches the section wave visually (narrow slice reads more curved at same amp). */
const FRAME_WAVE_AMP = ABOUT_WAVE_AMP * 0.4;

/**
 * Moves the wave clip up within the frame (fraction of frame height). The image layer is shifted
 * down by the same amount so the picture stays visually in place.
 */
const WAVE_FRAME_OFFSET_Y = 0.1;

/** Left ~⅕ of the hero wave until layout is measured (avoids full 1.5 cycles on a narrow card). */
const DEFAULT_SEG: AboutWaveSeg = {
  startX: 0,
  endX: ABOUT_WAVE_VIEW_W * 0.22,
};

/**
 * Photo clipped to the same sine phase as the About wave SVGs (no stroke), sampled only over the
 * viewport slice this card occupies (so peaks line up with the big wave). Softer amplitude on the frame.
 */
export default function AboutWaveFramedPhoto() {
  const rawId = useId();
  const clipId = `about-wave-photo-${rawId.replace(/:/g, "")}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [seg, setSeg] = useState<AboutWaveSeg>(DEFAULT_SEG);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const vw = window.innerWidth;
      if (vw <= 0) return;
      const r = el.getBoundingClientRect();
      let startX = (r.left / vw) * ABOUT_WAVE_VIEW_W;
      let endX = (r.right / vw) * ABOUT_WAVE_VIEW_W;
      startX = Math.max(0, Math.min(ABOUT_WAVE_VIEW_W, startX));
      endX = Math.max(0, Math.min(ABOUT_WAVE_VIEW_W, endX));
      if (endX <= startX) {
        endX = startX + 1;
      }
      setSeg((prev) => {
        if (
          Math.abs(prev.startX - startX) < SEG_EPS &&
          Math.abs(prev.endX - endX) < SEG_EPS
        ) {
          return prev;
        }
        return { startX, endX };
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const pathBBox = useMemo(
    () => buildWaveFramePathBBox(seg, FRAME_WAVE_AMP, WAVE_FRAME_OFFSET_Y),
    [seg],
  );

  const imageCompensateY = `${WAVE_FRAME_OFFSET_Y * 100}%`;

  return (
    <div
      ref={wrapRef}
      className="relative -mt-[5.5rem] w-full max-w-[360px] sm:-mt-24 sm:max-w-[420px] md:-mt-36 md:max-w-[480px] lg:max-w-[560px]"
    >
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={pathBBox} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: ABOUT_WAVE_SECTION_BG, clipPath: `url(#${clipId})` }}
      >
        {/* Same % down as wave moved up so the photo subject stays put */}
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${imageCompensateY})` }}
        >
          <Image
            src={ABOUT_PHOTO_SRC}
            alt="Community members in matching outfits holding Awake &amp; Align books"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-center scale-x-[-1]"
            fill
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
