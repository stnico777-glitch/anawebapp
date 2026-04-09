import { AUDIO_LIBRARY_MIXED_COVER_CYCLE } from "@/constants/audioLibraryCovers";

export type PrayerLibraryItem = {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  audioUrl: string;
  duration: number;
  coverImageUrl: string | null;
};

const FALLBACK_COVERS = [...AUDIO_LIBRARY_MIXED_COVER_CYCLE];

/** First mixed-cycle asset — used when a remote cover fails to load. */
export const PRAYER_COVER_FALLBACK_SRC = FALLBACK_COVERS[0]!;

/**
 * Normalize pasted Supabase / CDN URLs so `<img>` and `next/image` can load them.
 * Common CMS issues: protocol-relative `//host/...`, missing `https://`, stray whitespace.
 */
export function normalizeCoverImageUrl(raw: string): string {
  const u = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!u) return u;
  if (u.startsWith("//")) {
    return `https:${u}`;
  }
  if (/^https?:\/\//i.test(u)) {
    return u;
  }
  const noLeadingSlashes = u.replace(/^\/+/, "");
  if (/^[a-z0-9][a-z0-9.-]*\.supabase\.co\//i.test(noLeadingSlashes)) {
    return `https://${noLeadingSlashes}`;
  }
  return u;
}

export function formatDurationMins(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}

export function coverForPrayer(
  p: PrayerLibraryItem,
  index: number
): { src: string; unoptimized: boolean } {
  if (p.coverImageUrl?.trim()) {
    const u = normalizeCoverImageUrl(p.coverImageUrl);
    if (!u) {
      return { src: FALLBACK_COVERS[index % FALLBACK_COVERS.length]!, unoptimized: false };
    }
    const unoptimized = /^https?:\/\//i.test(u);
    return { src: u, unoptimized };
  }
  return { src: FALLBACK_COVERS[index % FALLBACK_COVERS.length]!, unoptimized: false };
}

export function railCoversDeduped(
  list: PrayerLibraryItem[]
): { src: string; unoptimized: boolean }[] {
  const out: { src: string; unoptimized: boolean }[] = [];
  let prevSrc: string | null = null;
  list.forEach((p, index) => {
    let cov = coverForPrayer(p, index);
    if (prevSrc !== null && cov.src === prevSrc) {
      for (let k = 0; k < FALLBACK_COVERS.length; k++) {
        const alt = FALLBACK_COVERS[(index + k + 1) % FALLBACK_COVERS.length]!;
        if (alt !== prevSrc) {
          cov = { src: alt, unoptimized: false };
          break;
        }
      }
    }
    out.push(cov);
    prevSrc = cov.src;
  });
  return out;
}

export function prayerMetaLine(p: PrayerLibraryItem, completed: boolean): string {
  if (completed) return "Completed";
  return `${formatDurationMins(p.duration)} · Audio`;
}

export function prayerHoverSummary(p: PrayerLibraryItem): string {
  const bits: string[] = [];
  const scripture = p.scripture?.trim();
  if (scripture) bits.push(scripture);
  const desc = p.description?.trim();
  if (desc) bits.push(desc);
  bits.push(
    `${formatDurationMins(p.duration)} guided audio—tap to play and listen with intention.`,
  );
  return bits.join(" ");
}
