"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  APP_PRIMARY_NAV,
  PRIMARY_NAV,
  PRIMARY_NAV_LINK_CLASS,
  PRIMARY_NAV_LINK_CLASS_MOBILE,
} from "@/constants/nav";

export type SiteHeaderProps = {
  variant?: "marketing" | "app";
};

function pathMatchesNav(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false;
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export default function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navItems = variant === "app" ? APP_PRIMARY_NAV : PRIMARY_NAV;
  const logoHref = variant === "app" ? "/schedule" : "/";

  const [marketingScrolled, setMarketingScrolled] = useState(false);
  useEffect(() => {
    if (variant !== "marketing") return;
    const onScroll = () => setMarketingScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const marketingClear = variant === "marketing" && !marketingScrolled;
  /** Cream nav text only on homepage hero (video behind bar); other routes stay gray on light backgrounds. */
  const creamOnHero = marketingClear && pathname === "/";

  /** Marketing desktop nav on hero: cream (#FFFCE9) when bar is transparent. */
  const marketingNavDesktop =
    "text-xs font-medium uppercase tracking-wider text-background hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:rounded-sm";

  const desktopLinkClass = (href: string) => {
    if (variant !== "app") {
      return creamOnHero ? marketingNavDesktop : PRIMARY_NAV_LINK_CLASS;
    }
    return pathMatchesNav(pathname, href)
      ? `${PRIMARY_NAV_LINK_CLASS} font-semibold`
      : PRIMARY_NAV_LINK_CLASS;
  };

  const mobileLinkClass = (href: string) => {
    if (variant !== "app") {
      return PRIMARY_NAV_LINK_CLASS_MOBILE;
    }
    return pathMatchesNav(pathname, href)
      ? `${PRIMARY_NAV_LINK_CLASS_MOBILE} font-semibold`
      : PRIMARY_NAV_LINK_CLASS_MOBILE;
  };

  return (
    <header
      className={`[font-family:var(--font-headline),sans-serif] ${
        marketingClear
          ? "relative sticky top-0 z-50 border-b-0 bg-transparent backdrop-blur-none transition-[background-color,backdrop-filter,border-width] duration-300"
          : "relative sticky top-0 z-50 border-b border-sand bg-white/95 backdrop-blur-sm transition-[background-color,backdrop-filter,border-color] duration-300"
      }`}
      role="banner"
    >
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 pl-0 pr-4 md:pr-8">
        <Link
          href={logoHref}
          className={`flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:rounded-sm ${
            creamOnHero
              ? "focus-visible:ring-background/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              : "focus-visible:ring-sky-blue focus-visible:ring-offset-2"
          }`}
        >
          <span
            className={`text-xl font-normal lowercase leading-[1.4] tracking-[0.135em] [font-family:var(--font-headline),sans-serif] [font-synthesis:none] md:text-2xl ${
              creamOnHero ? "text-background" : "text-gray"
            }`}
          >
            awake+align
          </span>
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 justify-center gap-6 md:flex lg:gap-8"
          aria-label="Primary"
        >
          {navItems.map(({ href, label }, idx) => (
            <Link
              key={href}
              href={href}
              className={`${desktopLinkClass(href)} ${variant === "marketing" ? "animate-nav-item-in" : ""}`}
              style={variant === "marketing" ? { animationDelay: `${idx * 85}ms` } : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <details className="md:hidden">
          <summary
            className={`list-none cursor-pointer rounded-sm px-2 py-1.5 text-xs font-medium uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden ${
              creamOnHero
                ? "text-background hover:bg-white/10 hover:opacity-90 focus-visible:ring-background/80 focus-visible:ring-offset-transparent"
                : "text-gray hover:bg-background hover:opacity-80 focus-visible:ring-sky-blue"
            }`}
          >
            Menu
          </summary>
          <div className="absolute left-0 right-0 top-full z-50 mt-0 border-b border-sand bg-white px-4 py-3 shadow-lg">
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label }) => (
                <Link key={href} href={href} className={mobileLinkClass(href)}>
                  {label}
                </Link>
              ))}
              {variant === "app" ? (
                <>
                  {session?.user?.isAdmin ? (
                    <Link href="/admin" className={PRIMARY_NAV_LINK_CLASS_MOBILE}>
                      Admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-sm py-2 text-left text-xs font-medium uppercase tracking-wider text-gray hover:bg-background hover:opacity-80"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </details>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {variant === "marketing" ? (
            <>
              <Link
                href="/register"
                className={`hidden rounded-sm px-4 py-2 text-xs font-medium uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-block ${
                  creamOnHero
                    ? "border border-background/60 bg-white/10 text-background hover:border-background/80 hover:bg-white/15 focus-visible:ring-background/80 focus-visible:ring-offset-transparent"
                    : "border border-sand bg-white text-gray hover:border-sky-blue hover:bg-background hover:opacity-90 focus-visible:ring-sky-blue"
                }`}
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className={`rounded-sm border px-4 py-2 text-xs font-medium uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  creamOnHero
                    ? "border-background/60 text-background hover:border-background/80 hover:bg-white/10 focus-visible:ring-background/80 focus-visible:ring-offset-transparent"
                    : "border-sand text-gray hover:border-gray hover:bg-background hover:opacity-90 focus-visible:ring-sky-blue"
                }`}
              >
                Member login
              </Link>
            </>
          ) : (
            <>
              {session?.user?.isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden text-xs font-medium uppercase tracking-wider text-gray transition hover:opacity-80 sm:inline"
                >
                  Admin
                </Link>
              ) : null}
              {session?.user?.email ? (
                <span className="hidden max-w-[10rem] truncate text-xs text-gray [font-family:var(--font-body),sans-serif] md:inline lg:max-w-[14rem]">
                  {session.user.email}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-sm border border-sand px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray transition hover:bg-background hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
