import { createServerClient } from "@supabase/ssr";
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
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/workouts" || pathname.startsWith("/workouts/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/workouts/, "/movement");
    return NextResponse.redirect(url);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl?.trim() || !supabaseAnon?.trim()) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/schedule", req.url));
    }
    return withCommunityVisitor(req, NextResponse.next());
  }

  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.is_admin ?? false;
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
