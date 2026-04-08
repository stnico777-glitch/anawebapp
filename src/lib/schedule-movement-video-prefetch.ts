/**
 * Injects `<link rel="preload" as="video">` once per URL for the current session.
 * Used from the weekly schedule (hover / today) so the MP4 warms before navigation.
 */
const preloadedUrls = new Set<string>();

export function injectScheduleMovementVideoPreload(src: string | null | undefined): void {
  if (typeof document === "undefined" || !src?.trim()) return;
  const url = src.trim();
  if (preloadedUrls.has(url)) return;
  preloadedUrls.add(url);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = url;
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}
