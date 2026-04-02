import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import HeroTitle from "@/components/HeroTitle";

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] h-[100dvh] overflow-hidden" aria-label="Hero">
      <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-sky-blue" aria-hidden />
      <HeroVideo variant="carousel" />
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center py-6">
        <div className="flex w-full max-w-7xl items-center justify-start pl-4 pr-4 md:pl-6 md:pr-8">
          <Link href="/" className="text-xl font-medium tracking-wide text-white/95 md:text-2xl [font-family:var(--font-headline),sans-serif] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm">
            the Movement
          </Link>
        </div>
      </div>
      <main id="main-content" className="relative z-10 flex h-full flex-col items-center justify-start pt-[min(15rem,34dvh)] px-6 text-center md:pt-[min(18.5rem,38dvh)]" role="main">
        <HeroTitle />
      </main>
      <footer className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <p className="text-xs text-white/60">awake + align © 2026</p>
      </footer>
    </section>
  );
}
