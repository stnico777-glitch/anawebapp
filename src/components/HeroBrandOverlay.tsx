import Link from "next/link";

type HeroBrandOverlayProps = {
  /** App pages: match `SiteHeader` app logo target. */
  href?: string;
};

/**
 * Centered wordmark on short hero video bands (workouts, audio, etc.).
 */
export default function HeroBrandOverlay({ href = "/schedule" }: HeroBrandOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
      <Link
        href={href}
        className="pointer-events-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
      >
        <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl [font-family:var(--font-headline),sans-serif]">
          awake + align
        </span>
      </Link>
    </div>
  );
}
