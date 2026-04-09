import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export type SessionForApp = {
  userId: string | undefined;
  isSubscriber: boolean;
};

/**
 * For app pages that need userId and isSubscriber.
 * Middleware still protects app routes when not logged in.
 */
export async function getSessionForApp(): Promise<SessionForApp> {
  const s = await auth();
  return {
    userId: s?.user?.id,
    isSubscriber: s?.user?.isSubscriber ?? false,
  };
}

/**
 * For API routes that require an authenticated user.
 * Returns the session or null; caller should return 401 if null.
 */
export async function requireAuth(): Promise<{ id: string } | null> {
  const s = await auth();
  if (!s?.user?.id) return null;
  return { id: s.user.id };
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
): Promise<{ id: string } | null> {
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
  return { id: user.id };
}
