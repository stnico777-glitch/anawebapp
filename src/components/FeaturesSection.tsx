"use client";

import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import LockIcon from "@/components/LockIcon";
import { MARKETING_SECTION_HEADER_REVEAL } from "@/constants/marketingScrollReveal";

const FEATURES_CARD_REVEAL = {
  threshold: 0.1,
  rootMargin: "0px 0px -10% 0px" as const,
  hiddenSlideY: "min(5vh, 1.5rem)",
  motionDurationMs: 900,
  motionEase: "cubic-bezier(0.25, 1, 0.35, 1)",
};
/** Program tiles (~10:9) — editorial overlays, thin gutters (see grid wrapper). */
const FEATURE_CARD_SHELL =
  "group relative z-0 overflow-hidden rounded-none bg-sand shadow-[0_1px_0_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] transition-transform duration-300 ease-out hover:z-[2] hover:shadow-md motion-reduce:transition-none";

const FEATURE_IMAGE_HOVER =
  "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

const FEATURE_TOP_KICKER =
  "text-[10px] font-medium uppercase tracking-[0.18em] text-white/95 [font-family:var(--font-headline),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]";
const FEATURE_TOP_TITLE =
  "mt-1.5 text-[1.35rem] font-semibold leading-snug tracking-tight text-white sm:text-[1.5rem] md:text-[1.65rem] [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]";
const FEATURE_BOTTOM_LINE =
  "text-[9px] font-normal lowercase leading-snug tracking-[0.12em] text-white/95 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] sm:text-[10px]";

type FeaturesSectionProps = {
  /** When true, show a small white lock on feature cards for signed-out / non-subscriber visitors. */
  showLockIcon?: boolean;
};

