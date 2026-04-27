"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminModalPortal from "@/components/AdminModalPortal";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";
import type { MovementHeroCollectionItemDTO } from "@/lib/movement-layout-types";
import { MOVEMENT_SAMPLE_VIDEO_URL } from "@/lib/movement-layout-defaults";

const inputClass =
  "mt-1 block w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

/**
 * Create / edit a collection item (e.g. "Day 3 · Lower body foundations") that belongs to a
 * hero tile's collection. Mirrors `MovementHeroTileForm` conventions so the CMS feels uniform.
 */
export default function MovementHeroCollectionItemForm({
  heroTileId,
  item,
  nextDayIndex,
  triggerClassName,
  triggerLabel,
}: {
  heroTileId: string;
  item?: MovementHeroCollectionItemDTO;
  /** When adding, defaults the "Day" field to the next empty slot in the collection. */
  nextDayIndex?: number;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dayIndex: item?.dayIndex ?? nextDayIndex ?? 1,
    title: item?.title ?? "",
    imageUrl: item?.imageUrl ?? "",
    videoUrl: item?.videoUrl ?? "",
    sortOrder: item?.sortOrder ?? (item?.dayIndex ?? nextDayIndex ?? 1) - 1,
  });

  useEffect(() => {
    if (!item) return;
    setForm({
      dayIndex: item.dayIndex,
      title: item.title,
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl,
      sortOrder: item.sortOrder,
    });
  }, [item?.id, item?.dayIndex, item?.title, item?.imageUrl, item?.videoUrl, item?.sortOrder]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirmAdminSave(
        item ? "Save changes to this collection item?" : "Add this collection item?",
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const url = item
        ? `/api/admin/movement-hero-tiles/${heroTileId}/items/${item.id}`
        : `/api/admin/movement-hero-tiles/${heroTileId}/items`;
      const method = item ? "PATCH" : "POST";
      const res = await adminJson(url, {
        method,
        body: JSON.stringify({
          dayIndex: parseInt(String(form.dayIndex), 10) || 1,
          title: form.title,
          imageUrl: form.imageUrl,
          videoUrl: form.videoUrl,
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
    if (!item || !confirm(`Delete Day ${item.dayIndex}?`)) return;
    const res = await adminJson(
      `/api/admin/movement-hero-tiles/${heroTileId}/items/${item.id}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    setOpen(false);
    router.refresh();
  }

  const defaultTrigger = item
    ? "rounded bg-black/78 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-black/88 [font-family:var(--font-body),sans-serif]"
    : "inline-flex items-center gap-1 rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTrigger}
      >
        {triggerLabel ?? (item ? "Edit" : "+ Add day")}
      </button>
      {open && (
        <AdminModalPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
            >
              <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                {item ? `Edit Day ${item.dayIndex}` : "Add collection day"}
              </h2>
              <p className="mt-1 text-xs text-gray">
                One entry per day of the series (e.g. Day 1..Day 6). Members see these cards on
                the collection page after tapping <em>Explore</em>.
              </p>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Day number *</label>
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      value={form.dayIndex}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          dayIndex: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sort order</label>
                    <input
                      className={inputClass}
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sortOrder: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Title *</label>
                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Day 3 · Core basics"
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
                  <label className={labelClass}>Video URL</label>
                  <input
                    className={inputClass}
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    placeholder={MOVEMENT_SAMPLE_VIDEO_URL}
                    value={form.videoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
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
                {item && (
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
        </AdminModalPortal>
      )}
    </>
  );
}
