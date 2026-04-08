"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import type { AudioEssentialTileDTO } from "@/lib/audio-layout-types";
import AudioEssentialForm from "./AudioEssentialForm";

const editBtnClass =
  "rounded bg-black/78 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-black/88 [font-family:var(--font-body),sans-serif]";
const delBtnClass =
  "rounded bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 [font-family:var(--font-body),sans-serif]";

export default function AdminEssentialTileCard({ tile }: { tile: AudioEssentialTileDTO }) {
  const router = useRouter();
  const unoptimized =
    tile.imageUrl.startsWith("http://") || tile.imageUrl.startsWith("https://");

  async function handleDelete() {
    if (!confirm(`Delete essentials tile “${tile.title}”?`)) return;
    const res = await adminJson(`/api/admin/audio-essentials/${tile.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2]">
      <Link
        href={tile.linkHref}
        className="group absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface"
      >
        <Image
          src={tile.imageUrl}
          alt={tile.title}
          fill
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 100vw, 50vw"
          unoptimized={unoptimized}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
          <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
            {tile.title}
          </p>
          <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
            {tile.subtitle}
          </p>
          <span className="pointer-events-none essentials-explore-glass mt-4">Explore</span>
        </div>
      </Link>
      <div className="pointer-events-none absolute right-2 top-2 z-30 flex gap-1">
        <div className="pointer-events-auto">
          <AudioEssentialForm tile={tile} triggerClassName={editBtnClass} triggerLabel="Edit" />
        </div>
        <button type="button" className={`pointer-events-auto ${delBtnClass}`} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
