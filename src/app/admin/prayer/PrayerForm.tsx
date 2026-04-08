"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";

interface Prayer {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  audioUrl: string;
  duration: number;
  coverImageUrl: string | null;
}

const inputClass =
  "mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function PrayerForm({
  prayer,
  triggerClassName,
  triggerLabel,
}: {
  prayer?: Prayer;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
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

  useEffect(() => {
    if (!prayer) return;
    setForm({
      title: prayer.title,
      description: prayer.description ?? "",
      scripture: prayer.scripture ?? "",
      audioUrl: prayer.audioUrl,
      duration: prayer.duration,
      coverImageUrl: prayer.coverImageUrl ?? "",
    });
  }, [
    prayer?.id,
    prayer?.title,
    prayer?.description,
    prayer?.scripture,
    prayer?.audioUrl,
    prayer?.duration,
    prayer?.coverImageUrl,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirmAdminSave(
        prayer ? "Save changes to this prayer?" : "Create this prayer?",
      )
    )
      return;
    setSaving(true);
    try {
      const url = prayer ? `/api/admin/prayer/${prayer.id}` : "/api/admin/prayer";
      const method = prayer ? "PATCH" : "POST";
      const res = await adminJson(url, {
        method,
        body: JSON.stringify({
          ...form,
          description: form.description || undefined,
          scripture: form.scripture || undefined,
          coverImageUrl: form.coverImageUrl.trim() || null,
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
    if (!prayer || !confirm("Delete this prayer?")) return;
    const res = await adminJson(`/api/admin/prayer/${prayer.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await readAdminError(res));
      return;
    }
    router.refresh();
  }

  const defaultTriggerClass = prayer
    ? "shrink-0 rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]"
    : "shrink-0 rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 [font-family:var(--font-body),sans-serif]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTriggerClass}
      >
        {triggerLabel ?? (prayer ? "Edit" : "Add audio")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
          >
            <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {prayer ? "Edit audio" : "Add audio"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Scripture</label>
                <input
                  value={form.scripture}
                  onChange={(e) => setForm({ ...form, scripture: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Cover image URL</label>
                <input
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="/weekly-workouts.png or https://…"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray">Library card art; leave empty for a default rotation.</p>
              </div>
              <div>
                <label className={labelClass}>Audio URL *</label>
                <input
                  value={form.audioUrl}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  required
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Duration (seconds) *</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: parseInt(e.target.value, 10) || 0 })
                  }
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-gray hover:bg-sunset-peach/40"
              >
                Cancel
              </button>
              {prayer && (
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
