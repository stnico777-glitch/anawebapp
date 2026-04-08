"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  APP_PRIMARY_NAV,
  PRIMARY_NAV,
  PRIMARY_NAV_LINK_ACTIVE_CLASS,
  PRIMARY_NAV_LINK_CLASS,
  PRIMARY_NAV_LINK_CLASS_MOBILE,
  PRIMARY_NAV_LINK_MOBILE_ACTIVE_CLASS,
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

type NavItem = { readonly href: string; readonly label: string };

export default function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  /** `undefined` = auth not checked yet (avoid flashing wrong header actions). */
  const [sessionUserId, setSessionUserId] = useState<string | null | undefined>(undefined);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const client = tryCreateSupabaseBrowserClient();
    if (!client) {
      setSessionUserId(null);
      setSessionEmail(null);
      setIsAdmin(false);
      return;
    }
    let cancelled = false;

    async function syncSession(sb: NonNullable<ReturnType<typeof tryCreateSupabaseBrowserClient>>) {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setSessionUserId(null);
        setSessionEmail(null);
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setSessionUserId(user.id);
        setSessionEmail(user.email ?? null);
        setIsAdmin(profile?.is_admin ?? false);
      }
    }

    const scheduleRouteRefresh = () => {
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
      refreshDebounceRef.current = setTimeout(() => {
        refreshDebounceRef.current = null;
        router.refresh();
      }, 450);
    };

    void syncSession(client);
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      void syncSession(client);
      scheduleRouteRefresh();
    });
    return () => {
      cancelled = true;
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
      subscription.unsubscribe();
    };
  }, [router]);

  const baseAppNav: readonly NavItem[] = APP_PRIMARY_NAV;
  const navItems: readonly NavItem[] =
    variant === "app" && isAdmin
      ? [...baseAppNav, { href: "/admin", label: "CMS" }]
      : variant === "app"
        ? baseAppNav
        : PRIMARY_NAV;
  const [marketingScrolled, setMarketingScrolled] = useState(false);
  useEffect(() => {
    if (variant !== "marketing") return;
    const onScroll = () => {
      const next = window.scrollY > 12;
      setMarketingScrolled((prev) => (prev === next ? prev : next));
    };
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

  /** On homepage hero, active item uses theme blue (still readable on video). */
  const marketingNavDesktopActive =
    "text-xs font-semibold uppercase tracking-wider text-sky-blue hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:rounded-sm";

  const desktopLinkClass = (href: string) => {
    const active = pathMatchesNav(pathname, href);
    if (variant !== "app") {
      if (creamOnHero) {
        return active ? marketingNavDesktopActive : marketingNavDesktop;
      }
      return active
        ? `${PRIMARY_NAV_LINK_CLASS} ${PRIMARY_NAV_LINK_ACTIVE_CLASS}`
        : PRIMARY_NAV_LINK_CLASS;
    }
    return active
      ? `${PRIMARY_NAV_LINK_CLASS} ${PRIMARY_NAV_LINK_ACTIVE_CLASS}`
      : PRIMARY_NAV_LINK_CLASS;
  };

  const mobileLinkClass = (href: string) => {
    const active = pathMatchesNav(pathname, href);
    if (variant !== "app") {
      return active
        ? `${PRIMARY_NAV_LINK_CLASS_MOBILE} ${PRIMARY_NAV_LINK_MOBILE_ACTIVE_CLASS}`
        : PRIMARY_NAV_LINK_CLASS_MOBILE;
    }
    return active
      ? `${PRIMARY_NAV_LINK_CLASS_MOBILE} ${PRIMARY_NAV_LINK_MOBILE_ACTIVE_CLASS}`
      : PRIMARY_NAV_LINK_CLASS_MOBILE;
  };

  return (
    <header
      className={`[font-family:var(--font-headline),sans-serif] ${
        marketingClear
          ? "relative sticky top-0 z-50 border-b-0 bg-transparent transition-[background-color,border-width] duration-300"
          : variant === "marketing"
            ? "relative sticky top-0 z-50 border-b border-sand bg-background transition-[background-color,border-color] duration-300"
            : "relative sticky top-0 z-50 border-b border-sand bg-background transition-[background-color,border-color] duration-300"
      }`}
      role="banner"
    >
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 pl-0 pr-4 md:pr-8">
        <Link
          href="/"
          className={`flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:rounded-sm ${
            creamOnHero
              ? "focus-visible:ring-background/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              : variant === "app"
                ? "focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
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
              prefetch={href === "/community" ? false : undefined}
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
          <div
            className={`absolute left-0 right-0 top-full z-50 mt-0 border-b border-sand px-4 py-3 shadow-lg ${
              variant === "app" ? "bg-background" : "bg-white"
            }`}
          >
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={href === "/community" ? false : undefined}
                  className={mobileLinkClass(href)}
                >
                  {label}
                </Link>
              ))}
              {(variant === "app" || variant === "marketing") && sessionUserId !== undefined ? (
                sessionUserId ? (
                  <>
                    {sessionEmail ? (
                      <span className="truncate py-1 text-xs text-gray [font-family:var(--font-body),sans-serif]">
                        {sessionEmail}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-sm py-2 text-left text-xs font-medium uppercase tracking-wider text-gray hover:bg-background hover:opacity-80"
                      onClick={async () => {
                        const supabase = tryCreateSupabaseBrowserClient();
                        if (!supabase) return;
                        await supabase.auth.signOut();
                        router.push("/");
                        router.refresh();
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="rounded-sm py-2 text-left text-xs font-medium uppercase tracking-wider text-gray hover:bg-background hover:opacity-80"
                    >
                      Join the movement
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-sm py-2 text-left text-xs font-medium uppercase tracking-wider text-gray hover:bg-background hover:opacity-80"
                    >
                      Member login
                    </Link>
                  </>
                )
              ) : null}
            </div>
          </div>
        </details>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {variant === "marketing" ? (
            sessionUserId === undefined ? (
              <div
                className="h-9 w-28 shrink-0 animate-pulse rounded-sm bg-sand/60 md:w-36"
                aria-hidden
              />
            ) : sessionUserId ? (
              <>
                {sessionEmail ? (
                  <span
                    className={`hidden max-w-[10rem] truncate text-xs [font-family:var(--font-body),sans-serif] md:inline lg:max-w-[14rem] ${
                      creamOnHero ? "text-background" : "text-gray"
                    }`}
                  >
                    {sessionEmail}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = tryCreateSupabaseBrowserClient();
                    if (!supabase) return;
                    await supabase.auth.signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className={`rounded-sm border px-3 py-2 text-xs font-medium uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    creamOnHero
                      ? "border-background/60 text-background hover:border-background/80 hover:bg-white/10 focus-visible:ring-background/80 focus-visible:ring-offset-transparent"
                      : "border-sand text-gray hover:bg-background hover:opacity-90 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
                  }`}
                >
                  Sign out
                </button>
              </>
            ) : (
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
            )
          ) : sessionUserId === undefined ? (
            <div
              className="h-9 w-28 shrink-0 animate-pulse rounded-sm bg-sand/60 md:w-36"
              aria-hidden
            />
          ) : sessionUserId ? (
            <>
              {sessionEmail ? (
                <span className="hidden max-w-[10rem] truncate text-xs text-gray [font-family:var(--font-body),sans-serif] md:inline lg:max-w-[14rem]">
                  {sessionEmail}
                </span>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  const supabase = tryCreateSupabaseBrowserClient();
                  if (!supabase) return;
                  await supabase.auth.signOut();
                  router.push("/");
                  router.refresh();
                }}
                className="rounded-sm border border-sand px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray transition hover:bg-background hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden rounded-sm border border-sand bg-white px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray transition hover:border-sky-blue hover:bg-background hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface sm:inline-block"
              >
                Join the movement
              </Link>
              <Link
                href="/login"
                className="rounded-sm border border-sand px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray transition hover:bg-background hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
              >
                Member login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
