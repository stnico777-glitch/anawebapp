"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DAY_CARD_IMAGE_HOVER } from "@/constants/dayCardVisual";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import type { MusicSpotlightAlbumDTO } from "@/lib/audio-layout-types";
import MusicSpotlightAlbumForm from "./MusicSpotlightAlbumForm";

const ALBUM_CARD_WIDTH_CLASS =
  "w-[min(44vw,188px)] sm:w-[188px] md:w-[204px] lg:w-[216px]";

const ALBUM_IMAGE_SIZES = "(max-width: 640px) 44vw, (max-width: 1024px) 188px, 216px";

const SHELL_CLASS = `flex ${ALBUM_CARD_WIDTH_CLASS} shrink-0 flex-col rounded-sm text-left ring-1 ring-sky-blue/35 transition-all duration-300 ease-out will-change-transform hover:z-[2] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`;

const editBtnClass =
  "rounded bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-black/80 [font-family:var(--font-body),sans-serif]";
const delBtnClass =
  "rounded bg-red-600/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-red-600 [font-family:var(--font-body),sans-serif]";

export default function AdminMusicSpotlightAlbumTile({ album }: { album: MusicSpotlightAlbumDTO }) {
  const router = useRouter();
  const unoptimized =
    album.coverUrl.startsWith("http://") || album.coverUrl.startsWith("https://");
  const url = album.listenUrl?.trim();

  async function handleDelete() {
    if (!confirm(`Delete “${album.title}”?`)) return;
    const res = await adminJson(`/api/admin/music-spotlight/${album.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  const stack = (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-neutral-900">
        <Image
          src={album.coverUrl}
          alt={`${album.title} — ${album.artist}`}
          fill
          sizes={ALBUM_IMAGE_SIZES}
          className={`${DAY_CARD_IMAGE_HOVER} rounded-sm`}
          unoptimized={unoptimized}
        />
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
        {album.title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs font-normal leading-snug tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
        {album.artist}
      </p>
    </>
  );

  return (
    <div className={`relative ${SHELL_CLASS}`}>
      {url ? (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
        >
          {stack}
        </Link>
      ) : (
        stack
      )}
      <div className="pointer-events-none absolute right-1 top-1 z-30 flex flex-wrap justify-end gap-1">
        <div className="pointer-events-auto">
          <MusicSpotlightAlbumForm
            album={album}
            triggerClassName={editBtnClass}
            triggerLabel="Edit"
          />
        </div>
        <button type="button" className={`pointer-events-auto ${delBtnClass}`} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
