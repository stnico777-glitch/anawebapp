import Link from "next/link";
import {
  ABOUT_WAVE_BOTTOM_PATH_D,
  ABOUT_WAVE_SECTION_BG,
  ABOUT_WAVE_TOP_PATH_D,
  ABOUT_WAVE_VIEW_H,
  ABOUT_WAVE_VIEW_W,
} from "@/lib/aboutWaveGeometry";

const WAVE_SVG_TOP_CLASS = "block h-[clamp(88px,18vw,200px)] w-full";
/** Bottom wave: slightly shorter + gentler overlap on narrow viewports so the curve doesn’t look stretched or mis-seamed. */
const WAVE_SVG_BOTTOM_CLASS =
  "block h-[clamp(76px,min(15vw,12dvh),160px)] w-full md:h-[clamp(88px,18vw,200px)]";

/** Matches {@link HeroTitle} wordmark structure; theme sky-blue on pale wave band. */
const wordmarkBase =
  "text-sky-blue [font-family:var(--font-poppins),sans-serif] lowercase [font-synthesis:none]";

const wordmarkMainClass = `${wordmarkBase} font-normal`;

const wordmarkSubClass = `${wordmarkBase} font-medium`;

function AboutWaveBand({ variant }: { variant: "top" | "bottom" }) {
  const wrapperClass =
    variant === "top"
      ? "pointer-events-none relative z-0 w-full bg-transparent leading-[0] -mt-px"
      : "pointer-events-none relative z-0 -mt-14 mb-4 w-full bg-transparent leading-[0] md:-mt-28 md:mb-6";
  const pathD = variant === "top" ? ABOUT_WAVE_TOP_PATH_D : ABOUT_WAVE_BOTTOM_PATH_D;
  const svgClass = variant === "top" ? WAVE_SVG_TOP_CLASS : WAVE_SVG_BOTTOM_CLASS;

  return (
    <div className={wrapperClass}>
      <svg
        className={svgClass}
        viewBox={`0 0 ${ABOUT_WAVE_VIEW_W} ${ABOUT_WAVE_VIEW_H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path fill={ABOUT_WAVE_SECTION_BG} d={pathD} />
      </svg>
    </div>
  );
}

/**
 * Homepage about band — pale blue field + wave SVGs; centered wordmark (same lines as marketing hero).
 */
export default function AboutBrandSection() {
  return (
    <section
      id="about-brand"
      className="home-cv-about relative -mt-2 overflow-x-hidden md:-mt-3"
      aria-labelledby="about-brand-wordmark"
    >
      <AboutWaveBand variant="top" />

      <div
        className="relative z-[2] mb-0 -mt-8 flex min-h-[min(52dvh,420px)] items-center justify-center pb-10 md:-mb-8 md:-mt-10 md:min-h-[min(48dvh,460px)] md:pb-0"
        style={{ backgroundColor: ABOUT_WAVE_SECTION_BG }}
      >
        <div className="translate-y-2 md:translate-y-3 flex max-w-[min(100%,42rem)] flex-col items-center gap-6 px-4 md:gap-7">
          <h2
            id="about-brand-wordmark"
            className="flex w-full flex-col items-center gap-1 md:gap-1.5"
          >
            <span
              className={`${wordmarkMainClass} block text-center leading-none tracking-[0.14em] text-[clamp(1.55rem,min(10vw,6.5dvh),2.65rem)] md:text-[clamp(2.35rem,9.75dvh,5.85rem)] md:tracking-[0.24em]`}
            >
              awake+align
            </span>
            <span
              className={`${wordmarkSubClass} mt-0.5 block text-center leading-tight tracking-[0.32em] text-[clamp(0.48rem,min(2.7vw,1.55dvh),0.68rem)] md:text-[clamp(0.74rem,2.55dvh,1.45rem)] md:tracking-[0.42em]`}
            >
              power love sound mind
            </span>
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border-2 border-current bg-gradient-to-b from-white/35 to-sky-blue/[0.08] px-7 py-2.5 text-sm font-medium text-sky-blue shadow-none backdrop-blur-xl ring-1 ring-inset ring-white/25 transition duration-200 ease-out [font-family:var(--font-headline),sans-serif] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.03] hover:from-white/45 hover:to-sky-blue/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9EFF5] motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 md:px-8 md:py-3 md:text-base"
          >
            Find Your Rhythm
          </Link>
        </div>
      </div>

      {/* Mobile: single top wave + flat bottom so edges stay square with the band; desktop keeps paired waves */}
      <div className="hidden md:block">
        <AboutWaveBand variant="bottom" />
      </div>
    </section>
  );
}
