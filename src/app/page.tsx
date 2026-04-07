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

async function HomeContent() {
  const session = await auth();
  const scheduleRaw = await getCurrentWeekSchedule();
  const schedule = scheduleRaw ?? getDemoWeekSchedule();
  const isSignedIn = !!session?.user;

  return (
    <>
      <div className="relative">
        <SiteHeader />
        <HeroSection />
      </div>
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
    </>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white font-[family-name:var(--font-body),sans-serif]">
      <a href="#main-content" className="skip-link sr-only">
        Skip to main content
      </a>
      <HomeContent />
    </div>
  );
}
