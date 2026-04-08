"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/workouts", label: "Movement" },
  { href: "/admin/prayer", label: "Audio" },
  { href: "/admin/prayer-journal", label: "Journal" },
  { href: "/admin/schedules", label: "Schedules" },
  { href: "/admin/daily-verse", label: "Daily verses" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * CMS section nav — typography and spacing aligned with app primary nav (Schedule · Movement · …).
 */
export default function AdminCmsNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="border-b border-sand bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
          <nav
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-4 md:gap-x-6"
            aria-label="CMS sections"
          >
            {ITEMS.map(({ href, label }) => {
              const on = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-sm px-1 py-1 text-xs font-medium uppercase tracking-wider transition [font-family:var(--font-headline),sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 ${
                    on
                      ? "font-semibold text-sky-blue"
                      : "text-gray hover:text-foreground hover:opacity-90"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/schedule"
            className="shrink-0 text-xs font-medium uppercase tracking-wider text-gray transition hover:text-sky-blue [font-family:var(--font-headline),sans-serif]"
          >
            ← App
          </Link>
        </div>
      </div>
    </div>
  );
}
