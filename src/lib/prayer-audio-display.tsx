import Image from "next/image";
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

export function formatDurationMins(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}

export function coverForPrayer(
  p: PrayerLibraryItem,
  index: number
): { src: string; unoptimized: boolean } {
  if (p.coverImageUrl?.trim()) {
    const u = p.coverImageUrl.trim();
    const unoptimized = u.startsWith("http://") || u.startsWith("https://");
    return { src: u, unoptimized };
  }
  return { src: FALLBACK_COVERS[index % FALLBACK_COVERS.length], unoptimized: false };
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
        const alt = FALLBACK_COVERS[(index + k + 1) % FALLBACK_COVERS.length];
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

export function CatalogCoverImage({
  src,
  unoptimized,
  className,
  sizes,
  priority,
}: {
  src: string;
  unoptimized: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (unoptimized) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote library art
      <img
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
