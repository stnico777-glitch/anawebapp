"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmAdminSave } from "@/lib/admin-confirm-save";

interface DailyVerseRow {
  id: string;
  verseDate: string;
  reference: string;
  text: string;
  translation: string | null;
}

function ymdFromIso(iso: string) {
  return iso.slice(0, 10);
}

const inputClass =
  "mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function DailyVerseForm({ verse }: { verse?: DailyVerseRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    verseDate: verse ? ymdFromIso(verse.verseDate) : new Date().toISOString().slice(0, 10),
    reference: verse?.reference ?? "",
    text: verse?.text ?? "",
    translation: verse?.translation ?? "NIV",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirmAdminSave(
        verse ? "Save changes to this daily verse?" : "Create this daily verse?",
      )
    )
      return;
    setSaving(true);
    try {
      const url = verse ? `/api/admin/daily-verse/${verse.id}` : "/api/admin/daily-verse";
      const method = verse ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseDate: form.verseDate,
          reference: form.reference,
          text: form.text,
          translation: form.translation.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed");
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!verse || !confirm("Delete this verse day?")) return;
    const res = await fetch(`/api/admin/daily-verse/${verse.id}`, { method: "DELETE" });
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          verse
            ? "rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]"
            : "rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]"
        }
      >
        {verse ? "Edit" : "Add verse"}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]">
            <h3 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {verse ? "Edit daily verse" : "Add daily verse"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className={labelClass}>Date *</label>
                <input
                  type="date"
                  required
                  value={form.verseDate}
                  onChange={(e) => setForm((f) => ({ ...f, verseDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Reference *</label>
                <input
                  type="text"
                  required
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Translation</label>
                <input
                  type="text"
                  value={form.translation}
                  onChange={(e) => setForm((f) => ({ ...f, translation: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Text *</label>
                <textarea
                  required
                  rows={6}
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
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
                {verse && (
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
        </div>
      )}
    </div>
  );
}