export default function FeaturesSection({ showLockIcon = false }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="home-cv-features bg-transparent px-2 -mt-2 pt-2 pb-8 md:px-4 md:-mt-3 md:pt-3 md:pb-12"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-[1500px]">
        <ScrollReveal
          className="w-full"
          delayMs={0}
          {...MARKETING_SECTION_HEADER_REVEAL}
          runwayPaddingBottom={{
            hidden: "min(6vh, 2rem)",
            visible: "0px",
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className="aspect-[4/3.92] w-[min(120px,40vw)] sm:w-[min(140px,36vw)]"
              aria-hidden
              style={{
                backgroundColor: "var(--gray)",
                maskImage: "url('/sabbath-birds.png')",
                WebkitMaskImage: "url('/sabbath-birds.png')",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskType: "alpha",
              }}
            />
          </div>
        </ScrollReveal>
        <ScrollReveal className="w-full" delayMs={90} {...MARKETING_SECTION_HEADER_REVEAL}>
          <div
            className="mx-auto mt-0.5 h-px w-40 rounded-full md:w-44"
            style={{ backgroundColor: "var(--gray)" }}
            aria-hidden
          />
        </ScrollReveal>
        <ScrollReveal className="w-full" delayMs={180} {...MARKETING_SECTION_HEADER_REVEAL}>
          <h2
            id="features-heading"
            className="mt-1.5 text-center text-3xl font-normal capitalize leading-[1.4] tracking-[0.135em] text-gray [font-synthesis:none] md:mt-2 md:text-4xl [font-family:var(--font-headline),sans-serif]"
          >
            Everything you need
          </h2>
        </ScrollReveal>
        <ScrollReveal className="w-full" delayMs={270} {...MARKETING_SECTION_HEADER_REVEAL}>
          <p className="mt-1 text-center text-sm lowercase tracking-[0.12em] text-gray [font-family:var(--font-body),sans-serif] md:mt-1.5 md:text-base">
            Faith + fitness, all in one place
          </p>
        </ScrollReveal>

        <div className="mt-5 grid transform-gpu grid-cols-1 gap-2 sm:grid-cols-2 md:mt-6 lg:grid-cols-4 lg:gap-3">
          <ScrollReveal className="min-w-0" delayMs={0} {...FEATURES_CARD_REVEAL}>
            <article className={FEATURE_CARD_SHELL}>
              <div className="relative aspect-[10/9] w-full min-h-0 overflow-hidden">
                <Link href="/#schedule" className="absolute inset-0 z-10">
                  <span className="sr-only">Weekly schedule — curated prayer, movement and affirmations Mon–Sat</span>
                </Link>
                {showLockIcon && (
                  <span className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                    <LockIcon size="sm" className="text-white" />
                  </span>
                )}
                <Image
                  src="/weekly-schedule-feature.png"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={FEATURE_IMAGE_HOVER}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/22 via-black/[0.04] to-black/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] px-3 pt-5 text-center sm:px-4 sm:pt-6">
                  <p className={FEATURE_TOP_KICKER}>The</p>
                  <p className={FEATURE_TOP_TITLE}>Weekly Schedule</p>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] px-3 pb-4 text-center sm:px-4 sm:pb-5">
                  <p className={FEATURE_BOTTOM_LINE}>Workouts &amp; meditations · Mon–Sat</p>
                </div>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal className="min-w-0" delayMs={100} {...FEATURES_CARD_REVEAL}>
            <article className={FEATURE_CARD_SHELL}>
              <div className="relative aspect-[10/9] w-full min-h-0 overflow-hidden">
                <Link href="/movement" className="absolute inset-0 z-10">
                  <span className="sr-only">Movement — Pilates, yoga, and strength on demand</span>
                </Link>
                {showLockIcon && (
                  <span className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                    <LockIcon size="sm" className="text-white" />
                  </span>
                )}
                <Image
                  src="/movement-feature.png"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={FEATURE_IMAGE_HOVER}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/22 via-black/[0.04] to-black/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] px-3 pt-5 text-center sm:px-4 sm:pt-6">
                  <p className={FEATURE_TOP_KICKER}>On-demand</p>
                  <p className={FEATURE_TOP_TITLE}>Movement</p>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] px-3 pb-4 text-center sm:px-4 sm:pb-5">
                  <p className={FEATURE_BOTTOM_LINE}>Pilates &amp; strength · meet you where you are</p>
                </div>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal className="min-w-0" delayMs={200} {...FEATURES_CARD_REVEAL}>
            <article className={FEATURE_CARD_SHELL}>
              <div className="relative aspect-[10/9] w-full min-h-0 overflow-hidden">
                <Link href="/prayer" className="absolute inset-0 z-10">
                  <span className="sr-only">Prayer and audio — scripture-led sessions</span>
                </Link>
                {showLockIcon && (
                  <span className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                    <LockIcon size="sm" className="text-white" />
                  </span>
                )}
                <Image
                  src="/audio-feature.png"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={`${FEATURE_IMAGE_HOVER} object-[center_35%]`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/22 via-black/[0.04] to-black/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] px-3 pt-5 text-center sm:px-4 sm:pt-6">
                  <p className={FEATURE_TOP_KICKER}>Scripture-led</p>
                  <p className={FEATURE_TOP_TITLE}>Prayer &amp; Audio</p>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] px-3 pb-4 text-center sm:px-4 sm:pb-5">
                  <p className={FEATURE_BOTTOM_LINE}>Guided prayer &amp; devotionals</p>
                </div>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal className="min-w-0" delayMs={300} {...FEATURES_CARD_REVEAL}>
            <article className={FEATURE_CARD_SHELL}>
              <div className="relative aspect-[10/9] w-full min-h-0 overflow-hidden">
                <Link href="/community" prefetch={false} className="absolute inset-0 z-10">
                  <span className="sr-only">Community — Bloom Scroll and praise wall</span>
                </Link>
                {showLockIcon && (
                  <span className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                    <LockIcon size="sm" className="text-white" />
                  </span>
                )}
                <Image
                  src="/community-feature.png"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={FEATURE_IMAGE_HOVER}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/22 via-black/[0.04] to-black/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] px-3 pt-5 text-center sm:px-4 sm:pt-6">
                  <p className={FEATURE_TOP_KICKER}>Together</p>
                  <p className={FEATURE_TOP_TITLE}>Community</p>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] px-3 pb-4 text-center sm:px-4 sm:pb-5">
                  <p className={FEATURE_BOTTOM_LINE}>Bloom scroll · prayer &amp; praise wall</p>
                </div>
              </div>
            </article>
          </ScrollReveal>
        </div>

        <ScrollReveal
          className="mt-8 flex justify-center md:mt-10 mb-2 md:mb-3"
          delayMs={120}
          threshold={0.08}
          rootMargin="0px 0px -8% 0px"
          hiddenSlideY="min(14vh, 4rem)"
          motionDurationMs={960}
          motionEase="cubic-bezier(0.25, 1, 0.35, 1)"
          runwayPaddingBottom={{
            hidden: "min(14vh, 4rem)",
            visible: "0px",
          }}
        >
          <Link
            href="/more"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#788287] px-8 py-3 text-sm font-medium text-[#788287] [font-family:var(--font-headline),sans-serif] transition hover:bg-[#788287]/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#788287] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Learn more
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
