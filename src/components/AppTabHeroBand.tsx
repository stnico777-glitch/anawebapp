"use client";

import { usePathname } from "next/navigation";
import HeroBrandOverlay from "@/components/HeroBrandOverlay";
import HeroVideo from "@/components/HeroVideo";

function ariaLabelForPath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "CMS — edit content";
  if (pathname.startsWith("/movement")) return "Movement";
  if (pathname.startsWith("/prayer")) return "Audio";
  if (pathname.startsWith("/journaling")) return "Prayer journal";
  if (pathname.startsWith("/more")) return "More";
  if (pathname.startsWith("/schedule")) return "Schedule";
  return "awake + align";
}

/**
 * Shared short hero for main app tabs. Lives in `(main-tabs)/layout` so the video
 * element stays mounted across client navigations between Schedule · Movement · Audio · Journal.
 */
function creamWordmarkForPath(pathname: string): boolean {
  return (
    pathname.startsWith("/movement") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/prayer") ||
    pathname.startsWith("/journaling") ||
    pathname.startsWith("/more")
  );
}

export default function AppTabHeroBand() {
  const pathname = usePathname() ?? "";
  const creamWordmark = creamWordmarkForPath(pathname);
  return (
    <section
      className="relative h-[min(28vh,300px)] min-h-[140px] w-full overflow-hidden bg-black"
      aria-label={ariaLabelForPath(pathname)}
    >
      <div className="absolute left-0 right-0 top-0 z-20 h-1 bg-sky-blue" aria-hidden />
      <HeroVideo objectPosition="upper" sourceTier="appTabs" />
      {/* Clear at top; smooth linear fade to cream by 90%; bottom 10% solid at fold. */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_90%,var(--background)_100%)]"
        aria-hidden
      />
      <HeroBrandOverlay textColor={creamWordmark ? "cream" : "white"} />
    </section>
  );
}
