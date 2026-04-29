import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { prisma } from "@/lib/prisma";

export type SessionForApp = {
  userId: string | undefined;
  isSubscriber: boolean;
};

/**
 * For app pages that need userId and isSubscriber.
 *
 * Note: The (main-tabs) app pages are intentionally publicly viewable (see
 * `src/middleware.ts` `publicPaths`). Feature-level gates inside those pages
 * and the `requireMember` API helper are what enforce "members can act".
 */
export async function getSessionForApp(): Promise<SessionForApp> {
  const s = await auth();
  return {
    userId: s?.user?.id,
    isSubscriber: s?.user?.isSubscriber ?? false,
  };
}

export type AuthedUser = { id: string; isAdmin: boolean; isSubscriber: boolean };

/**
 * For API routes that require an authenticated user.
 * Returns the session user (with admin/subscriber flags) or null; caller
 * should return 401 if null.
 */
export async function requireAuth(): Promise<AuthedUser | null> {
  const s = await auth();
  if (!s?.user?.id) return null;
  return {
    id: s.user.id,
    isAdmin: s.user.isAdmin ?? false,
    isSubscriber: s.user.isSubscriber ?? false,
  };
}

function bearerTokenFromRequest(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

/**
 * Same as {@link requireAuth} for cookie-based web sessions, plus
 * `Authorization: Bearer <access_token>` for native/mobile clients using Supabase Auth.
 */
export async function requireAuthFromRequest(
  request: Request,
): Promise<AuthedUser | null> {
  const cookieUser = await requireAuth();
  if (cookieUser) return cookieUser;

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

  const [{ data: entitlements }, { data: profile }] = await Promise.all([
    supabase
      .from("user_entitlements")
      .select("is_subscriber")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("is_admin, is_subscriber")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  let isAdmin = profile?.is_admin ?? false;
  const entBearer = entitlements as { is_subscriber?: boolean } | null;
  let isSubscriber =
    entBearer && typeof entBearer.is_subscriber === "boolean"
      ? entBearer.is_subscriber
      : (profile?.is_subscriber ?? false);

  try {
    const privileged = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, isSubscriber: true },
    });
    if (privileged) {
      isAdmin = privileged.isAdmin;
      if (!(entBearer && typeof entBearer.is_subscriber === "boolean")) {
        isSubscriber = privileged.isSubscriber;
      }
    }
  } catch {
    /* keep Supabase-derived flags */
  }

  return {
    id: user.id,
    isAdmin,
    isSubscriber,
  };
}

export type MemberGateResult =
  | { ok: true; user: AuthedUser }
  | { ok: false; status: 401 | 403; body: { error: string } };

/**
 * Gate an API action behind "signed-in active member".
 *
 * Admins bypass the subscription check. Non-members get 403 so the client
 * can render a "Join / upgrade" CTA instead of bouncing them to /login.
 */
export async function requireMemberFromRequest(
  request: Request,
): Promise<MemberGateResult> {
  const user = await requireAuthFromRequest(request);
  if (!user) {
    return { ok: false, status: 401, body: { error: "unauthorized" } };
  }
  if (!user.isSubscriber && !user.isAdmin) {
    return {
      ok: false,
      status: 403,
      body: { error: "membership_required" },
    };
  }
  return { ok: true, user };
}
