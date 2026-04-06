"use client";

import Image from "next/image";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";

const ABOUT_PHOTO_SRC = "/Firefly%20(5).png";

const WAVE_VIEW_W = 1440;
const WAVE_VIEW_H = 280;
const WAVE_CYCLES = 1.5;
const WAVE_AMP = 34;

/** Softer than {@link WAVE_AMP} so the card edge matches the section wave visually (narrow slice reads more curved at same amp). */
const FRAME_AMP_SCALE = 0.4;

/**
 * Moves the wave clip + stroke up within the frame (fraction of frame height). The image layer is
 * shifted down by the same amount so the picture stays visually in place.
 */
const WAVE_FRAME_OFFSET_Y = 0.1;

function waveTheta(x: number): number {
  return (WAVE_CYCLES * 2 * Math.PI * x) / WAVE_VIEW_W;
}

function waveYTop(x: number, mid: number, amp: number): number {
  return mid + amp * Math.sin(waveTheta(x));
}

function yBottomWave(x: number, amp: number): number {
  const sin = Math.sin(waveTheta(x));
  return Math.max(0, Math.min(WAVE_VIEW_H, WAVE_VIEW_H - amp + amp * sin));
}

type WaveSeg = { startX: number; endX: number };

function buildWaveFramePathBBox(seg: WaveSeg, amp: number, offsetY: number): string {
  const mid = 140;
  const steps = 80;
  const span = Math.max(1e-6, seg.endX - seg.startX);
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xWave = seg.startX + t * span;
    const x = t;
    const y = Math.max(0, Math.min(1, waveYTop(xWave, mid, amp) / WAVE_VIEW_H - offsetY));
    d += i === 0 ? `M ${x.toFixed(4)},${y.toFixed(4)}` : ` L ${x.toFixed(4)},${y.toFixed(4)}`;
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const xWave = seg.startX + t * span;
    const x = t;
    const y = Math.max(0, Math.min(1, yBottomWave(xWave, amp) / WAVE_VIEW_H - offsetY));
    d += ` L ${x.toFixed(4)},${y.toFixed(4)}`;
  }
  d += " Z";
  return d;
}

function buildWaveFramePathPixel(
  frameW: number,
  frameH: number,
  seg: WaveSeg,
  amp: number,
  offsetY: number,
): string {
  const mid = 140;
  const steps = 80;
  const span = Math.max(1e-6, seg.endX - seg.startX);
  const yPix = (waveY: number) =>
    Math.max(0, Math.min(frameH, (waveY / WAVE_VIEW_H - offsetY) * frameH));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * frameW;
    const t = i / steps;
    const xWave = seg.startX + t * span;
    const y = yPix(waveYTop(xWave, mid, amp));
    d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)}` : ` L ${x.toFixed(2)},${y.toFixed(2)}`;
  }
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * frameW;
    const t = i / steps;
    const xWave = seg.startX + t * span;
    const y = yPix(yBottomWave(xWave, amp));
    d += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
  }
  d += " Z";
  return d;
}

const FRAME_W = 400;
/** Must match Tailwind aspect ratio (e.g. aspect-[400/400]); taller = more photo visible inside the wave. */
const FRAME_H = 400;

/** Main path stroke; vertical sides get a touch more width so they match the wavy edges visually. */
const FRAME_STROKE_W = 3;
const FRAME_SIDE_STROKE_W = 4.25;

function verticalEdgeLineYs(
  frameH: number,
  seg: WaveSeg,
  amp: number,
  offsetY: number,
  xWave: number,
): { y1: number; y2: number } {
  const mid = 140;
  const yPix = (waveY: number) =>
    Math.max(0, Math.min(frameH, (waveY / WAVE_VIEW_H - offsetY) * frameH));
  const yTop = yPix(waveYTop(xWave, mid, amp));
  const yBottom = yPix(yBottomWave(xWave, amp));
  return { y1: Math.min(yTop, yBottom), y2: Math.max(yTop, yBottom) };
}

/** Left ~⅕ of the hero wave until layout is measured (avoids full 1.5 cycles on a narrow card). */
const DEFAULT_SEG: WaveSeg = {
  startX: 0,
  endX: WAVE_VIEW_W * 0.22,
};

/**
 * Photo clipped + stroked with the same sine phase as the About wave SVGs, sampled only over the
 * viewport slice this card occupies (so peaks line up with the big wave). Softer amplitude on the frame.
 */
export default function AboutWaveFramedPhoto() {
  const rawId = useId();
  const clipId = `about-wave-photo-${rawId.replace(/:/g, "")}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [seg, setSeg] = useState<WaveSeg>(DEFAULT_SEG);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const vw = window.innerWidth;
      if (vw <= 0) return;
      const r = el.getBoundingClientRect();
      let startX = (r.left / vw) * WAVE_VIEW_W;
      let endX = (r.right / vw) * WAVE_VIEW_W;
      startX = Math.max(0, Math.min(WAVE_VIEW_W, startX));
      endX = Math.max(0, Math.min(WAVE_VIEW_W, endX));
      if (endX <= startX) {
        endX = startX + 1;
      }
      setSeg({ startX, endX });
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const ampFrame = WAVE_AMP * FRAME_AMP_SCALE;

  const pathBBox = useMemo(
    () => buildWaveFramePathBBox(seg, ampFrame, WAVE_FRAME_OFFSET_Y),
    [seg, ampFrame],
  );
  const pathPixel = useMemo(
    () => buildWaveFramePathPixel(FRAME_W, FRAME_H, seg, ampFrame, WAVE_FRAME_OFFSET_Y),
    [seg, ampFrame],
  );

  const sideLines = useMemo(() => {
    const off = WAVE_FRAME_OFFSET_Y;
    const left = verticalEdgeLineYs(FRAME_H, seg, ampFrame, off, seg.startX);
    const right = verticalEdgeLineYs(FRAME_H, seg, ampFrame, off, seg.endX);
    return { left, right };
  }, [seg, ampFrame]);

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
        className="relative aspect-[400/400] w-full overflow-hidden bg-[#E9EFF5]"
        style={{ clipPath: `url(#${clipId})` }}
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
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <path
          d={pathPixel}
          fill="none"
          stroke="#6EADE4"
          strokeWidth={FRAME_STROKE_W}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Extra weight on verticals — straight segments often read thinner than the wavy top/bottom */}
        <line
          x1={0}
          x2={0}
          y1={sideLines.left.y1}
          y2={sideLines.left.y2}
          stroke="#6EADE4"
          strokeWidth={FRAME_SIDE_STROKE_W}
          strokeLinecap="round"
        />
        <line
          x1={FRAME_W}
          x2={FRAME_W}
          y1={sideLines.right.y1}
          y2={sideLines.right.y2}
          stroke="#6EADE4"
          strokeWidth={FRAME_SIDE_STROKE_W}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
