"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GEAR_UP_IMAGE_SIZES,
  RAIL_CARD_INTERACTION,
  RAIL_CARD_WIDTH,
} from "@/components/LibraryBannerStrip";
import { DAY_CARD_IMAGE_HOVER } from "@/constants/dayCardVisual";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import type { MovementQuickieCardDTO } from "@/lib/movement-layout-types";
import MovementQuickieCardForm from "./MovementQuickieCardForm";
import { unoptimizedRemoteImage } from "@/lib/remote-image";

const editBtnClass =
  "rounded bg-black/78 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-black/88 [font-family:var(--font-body),sans-serif]";
const delBtnClass =
  "rounded bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 [font-family:var(--font-body),sans-serif]";

export default function AdminMovementQuickieRailCard({
  card,
  onPreviewPlay,
}: {
  card: MovementQuickieCardDTO;
  onPreviewPlay?: (card: MovementQuickieCardDTO) => void;
}) {
  const router = useRouter();
  const unoptimized = unoptimizedRemoteImage(card.imageUrl);

  async function handleDelete() {
    if (!confirm(`Delete “${card.title}”?`)) return;
    const res = await adminJson(`/api/admin/movement-quickie-cards/${card.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={`group flex ${RAIL_CARD_WIDTH} shrink-0 snap-start flex-col rounded-none ${RAIL_CARD_INTERACTION}`}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-none bg-neutral-900">
        <button
          type="button"
          onClick={() => onPreviewPlay?.(card)}
          className="absolute inset-0 z-0 block w-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          aria-label={`Preview video: ${card.title}`}
        >
          <Image
            src={card.imageUrl}
            alt=""
            fill
            sizes={GEAR_UP_IMAGE_SIZES}
            className={DAY_CARD_IMAGE_HOVER}
            unoptimized={unoptimized}
          />
        </button>
        <div
          className="pointer-events-none absolute left-2 bottom-2 z-[15] inline-flex max-h-[min(40vh,12rem)] max-w-[min(13.5rem,calc(100%-1rem))] min-h-0 flex-col gap-0 overflow-y-auto rounded-none border border-black/[0.08] bg-white/95 p-2.5 text-left opacity-0 shadow-sm transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none md:left-3 md:bottom-3 md:max-w-[min(13.5rem,calc(100%-1.5rem))]"
          aria-hidden
        >
          <p className="text-[11px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
            {card.title}
          </p>
          <p className="mt-1.5 line-clamp-6 text-xs leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
            {card.summary}
          </p>
        </div>
        <div className="absolute right-2 top-2 z-30 flex flex-wrap justify-end gap-1">
          <div className="pointer-events-auto">
            <MovementQuickieCardForm card={card} triggerClassName={editBtnClass} triggerLabel="Edit" />
          </div>
          <button type="button" className={`pointer-events-auto ${delBtnClass}`} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2 min-w-0 space-y-0.5">
        <p className="text-[13px] font-semibold leading-tight tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          {card.title}
        </p>
        <p className="text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
          {card.metaLine}
        </p>
      </div>
    </div>
  );
}
