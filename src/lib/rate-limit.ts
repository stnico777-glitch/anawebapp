/**
 * Simple in-process sliding-window rate limiter. Good enough to stop casual
 * spam and accidental loops. Not perfect across multiple serverless instances
 * (each lambda cold start has its own Map); swap for Upstash / Redis later if
 * abuse warrants it.
 */

type Bucket = number[]; // timestamps (ms)

const BUCKETS = new Map<string, Bucket>();
/** Soft cap on Map size — evicts the oldest key if we blow past this. */
const MAX_KEYS = 5000;

function evictIfNeeded(): void {
  if (BUCKETS.size <= MAX_KEYS) return;
  const firstKey = BUCKETS.keys().next().value as string | undefined;
  if (firstKey !== undefined) BUCKETS.delete(firstKey);
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the next allowed request. 0 when ok. */
  retryAfter: number;
};

/**
 * @param key — uniquely identifies the actor + action. e.g. `post:prayer:user:<id>`.
 * @param limit — max events within `windowMs`.
 * @param windowMs — sliding window size.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = BUCKETS.get(key) ?? [];
  const fresh = existing.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    const msUntilFree = windowMs - (now - fresh[0]!);
    return { ok: false, retryAfter: Math.max(1, Math.ceil(msUntilFree / 1000)) };
  }
  fresh.push(now);
  BUCKETS.set(key, fresh);
  evictIfNeeded();
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from standard proxy headers (Vercel, Cloudflare, etc.). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/** Identifier for rate-limit keys: prefer user id, fall back to IP. */
export function rateLimitActor(
  userId: string | null | undefined,
  request: Request,
): string {
  return userId ? `user:${userId}` : `ip:${clientIp(request)}`;
}
