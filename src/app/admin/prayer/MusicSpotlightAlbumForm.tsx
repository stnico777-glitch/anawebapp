"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import type { MusicSpotlightAlbumDTO } from "@/lib/audio-layout-types";

const inputClass =
  "mt-1 block w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function MusicSpotlightAlbumForm({
  album,
  triggerClassName,
  triggerLabel,
}: {
  album?: MusicSpotlightAlbumDTO;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: album?.title ?? "",
    artist: album?.artist ?? "",
    coverUrl: album?.coverUrl ?? "",
    listenUrl: album?.listenUrl ?? "",
    sortOrder: album?.sortOrder ?? 0,
  });

  useEffect(() => {
    if (!album) return;
    setForm({
      title: album.title,
      artist: album.artist,
      coverUrl: album.coverUrl,
      listenUrl: album.listenUrl ?? "",
      sortOrder: album.sortOrder,
    });
  }, [album?.id, album?.title, album?.artist, album?.coverUrl, album?.listenUrl, album?.sortOrder]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = album ? `/api/admin/music-spotlight/${album.id}` : "/api/admin/music-spotlight";
      const method = album ? "PATCH" : "POST";
      const res = await adminJson(url, {
        method,
        body: JSON.stringify({
          title: form.title,
          artist: form.artist,
          coverUrl: form.coverUrl,
          listenUrl: form.listenUrl.trim() || null,
          sortOrder: parseInt(String(form.sortOrder), 10) || 0,
        }),
      });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!album || !confirm("Delete this spotlight album?")) return;
    const res = await adminJson(`/api/admin/music-spotlight/${album.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    setOpen(false);
    router.refresh();
  }

  const defaultTrigger = album
    ? "rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]"
    : "rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTrigger}
      >
        {triggerLabel ?? (album ? "Edit" : "Add spotlight album")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
          >
            <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {album ? "Edit spotlight album" : "Add spotlight album"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Artist *</label>
                <input
                  className={inputClass}
                  value={form.artist}
                  onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Cover image URL *</label>
                <input
                  className={inputClass}
                  type="url"
                  value={form.coverUrl}
                  onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Listen URL (optional)</label>
                <input
                  className={inputClass}
                  type="url"
                  value={form.listenUrl}
                  onChange={(e) => setForm((f) => ({ ...f, listenUrl: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-gray hover:bg-sunset-peach/40"
              >
                Cancel
              </button>
              {album && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
