"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";
import { TEAM_BROADCAST_TAG } from "@/constants/teamWelcomeJournal";

/** Matches {@link PrayerJournalEditor} field styling (member “New prayer” card). */
const labelClass = "block text-xs font-medium text-stone-600 dark:text-stone-400";
const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100";

function parseTags(raw: string): string[] {
  return raw
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

const FORM_ID = "admin-prayer-journal-broadcast-form";

export default function PrayerJournalBroadcastForm({ memberCount }: { memberCount: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "ANSWERED" | "PAUSED">("ACTIVE");
  const [answerNote, setAnswerNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/admin/prayer-journal/upload", { method: "POST", body: fd });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      const j: unknown = await res.json();
      const url =
        j && typeof j === "object" && "url" in j && typeof (j as { url: unknown }).url === "string"
          ? (j as { url: string }).url
          : null;
      if (!url) {
        alert("Upload failed: missing URL");
        return;
      }
      setPhotos((prev) => (prev.length >= 6 ? prev : [...prev, url]));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      alert("Prayer text is required.");
      return;
    }
    if (
      !confirmAdminSave(
        `Add this prayer to every member’s journal? This affects ${memberCount} account${memberCount === 1 ? "" : "s"} and cannot be undone in bulk.`,
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const res = await adminJson("/api/admin/prayer-journal/broadcast", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim() || null,
          content: trimmed,
          tags: parseTags(tagsRaw),
          status,
          photos: photos.length ? photos : undefined,
          answerNote: status === "ANSWERED" ? answerNote.trim() || null : null,
        }),
      });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      const j: unknown = await res.json();
      const created =
        j && typeof j === "object" && "created" in j && typeof (j as { created: unknown }).created === "number"
          ? (j as { created: number }).created
          : 0;
      alert(`Created ${created} journal entr${created === 1 ? "y" : "ies"}.`);
      setTitle("");
      setContent("");
      setTagsRaw("");
      setStatus("ACTIVE");
      setAnswerNote("");
      setPhotos([]);
      setPhotoUrlInput("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="flex max-h-[min(92dvh,900px)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <div className="min-w-[4rem]" aria-hidden />
          <h2 className="text-center text-sm font-semibold text-stone-900 dark:text-stone-100">
            Broadcast prayer
          </h2>
          <button
            type="submit"
            form={FORM_ID}
            disabled={saving || memberCount === 0}
            className="min-w-[4rem] text-right text-sm font-semibold text-sky-blue hover:text-sky-blue/90 disabled:opacity-50 dark:text-sky-blue"
          >
            {saving ? "Sending…" : "Send"}
          </button>
        </header>

        <form id={FORM_ID} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Creates one new entry in <strong className="font-medium text-stone-800 dark:text-stone-200">every</strong>{" "}
              member’s journal. Tagged <strong className="font-medium text-stone-800 dark:text-stone-200">{TEAM_BROADCAST_TAG}</strong> plus any extra tags below.
              {memberCount > 0 ? (
                <>
                  {" "}
                  <span className="tabular-nums">({memberCount} member{memberCount === 1 ? "" : "s"}.)</span>
                </>
              ) : (
                <> No member profiles in the database.</>
              )}
            </p>

            <div>
              <label htmlFor="pj-broadcast-title" className={labelClass}>
                Title (optional)
              </label>
              <input
                id="pj-broadcast-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                maxLength={200}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="pj-broadcast-content" className={labelClass}>
                Prayer *
              </label>
              <textarea
                id="pj-broadcast-content"
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={fieldClass}
                maxLength={20_000}
              />
            </div>

            <div>
              <label htmlFor="pj-broadcast-tags" className={labelClass}>
                Extra tags (optional, comma-separated)
              </label>
              <input
                id="pj-broadcast-tags"
                type="text"
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                className={fieldClass}
                placeholder="e.g. easter, encouragement"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="pj-broadcast-status" className={labelClass}>
                Status
              </label>
              <select
                id="pj-broadcast-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={fieldClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ANSWERED">Answered</option>
              </select>
            </div>

            {status === "ANSWERED" ? (
              <div>
                <label htmlFor="pj-broadcast-answer" className={labelClass}>
                  Reflection (optional)
                </label>
                <textarea
                  id="pj-broadcast-answer"
                  value={answerNote}
                  onChange={(e) => setAnswerNote(e.target.value)}
                  rows={3}
                  className={fieldClass}
                  maxLength={5000}
                />
              </div>
            ) : null}

            <div className="rounded-lg border border-stone-200 p-3 dark:border-stone-600">
              <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Photos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((src) => (
                  <div key={src} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-14 w-14 rounded object-cover" />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 rounded-full bg-stone-800 px-1 text-xs text-white"
                      onClick={() => setPhotos((p) => p.filter((x) => x !== src))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  disabled={uploading || photos.length >= 6}
                  onChange={onPickImage}
                />
                {uploading ? <span className="text-xs text-stone-500">Uploading…</span> : null}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="Or paste image URL"
                  className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
                <button
                  type="button"
                  className="rounded border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                  onClick={() => {
                    const u = photoUrlInput.trim();
                    if (!u || photos.length >= 6) return;
                    setPhotos((p) => [...p, u]);
                    setPhotoUrlInput("");
                  }}
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
