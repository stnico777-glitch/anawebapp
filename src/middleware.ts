import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COMMUNITY_VISITOR_COOKIE,
  COMMUNITY_VID_HEADER,
} from "@/lib/community-participant";

function withCommunityVisitor(
  req: NextRequest,
  base: NextResponse,
): NextResponse {
  const { pathname } = req.nextUrl;
  if (pathname !== "/community" && !pathname.startsWith("/community/")) {
    return base;
  }
  let vid = req.cookies.get(COMMUNITY_VISITOR_COOKIE)?.value ?? null;
  const createdNew = !vid;
  if (!vid) vid = crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(COMMUNITY_VID_HEADER, vid);
  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  base.cookies.getAll().forEach((c) => {
    res.cookies.set(c.name, c.value);
  });
  if (createdNew) {
    res.cookies.set(COMMUNITY_VISITOR_COOKIE, vid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/subscribe",
  "/schedule",
  "/movement",
  "/prayer",
  "/journaling",
  "/community",
  "/more",
  "/privacy",
  "/terms",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/workouts" || pathname.startsWith("/workouts/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/workouts/, "/movement");
    return NextResponse.redirect(url);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnon) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/schedule", req.url));
    }
    return withCommunityVisitor(req, NextResponse.next());
  }

  let supabaseResponse = NextResponse.next({ request: req });
  let user: User | null = null;
  let isAdmin = false;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              req.cookies.set(name, value);
            });
          } catch {
            /* Some runtimes disallow mutating request cookies; response cookies still apply. */
          }
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
          if (responseHeaders && typeof responseHeaders === "object") {
            for (const [key, value] of Object.entries(responseHeaders)) {
              if (value !== undefined && value !== null) {
                supabaseResponse.headers.set(key, String(value));
              }
            }
          }
        },
      },
    });

    const {
      data: { user: authed },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && authed) {
      user = authed;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authed.id)
        .maybeSingle();
      if (!profileError) {
        isAdmin = profile?.is_admin ?? false;
      }
    }
  } catch (e) {
    console.error("[middleware] Supabase session error:", e);
    supabaseResponse = NextResponse.next({ request: req });
  }

  const isLoggedIn = !!user;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      const r = NextResponse.redirect(new URL("/schedule", req.url));
      supabaseResponse.cookies.getAll().forEach((c) => r.cookies.set(c.name, c.value));
      return r;
    }
    return withCommunityVisitor(req, supabaseResponse);
  }

  if (!isLoggedIn) {
    const r = NextResponse.redirect(new URL("/login", req.url));
    supabaseResponse.cookies.getAll().forEach((c) => r.cookies.set(c.name, c.value));
    return r;
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    const r = NextResponse.redirect(new URL("/schedule", req.url));
    supabaseResponse.cookies.getAll().forEach((c) => r.cookies.set(c.name, c.value));
    return r;
  }

  return withCommunityVisitor(req, supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*).*)",
  ],
};
