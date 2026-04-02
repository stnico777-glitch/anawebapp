import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    throw new Error("Unauthorized");
  }
  return session;
}

type AdminRouteContext = { params?: Promise<Record<string, string>> };

/**
 * Wraps an admin API route handler. Runs requireAdmin() first; returns 401 on failure.
 * Your handler receives (session, request, context).
 */
export function withAdmin<T extends AdminRouteContext = AdminRouteContext>(
  handler: (session: Session, request: Request, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context?: T) => {
    try {
      const session = await requireAdmin();
      return handler(session, request, (context ?? {}) as T);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  };
}
