import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekSchedule } from "@/lib/schedule";
import { getDemoWeekSchedule, DEMO_CAROUSEL_POSTS } from "@/lib/demo-preview-data";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import TrialBanner from "@/components/TrialBanner";
import WelcomeMessageBubble from "@/components/WelcomeMessageBubble";
import FloatingMessageBubble from "@/components/FloatingMessageBubble";
import ScheduleSection from "@/components/ScheduleSection";
import FeaturesSection from "@/components/FeaturesSection";
import InstagramCarousel from "@/components/InstagramCarousel";
import Footer from "@/components/Footer";
import { getInstagramEmbedConfig } from "@/lib/instagram-embed";

export const dynamic = "force-dynamic";

async function getCarouselPosts() {
  try {
    const posts = await prisma.carouselPost.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, imageUrl: true, linkUrl: true, alt: true },
    });
    return posts;
  } catch {
    return [];
  }
}

async function HomeContent() {
  const session = await auth();
  const [scheduleRaw, carouselRaw] = await Promise.all([
    getCurrentWeekSchedule(),
    getCarouselPosts(),
  ]);
  const schedule = scheduleRaw ?? getDemoWeekSchedule();
  const carouselPosts = carouselRaw.length > 0 ? carouselRaw : DEMO_CAROUSEL_POSTS;
  const isSignedIn = !!session?.user;

  return (
    <>
      <SiteHeader />
      <HeroSection />
      <div className="homepage-imessage-surface">
        <div className="relative z-[1]">
          <TrialBanner />
          <WelcomeMessageBubble />
          <FloatingMessageBubble />
          <ScheduleSection schedule={schedule} showLockIcon={!isSignedIn} />
          <FeaturesSection showLockIcon={!isSignedIn} />
          <section className="mb-16 md:mb-20">
            <InstagramCarousel
              posts={carouselPosts}
              {...getInstagramEmbedConfig()}
            />
          </section>
          <Footer bleedBackground />
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      <a href="#main-content" className="skip-link sr-only">
        Skip to main content
      </a>
      <HomeContent />
    </div>
  );
}
