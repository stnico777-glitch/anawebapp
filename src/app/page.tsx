import { Suspense } from "react";
import { auth } from "@/auth";
import { getCurrentWeekSchedule } from "@/lib/schedule";
import { getDemoWeekSchedule } from "@/lib/demo-preview-data";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import TrialBanner from "@/components/TrialBanner";
import WelcomeMessageBubble from "@/components/WelcomeMessageBubble";
import FloatingMessageBubble from "@/components/FloatingMessageBubble";
import ScheduleSection from "@/components/ScheduleSection";
import FeaturesSection from "@/components/FeaturesSection";
import AboutBrandSection from "@/components/AboutBrandSection";
import InstagramCarousel from "@/components/InstagramCarousel";
import Footer from "@/components/Footer";
import { getInstagramEmbedConfig } from "@/lib/instagram-embed";

export const dynamic = "force-dynamic";

/** Below-the-hero content (auth + Prisma). Kept out of the first paint so the hero video is not blocked by DB latency. */
async function HomeBelowFold() {
  const [session, scheduleRaw] = await Promise.all([auth(), getCurrentWeekSchedule()]);
  const schedule = scheduleRaw ?? getDemoWeekSchedule();
  const isSignedIn = !!session?.user;

  return (
    <div className="homepage-imessage-surface">
      <div className="relative z-[1]">
        <TrialBanner />
        <WelcomeMessageBubble />
        <FloatingMessageBubble />
        <ScheduleSection schedule={schedule} showLockIcon={!isSignedIn} />
        <FeaturesSection showLockIcon={!isSignedIn} />
        <AboutBrandSection />
        <section className="mb-16 overflow-visible md:mb-20">
          <InstagramCarousel {...getInstagramEmbedConfig()} />
        </section>
        <Footer bleedBackground />
      </div>
    </div>
  );
}

function HomeBelowFoldFallback() {
  return (
    <div className="homepage-imessage-surface" aria-busy="true" aria-label="Loading page content">
      <div className="relative z-[1] mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mx-auto h-3 max-w-md animate-pulse rounded-full bg-sand/80" />
        <div className="mx-auto mt-4 h-3 max-w-sm animate-pulse rounded-full bg-sand/60" />
        <p className="mt-6 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
          Loading weekly routine…
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white font-[family-name:var(--font-body),sans-serif]">
      <a href="#main-content" className="skip-link sr-only">
        Skip to main content
      </a>
      <div className="relative">
        <SiteHeader />
        <HeroSection />
      </div>
      <Suspense fallback={<HomeBelowFoldFallback />}>
        <HomeBelowFold />
      </Suspense>
    </div>
  );
}
