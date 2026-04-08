"use client";

import dynamic from "next/dynamic";
import ScheduleSection from "@/components/ScheduleSection";
import Footer from "@/components/Footer";
import DeferredMarketingBubbles from "@/components/DeferredMarketingBubbles";

const TrialBanner = dynamic(() => import("@/components/TrialBanner"), {
  loading: () => <div className="h-14 w-full max-w-4xl animate-pulse rounded-lg bg-sand/30" aria-hidden />,
});

const FeaturesSection = dynamic(() => import("@/components/FeaturesSection"), {
  loading: () => (
    <div className="min-h-[360px] w-full animate-pulse rounded-xl bg-sand/25" aria-hidden />
  ),
});

const AboutBrandSection = dynamic(() => import("@/components/AboutBrandSection"), {
  loading: () => (
    <div className="min-h-[280px] w-full animate-pulse rounded-xl bg-sand/20" aria-hidden />
  ),
});

const InstagramCarousel = dynamic(() => import("@/components/InstagramCarousel"), {
  ssr: false,
  loading: () => (
    <div className="mb-16 min-h-[min(520px,70vh)] w-full md:mb-20" aria-hidden />
  ),
});

export type HomeBelowFoldIslandProps = {
  schedule: { days: { id: string; dayIndex: number }[] } | null;
  showLockIcon: boolean;
  instagram: { embedRef: string | null; embedIframeUrl: string | null };
};

export default function HomeBelowFoldIsland({
  schedule,
  showLockIcon,
  instagram,
}: HomeBelowFoldIslandProps) {
  return (
    <div className="homepage-imessage-surface">
      <div className="relative z-[1]">
        <TrialBanner />
        <DeferredMarketingBubbles />
        <ScheduleSection schedule={schedule} showLockIcon={showLockIcon} />
        <FeaturesSection showLockIcon={showLockIcon} />
        <AboutBrandSection />
        <section className="mb-16 overflow-visible md:mb-20">
          <InstagramCarousel {...instagram} />
        </section>
        <Footer bleedBackground />
      </div>
    </div>
  );
}
