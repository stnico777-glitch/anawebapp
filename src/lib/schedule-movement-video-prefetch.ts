/**
 * Injects `<link rel="preload" as="video">` once per URL for the current session.
 * Used from the weekly schedule (hover / today) so the MP4 warms before navigation,
 * and from the session page to warm the workout while the encouragement plays.
 *
 * `priority = "low"` lets secondary prefetches (e.g. the workout video during the
 * encouragement step) fill idle bandwidth without stealing from the active video.
 */
const preloadedUrls = new Set<string>();

export function injectScheduleMovementVideoPreload(
  src: string | null | undefined,
  options: { priority?: "high" | "low" } = {},
): void {
  if (typeof document === "undefined" || !src?.trim()) return;
  const url = src.trim();
  if (preloadedUrls.has(url)) return;
  preloadedUrls.add(url);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = url;
  link.setAttribute("fetchpriority", options.priority ?? "high");
  document.head.appendChild(link);
}
