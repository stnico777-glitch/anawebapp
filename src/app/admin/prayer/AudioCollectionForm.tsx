"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminModalPortal from "@/components/AdminModalPortal";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";
import {
  AUDIO_COLLECTION_CATEGORIES,
  AUDIO_COLLECTION_CATEGORY_LABELS,
  type AudioCollectionCardDTO,
  type AudioCollectionCategory,
} from "@/lib/audio-layout-types";

const inputClass =
  "mt-1 block w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function AudioCollectionForm({
  card,
  defaultCategory,
  triggerClassName,
  triggerLabel,
}: {
  card?: AudioCollectionCardDTO;
  /** When creating a card from the admin "Add card" button on a specific row, pre-select that
   *  row's category. Ignored when editing an existing card (card.category wins). */
  defaultCategory?: AudioCollectionCategory;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: card?.category ?? defaultCategory ?? "AFFIRMATIONS",
    title: card?.title ?? "",
    metaLine: card?.metaLine ?? "",
    imageUrl: card?.imageUrl ?? "",
    summary: card?.summary ?? "",
    audioUrl: card?.audioUrl ?? "",
    linkHref: card?.linkHref ?? "/prayer#prayer-library",
    sortOrder: card?.sortOrder ?? 0,
  });

  useEffect(() => {
    if (!card) return;
    setForm({
      category: card.category,
      title: card.title,
      metaLine: card.metaLine,
      imageUrl: card.imageUrl,
      summary: card.summary,
      audioUrl: card.audioUrl,
      linkHref: card.linkHref,
      sortOrder: card.sortOrder,
    });
  }, [
    card?.id,
    card?.category,
    card?.title,
    card?.metaLine,
    card?.imageUrl,
    card?.summary,
    card?.audioUrl,
    card?.linkHref,
    card?.sortOrder,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirmAdminSave(
        card ? "Save changes to this audio card?" : "Create this audio card?",
      )
    )
      return;
    setSaving(true);
    try {
      const url = card ? `/api/admin/audio-collections/${card.id}` : "/api/admin/audio-collections";
      const method = card ? "PATCH" : "POST";
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
    if (!card || !confirm("Delete this audio card?")) return;
    const res = await adminJson(`/api/admin/audio-collections/${card.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    setOpen(false);
    router.refresh();
  }

  const defaultTrigger = card
    ? "rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]"
    : "rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTrigger}
      >
        {triggerLabel ?? (card ? "Edit" : "Add card")}
      </button>
      {open && (
        <AdminModalPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
            <form
              onSubmit={handleSubmit}
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
            >
            <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {card ? "Edit audio card" : "Add audio card"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className={labelClass}>Row *</label>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as AudioCollectionCategory,
                    }))
                  }
                  required
                >
                  {AUDIO_COLLECTION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {AUDIO_COLLECTION_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
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
                <label className={labelClass}>Audio URL</label>
                <input
                  className={inputClass}
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={form.audioUrl}
                  onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
                  placeholder="https://…/audio.mp3"
                />
                <p className="mt-1 text-xs text-gray">
                  When set, clicking the card plays this audio in the bottom player. Leave blank to navigate to the link below instead.
                </p>
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
                <label className={labelClass}>Meta line</label>
                <input
                  className={inputClass}
                  value={form.metaLine}
                  onChange={(e) => setForm((f) => ({ ...f, metaLine: e.target.value }))}
                  placeholder="e.g. Affirmation · 1 min"
                />
              </div>
              <div>
                <label className={labelClass}>Hover summary</label>
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="Optional — shown on hover"
                />
              </div>
              <div>
                <label className={labelClass}>Link (fallback when no audio URL)</label>
                <input
                  className={inputClass}
                  value={form.linkHref}
                  onChange={(e) => setForm((f) => ({ ...f, linkHref: e.target.value }))}
                  placeholder="/prayer#prayer-library"
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
              {card && (
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
