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
    <div
      className="relative z-20 flex h-9 w-full items-center overflow-hidden bg-gray text-background [font-family:var(--font-body),sans-serif]"
      role="region"
      aria-label="Free trial offer"
    >
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
                    ? "text-xs text-background/90 md:text-sm [font-family:var(--font-body),sans-serif]"
                    : "text-xs font-medium tracking-wide md:text-sm [font-family:var(--font-body),sans-serif]"
            }
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
