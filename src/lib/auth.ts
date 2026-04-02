import { auth } from "@/auth";

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
