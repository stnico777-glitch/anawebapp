import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth-edge";
import {
  COMMUNITY_VISITOR_COOKIE,
  COMMUNITY_VID_HEADER,
} from "@/lib/community-participant";

/** Visitor id for /community: Set-Cookie plus request header so the first RSC render matches API identity. */
function withCommunityVisitor(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  if (pathname !== "/community" && !pathname.startsWith("/community/")) {
    return NextResponse.next();
  }
  let vid = req.cookies.get(COMMUNITY_VISITOR_COOKIE)?.value ?? null;
  const createdNew = !vid;
  if (!vid) vid = crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(COMMUNITY_VID_HEADER, vid);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
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
  "/workouts",
  "/prayer",
  "/journaling",
  "/community",
  "/more",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return Response.redirect(new URL("/schedule", req.url));
    }
    return withCommunityVisitor(req);
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && !req.auth?.user?.isAdmin) {
    return Response.redirect(new URL("/schedule", req.url));
  }

  return withCommunityVisitor(req);
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
