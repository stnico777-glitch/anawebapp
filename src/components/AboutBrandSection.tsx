import Link from "next/link";
import type { CSSProperties } from "react";
import AboutWaveFramedPhoto from "@/components/AboutWaveFramedPhoto";
import {
  ABOUT_WAVE_BOTTOM_PATH_D,
  ABOUT_WAVE_SECTION_ACCENT,
  ABOUT_WAVE_SECTION_BG,
  ABOUT_WAVE_TOP_PATH_D,
  ABOUT_WAVE_VIEW_H,
  ABOUT_WAVE_VIEW_W,
} from "@/lib/aboutWaveGeometry";

const WAVE_SVG_CLASS = "block h-[clamp(88px,18vw,200px)] w-full";

function AboutWaveBand({ variant }: { variant: "top" | "bottom" }) {
  const wrapperClass =
    variant === "top"
      ? "pointer-events-none relative z-0 w-full bg-transparent leading-[0] -mt-px"
      : "pointer-events-none relative z-0 -mt-20 mb-5 w-full bg-transparent leading-[0] md:-mt-28 md:mb-6";
  const pathD = variant === "top" ? ABOUT_WAVE_TOP_PATH_D : ABOUT_WAVE_BOTTOM_PATH_D;

  return (
    <div className={wrapperClass}>
      <svg
        className={WAVE_SVG_CLASS}
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
 * Homepage “about” band — pale blue (#E9EFF5) + sky-blue copy; wave SVG uses the same opaque fill as the body (no stacked alpha).
 */
export default function AboutBrandSection() {
  return (
    <section
      id="about-brand"
      className="home-cv-about relative -mt-2 overflow-x-hidden md:-mt-3"
      aria-labelledby="about-brand-heading"
    >
      <AboutWaveBand variant="top" />

      <div
        className="relative z-[2] -mb-6 -mt-8 md:-mb-8 md:-mt-10"
        style={{ color: ABOUT_WAVE_SECTION_ACCENT, backgroundColor: ABOUT_WAVE_SECTION_BG }}
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
                className="inline-flex items-center justify-center rounded-full border-2 px-8 py-3 text-sm font-medium text-inherit transition [font-family:var(--font-headline),sans-serif] hover:bg-[color-mix(in_srgb,var(--about-accent)_12%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--about-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--about-bg)]"
                style={
                  {
                    borderColor: ABOUT_WAVE_SECTION_ACCENT,
                    ["--about-accent" as string]: ABOUT_WAVE_SECTION_ACCENT,
                    ["--about-bg" as string]: ABOUT_WAVE_SECTION_BG,
                  } as CSSProperties
                }
              >
                Join the Movement
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AboutWaveBand variant="bottom" />
    </section>
  );
}
