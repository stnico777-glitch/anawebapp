"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import type {
  MovementHeroCollectionItemDTO,
  MovementHeroTileDTO,
} from "@/lib/movement-layout-types";
import MovementHeroCollectionItemForm from "./MovementHeroCollectionItemForm";
import { unoptimizedRemoteImage } from "@/lib/remote-image";

const editBtnClass =
  "rounded bg-black/78 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-black/88 [font-family:var(--font-body),sans-serif]";
const delBtnClass =
  "rounded bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 [font-family:var(--font-body),sans-serif]";

/**
 * Admin render of a single day card inside the "Just Getting Started" collection grid.
 * Visually mirrors the member card (image + "Day N" badge + title) and overlays Edit/Delete
 * controls so admins see what the member sees while still having CRUD affordances.
 */
export default function AdminMovementHeroTileCard({
  tile,
  item,
  onPreviewPlay,
  imagePriority = false,
}: {
  tile: MovementHeroTileDTO;
  item: MovementHeroCollectionItemDTO;
  onPreviewPlay?: (item: MovementHeroCollectionItemDTO) => void;
  imagePriority?: boolean;
}) {
  const router = useRouter();
  const unoptimized = unoptimizedRemoteImage(item.imageUrl);
  const playable = !!item.videoUrl?.trim();

  async function handleDelete() {
    if (!confirm(`Delete Day ${item.dayIndex} (“${item.title}”)?`)) return;
    const res = await adminJson(
      `/api/admin/movement-hero-tiles/${tile.id}/items/${item.id}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
      <button
        type="button"
        onClick={() => onPreviewPlay?.(item)}
        disabled={!playable}
        aria-label={`Preview Day ${item.dayIndex} — ${item.title}`}
        className="group absolute inset-0 z-0 block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-blue disabled:cursor-not-allowed"
      >
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          priority={imagePriority}
          unoptimized={unoptimized}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 from-[22%] via-black/10 to-transparent"
          aria-hidden
        />
        {/* Hover tint matches the member card so CMS previews feel identical to the live UI. */}
        <div
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/15 motion-reduce:transition-none"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <p className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-background md:text-base [font-family:var(--font-headline),sans-serif]">
            {item.title}
          </p>
          {!playable ? (
            <p className="mt-1 text-[11px] italic text-background/80 [font-family:var(--font-body),sans-serif]">
              Video URL missing
            </p>
          ) : null}
        </div>
      </button>
      <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-sm bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
        Day {item.dayIndex}
      </span>
      <div className="pointer-events-none absolute left-2 top-2 z-30 flex gap-1">
        <div className="pointer-events-auto">
          <MovementHeroCollectionItemForm
            heroTileId={tile.id}
            item={item}
            triggerClassName={editBtnClass}
            triggerLabel="Edit"
          />
        </div>
        <button
          type="button"
          className={`pointer-events-auto ${delBtnClass}`}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
