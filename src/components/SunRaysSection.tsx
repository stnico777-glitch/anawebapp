"use client";

import { useState, useEffect } from "react";

/**
 * Soft sunrise glow — no thick rays, subtle pulsing.
 * Intensity grows as user scrolls; bottom of page → sun more visible.
 */
export default function SunRaysSection() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0;
      setScrollProgress(progress);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Peach / warm white — same family as WelcomeMessageBubble glow (not stark yellow-cream).
  const baseOpacity = 0.06 + scrollProgress * 0.1;
  const glowOpacity = 0.04 + scrollProgress * 0.06;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{
        background: `
          radial-gradient(
            ellipse 140% 100% at 50% 100%,
            rgba(255, 238, 210, ${glowOpacity}) 0%,
            rgba(255, 230, 185, ${glowOpacity * 0.6}) 28%,
            rgba(254, 250, 240, ${glowOpacity * 0.3}) 58%,
            transparent 86%
          ),
          radial-gradient(
            ellipse 95% 74% at 50% 99%,
            rgba(255, 235, 198, ${baseOpacity * 0.75}) 0%,
            rgba(255, 242, 205, ${baseOpacity * 0.7}) 36%,
            rgba(255, 240, 210, ${baseOpacity * 0.35}) 56%,
            transparent 74%
          )
        `,
      }}
    >
      <div
        className="absolute inset-0 h-full w-full animate-sun-glow-soft"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(255, 240, 210, 0.08) 0%, transparent 62%)",
        }}
      />
    </div>
  );
}
