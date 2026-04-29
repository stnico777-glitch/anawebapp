import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Server-only Stripe SDK (API routes / webhooks). */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

/**
 * Absolute origin for Stripe redirect URLs.
 *
 * Prefer the **incoming request's origin** so the user returns from Stripe to the
 * same domain they started on (cookies — including the Supabase auth cookie — are
 * scoped per origin, so a localhost→prod or preview→prod hop logs them out).
 * Falls back to env config when called from contexts without a request.
 */
export function appBaseUrl(request?: Request): string {
  const fromRequest = request ? originFromRequest(request) : null;
  if (fromRequest) return fromRequest;
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

function originFromRequest(request: Request): string | null {
  const headerOrigin = request.headers.get("origin")?.trim();
  if (headerOrigin) return headerOrigin.replace(/\/$/, "");
  try {
    const u = new URL(request.url);
    if (u.origin && u.origin !== "null") return u.origin;
  } catch {
    /** fall through */
  }
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    ?? request.headers.get("host")?.trim();
  if (proto && host) return `${proto}://${host}`.replace(/\/$/, "");
  return null;
}
