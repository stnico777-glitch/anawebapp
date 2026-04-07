import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Server client for Route Handlers / Server Actions that require Supabase.
 * Throws if env is not configured (use only after checking {@link getSupabasePublicEnv}).
 */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
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
          /* Server Components cannot always set cookies; Route Handlers / Actions can */
        }
      },
    },
  });
}

/**
 * Same as {@link createSupabaseServerClient} but returns null when env is missing (e.g. CI prerender).
 */
export async function tryCreateSupabaseServerClient() {
  if (!getSupabasePublicEnv()) return null;
  return createSupabaseServerClient();
}
