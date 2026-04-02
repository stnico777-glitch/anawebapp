const MARQUEE_ITEMS = [
  "Start your 7-day free trial",
  "✦",
  "No credit card required",
  "✦",
  "“Power, love and a sound mind” — 2 Timothy 1:7",
  "✦",
  "awake + align — Faith, fitness & routine",
];

export default function TrialBanner() {
  return (
    <div className="relative z-20 flex h-9 w-full items-center overflow-hidden bg-foreground text-white" role="region" aria-label="Free trial offer">
      <div className="absolute top-0 left-0 right-0 h-1 bg-sky-blue" aria-hidden />
      <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className={
              item === "✦"
                ? "text-accent-amber"
                : item === "awake + align — Faith, fitness & routine" || item.startsWith("“Power,")
                  ? "text-xs font-medium tracking-wide md:text-sm [font-family:var(--font-headline),sans-serif] italic"
                  : item === "No credit card required"
                    ? "text-xs text-white/90 md:text-sm"
                    : "text-xs font-medium tracking-wide md:text-sm"
            }
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
