"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";
import type { AudioEssentialTileDTO } from "@/lib/audio-layout-types";

const inputClass =
  "mt-1 block w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function AudioEssentialForm({
  tile,
  triggerClassName,
  triggerLabel,
}: {
  tile?: AudioEssentialTileDTO;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: tile?.title ?? "",
    subtitle: tile?.subtitle ?? "",
    imageUrl: tile?.imageUrl ?? "",
    linkHref: tile?.linkHref ?? "/prayer#prayer-library",
    sortOrder: tile?.sortOrder ?? 0,
  });

  useEffect(() => {
    if (!tile) return;
    setForm({
      title: tile.title,
      subtitle: tile.subtitle,
      imageUrl: tile.imageUrl,
      linkHref: tile.linkHref,
      sortOrder: tile.sortOrder,
    });
  }, [tile?.id, tile?.title, tile?.subtitle, tile?.imageUrl, tile?.linkHref, tile?.sortOrder]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirmAdminSave(
        tile ? "Save changes to this essentials tile?" : "Create this essentials tile?",
      )
    )
      return;
    setSaving(true);
    try {
      const url = tile ? `/api/admin/audio-essentials/${tile.id}` : "/api/admin/audio-essentials";
      const method = tile ? "PATCH" : "POST";
      const res = await adminJson(url, {
        method,
        body: JSON.stringify({
          ...form,
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
    if (!tile || !confirm("Delete this essentials tile?")) return;
    const res = await adminJson(`/api/admin/audio-essentials/${tile.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    setOpen(false);
    router.refresh();
  }

  const defaultTrigger = tile
    ? "rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]"
    : "rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTrigger}
      >
        {triggerLabel ?? (tile ? "Edit" : "Add essentials tile")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
          >
            <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {tile ? "Edit essentials tile" : "Add essentials tile"}
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
                <label className={labelClass}>Subtitle *</label>
                <input
                  className={inputClass}
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="stillness · presence · breath"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Image URL *</label>
                <input
                  className={inputClass}
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Link (href)</label>
                <input
                  className={inputClass}
                  value={form.linkHref}
                  onChange={(e) => setForm((f) => ({ ...f, linkHref: e.target.value }))}
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
              {tile && (
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
