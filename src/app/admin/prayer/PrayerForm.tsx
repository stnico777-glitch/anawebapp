"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Prayer {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  audioUrl: string;
  duration: number;
  coverImageUrl: string | null;
}

export default function PrayerForm({ prayer }: { prayer?: Prayer }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: prayer?.title ?? "",
    description: prayer?.description ?? "",
    scripture: prayer?.scripture ?? "",
    audioUrl: prayer?.audioUrl ?? "",
    duration: prayer?.duration ?? 180,
    coverImageUrl: prayer?.coverImageUrl ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = prayer ? `/api/admin/prayer/${prayer.id}` : "/api/admin/prayer";
      const method = prayer ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          description: form.description || undefined,
          scripture: form.scripture || undefined,
          coverImageUrl: form.coverImageUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!prayer || !confirm("Delete this prayer?")) return;
    const res = await fetch(`/api/admin/prayer/${prayer.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        {prayer ? "Edit" : "Add Prayer"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-stone-900"
          >
            <h2 className="text-lg font-semibold">
              {prayer ? "Edit Prayer" : "Add Prayer"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Scripture</label>
                <input
                  value={form.scripture}
                  onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Cover image URL</label>
                <input
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="/weekly-workouts.png or https://…"
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
                <p className="mt-1 text-xs text-stone-500">Library card art; leave empty for a default rotation.</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Audio URL *</label>
                <input
                  value={form.audioUrl}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  required
                  type="url"
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Duration (seconds) *</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: parseInt(e.target.value, 10) || 0 })
                  }
                  required
                  className="mt-1 w-full rounded border px-3 py-2 dark:bg-stone-800"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              {prayer && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
