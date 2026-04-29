import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Server-side session shape compatible with previous NextAuth usage.
 * Deduplicated per request via React `cache` when called from multiple server components.
 */
export const auth = cache(async function auth() {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* ignore when cookies cannot be set */
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: entitlements }, { data: profile }] = await Promise.all([
    supabase
      .from("user_entitlements")
      .select("is_subscriber")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("is_admin, is_subscriber, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  /** Mobile + web: `user_entitlements` is SSOT; `profiles` + Prisma mirror Stripe. */
  let isAdmin = profile?.is_admin ?? false;
  const ent = entitlements as { is_subscriber?: boolean } | null;
  let isSubscriber =
    ent && typeof ent.is_subscriber === "boolean"
      ? ent.is_subscriber
      : (profile?.is_subscriber ?? false);

  try {
    const privileged = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, isSubscriber: true },
    });
    if (privileged) {
      isAdmin = privileged.isAdmin;
      if (!(ent && typeof ent.is_subscriber === "boolean")) {
        isSubscriber = privileged.isSubscriber;
      }
    }
  } catch {
    /* keep Supabase-derived flags */
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name:
        profile?.display_name ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined),
      image:
        profile?.avatar_url ??
        (user.user_metadata?.avatar_url as string | undefined),
      isAdmin,
      isSubscriber,
    },
  };
});
