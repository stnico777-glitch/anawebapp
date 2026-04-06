import Link from "next/link";

type HeroBrandOverlayProps = {
  /** App pages: match `SiteHeader` app logo target. */
  href?: string;
  /** `cream` = theme background #FFFCE9; default `white`. */
  textColor?: "white" | "cream";
};

/**
 * Centered wordmark on short hero video bands — typography matches `SiteHeader` logo span.
 */
export default function HeroBrandOverlay({ href = "/schedule", textColor = "white" }: HeroBrandOverlayProps) {
  const isCream = textColor === "cream";
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
      <Link
        href={href}
        className={`pointer-events-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 ${
          isCream ? "focus-visible:ring-background/90" : "focus-visible:ring-white/90"
        }`}
      >
        <span
          className={`text-xl font-normal lowercase leading-[1.4] tracking-[0.135em] [font-family:var(--font-headline),sans-serif] [font-synthesis:none] md:text-2xl ${
            isCream ? "text-background" : "text-white"
          }`}
        >
          awake+align
        </span>
      </Link>
    </div>
  );
}
