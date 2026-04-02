"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      >
        {verse ? "Edit" : "Add verse"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-stone-900">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {verse ? "Edit daily verse" : "Add daily verse"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.verseDate}
                  onChange={(e) => setForm((f) => ({ ...f, verseDate: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Reference *
                </label>
                <input
                  type="text"
                  required
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Translation
                </label>
                <input
                  type="text"
                  value={form.translation}
                  onChange={(e) => setForm((f) => ({ ...f, translation: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Text *
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-sky-blue px-4 py-2 text-sm font-medium text-white hover:bg-sky-blue/90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-stone-300 px-4 py-2 text-sm dark:border-stone-600"
                >
                  Cancel
                </button>
                {verse && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400"
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
