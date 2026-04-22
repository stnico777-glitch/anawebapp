import HeroVideo from "@/components/HeroVideo";
import HeroTitle from "@/components/HeroTitle";

export default function HeroSection() {
  return (
    <section
      className="relative z-0 min-h-[100dvh] h-[100dvh] overflow-hidden"
      aria-label="Hero"
    >
      <HeroVideo variant="carousel" />
      <main id="main-content" className="relative z-10 flex h-full flex-col items-center justify-start pt-[min(14rem,30dvh)] px-6 text-center md:pt-[min(17rem,35dvh)] lg:pt-[min(18.5rem,37dvh)]" role="main">
        <HeroTitle />
      </main>
      <footer className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <p className="text-xs font-normal lowercase leading-[1.4] tracking-[0.135em] text-white/60 [font-family:var(--font-headline),sans-serif] [font-synthesis:none]">
          awake + align © 2026
        </p>
      </footer>
    </section>
  );
}
