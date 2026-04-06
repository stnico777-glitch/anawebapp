import Link from "next/link";
import AboutWaveFramedPhoto from "@/components/AboutWaveFramedPhoto";

/** Opaque pale blue — waves + body use the same fill so negative-margin overlap doesn’t double semi-transparent color. */
const ABOUT_BG = "#E9EFF5";
/** Headline, eyebrow, body, and CTA border — matches wave frame stroke. */
const ABOUT_COPY = "#6EADE4";

const WAVE_VIEW_W = 1440;
const WAVE_VIEW_H = 280;
/** 1.5 full sine cycles across the width (smooth undulation, not a single bump). */
const WAVE_CYCLES = 1.5;
const WAVE_STEPS = 80;
/** Vertical swing of the wave — lower = gentler curves. */
const WAVE_AMP = 34;

function waveTheta(x: number): number {
  return (WAVE_CYCLES * 2 * Math.PI * x) / WAVE_VIEW_W;
}

function waveYTop(x: number, mid: number, amp: number): number {
  return mid + amp * Math.sin(waveTheta(x));
}

/** Blue fills below this wavy top edge. */
function buildAboutWaveTopPath(): string {
  const mid = 140;
  const amp = WAVE_AMP;
  let d = "";
  for (let i = 0; i <= WAVE_STEPS; i++) {
    const x = (i / WAVE_STEPS) * WAVE_VIEW_W;
    const y = waveYTop(x, mid, amp);
    d += i === 0 ? `M ${x},${y.toFixed(2)}` : ` L ${x},${y.toFixed(2)}`;
  }
  d += ` L ${WAVE_VIEW_W},${WAVE_VIEW_H} L 0,${WAVE_VIEW_H} Z`;
  return d;
}

/**
 * Bottom edge uses the **same** sin(θ) phase as the top wave.
 * Top boundary T = mid + amp·sin(θ): “dip” = sin↑ (T high), “peak” = sin↓ (T low).
 * Bottom boundary: y = viewH − amp + amp·sin(θ) → dip of blue (y→viewH) lines up under top dip;
 * crest at top (sin min) → shallow bottom (“negative peak”). Vertically coherent column of blue.
 */
function buildAboutWaveBottomPath(): string {
  const amp = WAVE_AMP;
  const yBottom = (x: number) => {
    const sin = Math.sin(waveTheta(x));
    const y = WAVE_VIEW_H - amp + amp * sin;
    return Math.max(0, Math.min(WAVE_VIEW_H, y));
  };
  let d = `M 0,0 L ${WAVE_VIEW_W},0`;
  for (let i = WAVE_STEPS; i >= 0; i--) {
    const x = (i / WAVE_STEPS) * WAVE_VIEW_W;
    d += ` L ${x},${yBottom(x).toFixed(2)}`;
  }
  d += " Z";
  return d;
}

/** Tall curved band — solid pale blue; areas outside the fill are transparent (page surface shows through). */
function AboutWaveTop() {
  return (
    <div className="pointer-events-none relative z-0 w-full bg-transparent leading-[0] -mt-px">
      <svg
        className="block h-[clamp(88px,18vw,200px)] w-full"
        viewBox={`0 0 ${WAVE_VIEW_W} ${WAVE_VIEW_H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path fill={ABOUT_BG} d={buildAboutWaveTopPath()} />
      </svg>
    </div>
  );
}

function AboutWaveBottom() {
  return (
    <div className="pointer-events-none relative z-0 -mt-20 mb-5 w-full bg-transparent leading-[0] md:-mt-28 md:mb-6">
      <svg
        className="block h-[clamp(88px,18vw,200px)] w-full"
        viewBox={`0 0 ${WAVE_VIEW_W} ${WAVE_VIEW_H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path fill={ABOUT_BG} d={buildAboutWaveBottomPath()} />
      </svg>
    </div>
  );
}

/**
 * Homepage “about” band — pale blue (#E9EFF5) + sky-blue copy; wave SVG uses the same opaque fill as the body (no stacked alpha).
 */
export default function AboutBrandSection() {
  return (
    <section id="about-brand" className="relative -mt-2 overflow-x-hidden md:-mt-3" aria-labelledby="about-brand-heading">
      <AboutWaveTop />

      <div
        className="relative z-[2] -mb-6 -mt-8 bg-[#E9EFF5] md:-mb-8 md:-mt-10"
        style={{ color: ABOUT_COPY }}
      >
        <div className="mx-auto grid max-w-[1800px] md:grid-cols-2 md:items-start md:gap-2 lg:gap-4">
        <div className="flex justify-center px-4 pb-0 pt-0 md:px-6 md:pb-0 md:pt-0 lg:px-8">
          <AboutWaveFramedPhoto />
        </div>

        <div className="flex flex-col items-center justify-center px-5 pb-0 pt-4 text-center md:px-8 md:pb-0 md:pt-12 lg:px-10 lg:pb-0 lg:pt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] [font-family:var(--font-headline),sans-serif] md:text-xs">
            About awake + align
          </p>
          <h2
            id="about-brand-heading"
            className="mt-1 max-w-xl text-3xl font-normal capitalize leading-[1.35] tracking-[0.135em] [font-synthesis:none] md:mt-1.5 md:text-4xl [font-family:var(--font-headline),sans-serif]"
          >
            A movement for faith, fitness, and community
          </h2>
          <p className="mt-2 max-w-md text-[15px] leading-snug [font-family:var(--font-body),sans-serif] md:mt-3 md:text-base md:leading-[1.55]">
            Faith, movement, and community in one rhythm—so you’re never building the habit alone.
            Schedule, library, prayer, and people who care, together.
          </p>
          <div className="mt-10 flex w-full justify-center md:mt-12">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-2 px-8 py-3 text-sm font-medium text-inherit transition hover:bg-[#6EADE4]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6EADE4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9EFF5] [font-family:var(--font-headline),sans-serif]"
              style={{ borderColor: ABOUT_COPY }}
            >
              Join the Movement
            </Link>
          </div>
        </div>
        </div>
      </div>

      <AboutWaveBottom />
    </section>
  );
}
