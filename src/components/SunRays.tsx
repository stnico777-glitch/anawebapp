"use client";

/**
 * Ethereal sun/rays effect at the bottom of the page.
 * Origin at bottom center; rays glow upward. Content overlays on top (higher z-index).
 */
export default function SunRays() {
  return (
    <div
      aria-hidden
      className="sun-rays pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[90vh] w-full"
      style={{
        background: `
          radial-gradient(
            ellipse 140% 90% at 50% 100%,
            rgba(255, 230, 180, 0.7) 0%,
            rgba(255, 218, 165, 0.4) 20%,
            rgba(250, 200, 150, 0.2) 45%,
            transparent 72%
          ),
          radial-gradient(
            ellipse 100% 60% at 50% 100%,
            rgba(255, 245, 220, 0.85) 0%,
            rgba(255, 235, 200, 0.35) 35%,
            transparent 60%
          )
        `,
      }}
    >
      {/* Ray streaks: conic gradient from bottom center, masked to fade upward */}
      <div
        className="absolute inset-x-0 bottom-0 h-[75vh] w-full opacity-60"
        style={{
          background: `conic-gradient(
            from 180deg at 50% 100%,
            transparent 0deg 15deg,
            rgba(255, 240, 210, 0.5) 15deg 25deg,
            transparent 25deg 45deg,
            rgba(255, 245, 220, 0.4) 45deg 55deg,
            transparent 55deg 75deg,
            rgba(255, 238, 200, 0.45) 75deg 85deg,
            transparent 85deg 105deg,
            rgba(255, 242, 215, 0.4) 105deg 115deg,
            transparent 115deg 135deg,
            rgba(255, 240, 208, 0.45) 135deg 145deg,
            transparent 145deg 165deg,
            rgba(255, 245, 218, 0.4) 165deg 175deg,
            transparent 175deg 195deg,
            rgba(255, 238, 202, 0.45) 195deg 205deg,
            transparent 205deg 225deg,
            rgba(255, 242, 212, 0.4) 225deg 235deg,
            transparent 235deg 255deg,
            rgba(255, 240, 210, 0.5) 255deg 265deg,
            transparent 265deg 285deg,
            rgba(255, 245, 220, 0.4) 285deg 295deg,
            transparent 295deg 315deg,
            rgba(255, 238, 200, 0.45) 315deg 325deg,
            transparent 325deg 345deg,
            rgba(255, 242, 215, 0.4) 345deg 355deg,
            transparent 355deg 360deg
          )`,
          maskImage: "linear-gradient(to top, transparent 0%, black 25%, black 100%)",
          WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 25%, black 100%)",
        }}
      />
      {/* Soft sparkle */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.8) 0%, transparent 1.5%),
            radial-gradient(circle at 50% 95%, rgba(255,255,255,0.9) 0%, transparent 1%),
            radial-gradient(circle at 80% 85%, rgba(255,255,255,0.7) 0%, transparent 1.2%),
            radial-gradient(circle at 35% 70%, rgba(255,255,255,0.5) 0%, transparent 1%),
            radial-gradient(circle at 65% 75%, rgba(255,255,255,0.6) 0%, transparent 1.1%)`,
          backgroundSize: "100% 100%",
        }}
      />
    </div>
  );
}
