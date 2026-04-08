/**
 * Next.js Image Optimization allowlist: only certain remote URLs should use `/_next/image`.
 * Supabase Storage public/signed URLs under `/storage/` are safe to resize (WebP/AVIF).
 */

export function isNextImageOptimizableRemoteUrl(url: string): boolean {
  const t = url.trim();
  if (!t.startsWith("http://") && !t.startsWith("https://")) return false;
  try {
    const u = new URL(t);
    const host = u.hostname.toLowerCase();
    if (!host.endsWith(".supabase.co")) return false;
    return u.pathname.startsWith("/storage/");
  } catch {
    return false;
  }
}

/**
 * Pass to `next/image` as `unoptimized` when the URL cannot or should not go through the optimizer.
 * — Local `/…` paths: optimized by Next (false).
 * — `data:` URLs: must bypass (true).
 * — Other remote hosts: bypass until allowlisted in `next.config` (true).
 */
export function unoptimizedRemoteImage(url: string): boolean {
  const t = url.trim();
  if (t.startsWith("data:")) return true;
  if (t.startsWith("/")) return false;
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return !isNextImageOptimizableRemoteUrl(t);
  }
  return false;
}
