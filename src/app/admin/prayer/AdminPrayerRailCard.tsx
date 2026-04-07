"use client";

import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import {
  GEAR_UP_IMAGE_SIZES,
  RAIL_CARD_INTERACTION,
  RAIL_CARD_WIDTH,
} from "@/components/LibraryBannerStrip";
import { DAY_CARD_IMAGE_HOVER } from "@/constants/dayCardVisual";
import {
  type PrayerLibraryItem,
  prayerHoverSummary,
  prayerMetaLine,
  CatalogCoverImage,
} from "@/lib/prayer-audio-display";
import PrayerForm from "./PrayerForm";

const editBtnClass =
  "rounded bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-black/80 [font-family:var(--font-body),sans-serif]";
const delBtnClass =
  "rounded bg-red-600/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-red-600 [font-family:var(--font-body),sans-serif]";

export default function AdminPrayerRailCard({
  prayer,
  cover,
  selected,
  onSelect,
}: {
  prayer: PrayerLibraryItem;
  cover: { src: string; unoptimized: boolean };
  selected: boolean;
  onSelect: () => void;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete “${prayer.title}”? This cannot be undone.`)) return;
    const res = await adminJson(`/api/admin/prayer/${prayer.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={`group flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col rounded-none text-left ${RAIL_CARD_INTERACTION}`}
      style={{ scrollSnapAlign: "start" }}
    >
      <div
        className={`relative aspect-[4/5] w-full overflow-hidden rounded-none bg-neutral-900 ${
          selected ? "ring-2 ring-inset ring-sky-blue/90" : ""
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          aria-label={`Select ${prayer.title} for preview`}
          aria-pressed={selected}
        >
          <CatalogCoverImage
            src={cover.src}
            unoptimized={cover.unoptimized}
            className={`${DAY_CARD_IMAGE_HOVER} object-cover object-center`}
            sizes={GEAR_UP_IMAGE_SIZES}
          />
        </button>
        <div
          className="pointer-events-none absolute left-2 bottom-2 z-[15] inline-flex max-h-[min(40vh,12rem)] max-w-[min(13.5rem,calc(100%-1rem))] min-h-0 flex-col gap-0 overflow-y-auto rounded-none border border-black/[0.08] bg-white/95 p-2.5 text-left opacity-0 shadow-sm transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none md:left-3 md:bottom-3 md:max-w-[min(13.5rem,calc(100%-1.5rem))]"
          aria-hidden
        >
          <p className="text-[11px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
            {prayer.title}
          </p>
          <p className="mt-1.5 line-clamp-6 text-xs leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
            {prayerHoverSummary(prayer)}
          </p>
        </div>
        <div className="absolute right-2 top-2 z-30 flex flex-wrap justify-end gap-1">
          <div className="pointer-events-auto">
            <PrayerForm
              prayer={prayer}
              triggerClassName={editBtnClass}
              triggerLabel="Edit"
            />
          </div>
          <button type="button" className={delBtnClass} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2 min-w-0 space-y-0.5">
        <p className="text-[13px] font-semibold leading-tight tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          {prayer.title}
        </p>
        <p className="text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
          {prayerMetaLine(prayer, false)}
        </p>
      </div>
    </div>
  );
}
