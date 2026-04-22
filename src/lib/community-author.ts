import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  COMMUNITY_VISITOR_COOKIE,
  newVisitorId,
} from "@/lib/community-participant";

function bearerTokenFromRequest(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

export type WallAuthor = {
  /** Supabase `auth.users.id`. */
  userId: string;
  /** Always server-derived; never trust client `authorName`. Max 80 chars. */
  displayName: string;
};

/**
 * Resolves the logged-in author on a write request (create post / comment).
 * Accepts EITHER a web session cookie (next.js `auth()`) or a Supabase Bearer
 * token from the `Authorization` header (mobile apps, etc.).
 * Always re-reads `profiles.display_name` so clients can't spoof author names.
 */
export async function resolveWallAuthor(request: Request): Promise<WallAuthor | null> {
  // 1) Web: cookie-backed session — `auth()` already reads `profiles`
  const session = await auth();
  if (session?.user?.id) {
    const name = session.user.name?.trim() || "Member";
    return { userId: session.user.id, displayName: name.slice(0, 80) };
  }

  // 2) Native / SDK: `Authorization: Bearer <supabase_access_token>`
  const token = bearerTokenFromRequest(request);
  const env = getSupabasePublicEnv();
  if (!token || !env) return null;

  const supabase = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user?.id) return null;

  // Source of truth for display name (never trust the client)
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { displayName: true },
  });
  const fallbackName =
    (user.user_metadata?.name as string | undefined)?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "Member";
  const name = profile?.displayName?.trim() || fallbackName;
  return { userId: user.id, displayName: name.slice(0, 80) };
}

export type WallParticipant = {
  /** `user:<uuid>` when logged in, `v:<uuid>` for anonymous visitors. */
  participantKey: string;
  /** Only set for logged-in participants (cookie or Bearer). */
  userId: string | null;
  /** When non-null, caller must `res.cookies.set(COMMUNITY_VISITOR_COOKIE, …)`. */
  visitorCookie: string | null;
};

/**
 * Resolves the participant for low-stakes engagement (pray / celebrate / encourage).
 * Prefers a real user (cookie → Bearer token), falls back to an anonymous visitor key
 * which is minted and returned as `visitorCookie` on first interaction.
 */
export async function resolveWallParticipant(
  req: NextRequest,
): Promise<WallParticipant> {
  // Prefer the real user (cookie first, then bearer token for mobile)
  const session = await auth();
  if (session?.user?.id) {
    return {
      participantKey: `user:${session.user.id}`,
      userId: session.user.id,
      visitorCookie: null,
    };
  }

  const token = bearerTokenFromRequest(req);
  if (token) {
    const env = getSupabasePublicEnv();
    if (env) {
      const supabase = createClient(env.url, env.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && user?.id) {
        return {
          participantKey: `user:${user.id}`,
          userId: user.id,
          visitorCookie: null,
        };
      }
    }
  }

  // Anonymous visitor — reuse existing cookie or mint one
  let vid = req.cookies.get(COMMUNITY_VISITOR_COOKIE)?.value ?? null;
  if (!vid) {
    vid = newVisitorId();
    return { participantKey: `v:${vid}`, userId: null, visitorCookie: vid };
  }
  return { participantKey: `v:${vid}`, userId: null, visitorCookie: null };
}

export const VISITOR_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
