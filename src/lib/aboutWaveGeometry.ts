/** Shared viewBox width for About section wave SVGs and framed-photo alignment. */
export const ABOUT_WAVE_VIEW_W = 1440;
/** Shared viewBox height for About section wave SVGs. */
export const ABOUT_WAVE_VIEW_H = 280;
/** 1.5 full sine cycles across the width (smooth undulation, not a single bump). */
export const ABOUT_WAVE_CYCLES = 1.5;
/** Samples along each wave edge (top path, bottom path, frame clip). */
export const ABOUT_WAVE_STEPS = 80;
/** Vertical swing of the wave — lower = gentler curves. */
export const ABOUT_WAVE_AMP = 34;

/** Horizontal midline of the wave view (same as `ABOUT_WAVE_VIEW_H / 2`). */
export const ABOUT_WAVE_MID = ABOUT_WAVE_VIEW_H / 2;

/** Opaque pale blue — waves, body, and frame background (no stacked semi-transparent overlap). */
export const ABOUT_WAVE_SECTION_BG = "#E9EFF5";
/** Headline, eyebrow, body, CTA border, and frame stroke — sky-blue (#6EADE4). */
export const ABOUT_WAVE_SECTION_ACCENT = "#6EADE4";

export function waveTheta(x: number): number {
  return (ABOUT_WAVE_CYCLES * 2 * Math.PI * x) / ABOUT_WAVE_VIEW_W;
}

export function waveYTop(x: number, mid: number, amp: number): number {
  return mid + amp * Math.sin(waveTheta(x));
}

/**
 * Bottom edge uses the **same** sin(θ) phase as the top wave.
 * y = viewH − amp + amp·sin(θ), clamped to the view height.
 */
export function waveYBottom(x: number, amp: number): number {
  const sin = Math.sin(waveTheta(x));
  const y = ABOUT_WAVE_VIEW_H - amp + amp * sin;
  return Math.max(0, Math.min(ABOUT_WAVE_VIEW_H, y));
}

function computeAboutWaveTopPath(): string {
  const amp = ABOUT_WAVE_AMP;
  let d = "";
  for (let i = 0; i <= ABOUT_WAVE_STEPS; i++) {
    const x = (i / ABOUT_WAVE_STEPS) * ABOUT_WAVE_VIEW_W;
    const y = waveYTop(x, ABOUT_WAVE_MID, amp);
    d += i === 0 ? `M ${x},${y.toFixed(2)}` : ` L ${x},${y.toFixed(2)}`;
  }
  d += ` L ${ABOUT_WAVE_VIEW_W},${ABOUT_WAVE_VIEW_H} L 0,${ABOUT_WAVE_VIEW_H} Z`;
  return d;
}

function computeAboutWaveBottomPath(): string {
  const amp = ABOUT_WAVE_AMP;
  let d = `M 0,0 L ${ABOUT_WAVE_VIEW_W},0`;
  for (let i = ABOUT_WAVE_STEPS; i >= 0; i--) {
    const x = (i / ABOUT_WAVE_STEPS) * ABOUT_WAVE_VIEW_W;
    d += ` L ${x},${waveYBottom(x, amp).toFixed(2)}`;
  }
  return `${d} Z`;
}

/** Cached `d` for the full-width top wave (computed once at module load). */
export const ABOUT_WAVE_TOP_PATH_D = computeAboutWaveTopPath();
/** Cached `d` for the full-width bottom wave. */
export const ABOUT_WAVE_BOTTOM_PATH_D = computeAboutWaveBottomPath();

/** Full-width hero wave: blue fill below the wavy top edge. */
export function buildAboutWaveTopPath(): string {
  return ABOUT_WAVE_TOP_PATH_D;
}

/**
 * Full-width bottom wave: same phase as the top; vertically coherent column of blue.
 */
export function buildAboutWaveBottomPath(): string {
  return ABOUT_WAVE_BOTTOM_PATH_D;
}

/** Viewport slice of the hero wave in viewBox X coordinates (for framed photo alignment). */
export type AboutWaveSeg = { startX: number; endX: number };

type ToXY = (t: number, waveY: number) => { x: number; y: number };

function buildClosedWaveFramePath(
  seg: AboutWaveSeg,
  amp: number,
  steps: number,
  toXY: ToXY,
  decimals: number,
): string {
  const mid = ABOUT_WAVE_MID;
  const span = Math.max(1e-6, seg.endX - seg.startX);
  const fmt = (n: number) => n.toFixed(decimals);
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const xWave = seg.startX + t * span;
    const p = toXY(t, waveYTop(xWave, mid, amp));
    parts.push(i === 0 ? `M ${fmt(p.x)},${fmt(p.y)}` : ` L ${fmt(p.x)},${fmt(p.y)}`);
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const xWave = seg.startX + t * span;
    const p = toXY(t, waveYBottom(xWave, amp));
    parts.push(` L ${fmt(p.x)},${fmt(p.y)}`);
  }
  parts.push(" Z");
  return parts.join("");
}

export function makeWaveYPixelMapper(frameH: number, offsetY: number) {
  return (waveY: number) =>
    Math.max(0, Math.min(frameH, (waveY / ABOUT_WAVE_VIEW_H - offsetY) * frameH));
}

/** Normalized 0–1 bbox path for `clipPathUnits="objectBoundingBox"`. */
export function buildWaveFramePathBBox(
  seg: AboutWaveSeg,
  amp: number,
  offsetY: number,
): string {
  return buildClosedWaveFramePath(
    seg,
    amp,
    ABOUT_WAVE_STEPS,
    (t, waveY) => {
      const y = Math.max(0, Math.min(1, waveY / ABOUT_WAVE_VIEW_H - offsetY));
      return { x: t, y };
    },
    4,
  );
}

/** Pixel-space path for the visible stroke overlay (`viewBox` matches frame size). */
export function buildWaveFramePathPixel(
  frameW: number,
  frameH: number,
  seg: AboutWaveSeg,
  amp: number,
  offsetY: number,
): string {
  const yPix = makeWaveYPixelMapper(frameH, offsetY);
  return buildClosedWaveFramePath(
    seg,
    amp,
    ABOUT_WAVE_STEPS,
    (t, waveY) => ({ x: t * frameW, y: yPix(waveY) }),
    2,
  );
}

export function verticalEdgeLineYs(
  yPix: (waveY: number) => number,
  xWave: number,
  amp: number,
): { y1: number; y2: number } {
  const yTop = yPix(waveYTop(xWave, ABOUT_WAVE_MID, amp));
  const yBottom = yPix(waveYBottom(xWave, amp));
  return { y1: Math.min(yTop, yBottom), y2: Math.max(yTop, yBottom) };
}
