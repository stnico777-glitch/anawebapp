"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import type { AudioCollectionCardDTO } from "@/lib/audio-layout-types";
import AudioCollectionForm from "./AudioCollectionForm";

const editBtnClass =
  "rounded bg-black/78 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-black/88 [font-family:var(--font-body),sans-serif]";
const delBtnClass =
  "rounded bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 [font-family:var(--font-body),sans-serif]";

/** Admin equivalent of the member-facing Scripture Reading grid tile. Same banner aspect ratio
 *  (`aspect-[5/2]`), same image styling, same cream title overlay — plus Edit/Delete buttons
 *  in the top-right so editors can manage the row without leaving the page. Designed to live
 *  inside `<CategoryGridSection>`'s 2x2 grid alongside member-style tiles. */
export default function AdminAudioGridTile({ card }: { card: AudioCollectionCardDTO }) {
  const router = useRouter();
  const unoptimized =
    card.imageUrl.startsWith("http://") || card.imageUrl.startsWith("https://");

  async function handleDelete() {
    if (!confirm(`Delete “${card.title}”?`)) return;
    const res = await adminJson(`/api/admin/audio-collections/${card.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  return (
    <div className="group relative aspect-[5/2] w-full overflow-hidden bg-sand">
      <Image
        src={card.imageUrl}
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        unoptimized={unoptimized}
        loading="eager"
      />
      <div className="absolute right-2 top-2 z-30 flex flex-wrap justify-end gap-1">
        <AudioCollectionForm
          card={card}
          triggerClassName={editBtnClass}
          triggerLabel="Edit"
        />
        <button type="button" className={delBtnClass} onClick={handleDelete}>
          Delete
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
        <p className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-background md:text-base [font-family:var(--font-headline),sans-serif] [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
          {card.title}
        </p>
      </div>
    </div>
  );
}
