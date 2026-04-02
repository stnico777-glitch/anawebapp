"use client";

import { useMemo, useState } from "react";
import { slugToLabel } from "@/constants/prayerJournalNav";
import {
  parseArr,
  primaryCategorySlug,
  tagsWithoutPrimary,
  normalizeTagSlug,
} from "./journalingUtils";

export interface PrayerEntry {
  id: string;
  title: string | null;
  content: string;
  tags: string;
  status: string;
  answeredAt: string | null;
  answerNote: string | null;
  photos: string;
  createdAt: string;
  updatedAt: string;
}

function buildTagsForSave(categorySlug: string, extraTagsCsv: string): string[] {
  const extra = extraTagsCsv
    .split(",")
    .map((t) => normalizeTagSlug(t))
    .filter((t): t is string => Boolean(t));
  const seen = new Set<string>();
  const out: string[] = [];
  const cat = normalizeTagSlug(categorySlug);
  if (cat) {
    seen.add(cat);
    out.push(cat);
  }
  for (const t of extra) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out.slice(0, 20);
}

export function PrayerJournalEditor({
  entry,
  categorySlugs,
  labelForSlug = slugToLabel,
  initialVerseRef,
  initialVerseText,
  onClose,
  onSaved,
  onDeleted,
  onCategoriesNeedReload,
}: {
  entry: PrayerEntry | null;
  categorySlugs: string[];
  /** Sidebar / user aliases; defaults to preset labels. */
  labelForSlug?: (slug: string) => string;
  initialVerseRef: string | null;
  initialVerseText: string | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  onCategoriesNeedReload: () => void;
}) {
  const initialTags = parseArr(entry?.tags ?? "[]");
  const initialPrimary = primaryCategorySlug(initialTags);
  const initialExtra = tagsWithoutPrimary(initialTags, initialPrimary).join(", ");

  const defaultContent =
    entry?.content ??
    (initialVerseRef && initialVerseText
      ? `Scripture: ${initialVerseRef}\n\n${initialVerseText}\n\nPray with me:`
      : "");

  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(defaultContent);
  const [categorySlug, setCategorySlug] = useState(initialPrimary ?? "");
  const [newCategoryDraft, setNewCategoryDraft] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [extraTagsStr, setExtraTagsStr] = useState(initialExtra);
  const [showMoreTags, setShowMoreTags] = useState(Boolean(initialExtra));
  const [photos, setPhotos] = useState<string[]>(parseArr(entry?.photos ?? "[]"));
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [markAnswered, setMarkAnswered] = useState(entry?.status === "ANSWERED");
  const [answerNote, setAnswerNote] = useState(entry?.answerNote ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [addReminder, setAddReminder] = useState(false);
  const [remLabel, setRemLabel] = useState("");
  const [remCadence, setRemCadence] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [remTime, setRemTime] = useState("09:00");
  const [remWeekDay, setRemWeekDay] = useState(String(new Date().getDay()));

  const tryUploadFile = async (file: File) => {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/prayer-journal/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Upload failed. Add a static URL or configure BLOB_READ_WRITE_TOKEN.");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    setPhotos((p) => (p.length >= 6 ? p : [...p, url]));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const tags = buildTagsForSave(categorySlug, extraTagsStr);
      const status = markAnswered
        ? "ANSWERED"
        : entry?.status === "PAUSED"
          ? "PAUSED"
          : "ACTIVE";

      if (entry) {
        const res = await fetch(`/api/prayer-journal/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim() || null,
            content: content.trim(),
            tags,
            photos,
            status,
            answerNote: markAnswered ? (answerNote.trim() || null) : null,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        const updated = (await res.json()) as PrayerEntry;

        if (addReminder && remLabel.trim()) {
          await fetch("/api/prayer-reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: remLabel.trim(),
              cadence: remCadence,
              timeLocal: remTime,
              weekDay: remCadence === "WEEKLY" ? parseInt(remWeekDay, 10) : null,
              prayerJournalEntryId: updated.id,
            }),
          });
        }
      } else {
        const res = await fetch("/api/prayer-journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim() || null,
            content: content.trim(),
            tags,
            photos,
            status,
            answerNote: markAnswered ? (answerNote.trim() || null) : null,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        const created = (await res.json()) as PrayerEntry;

        if (addReminder && remLabel.trim()) {
          await fetch("/api/prayer-reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: remLabel.trim(),
              cadence: remCadence,
              timeLocal: remTime,
              weekDay: remCadence === "WEEKLY" ? parseInt(remWeekDay, 10) : null,
              prayerJournalEntryId: created.id,
            }),
          });
        }
      }

      onCategoriesNeedReload();
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    if (!confirm("Delete this prayer entry?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/prayer-journal/${entry.id}`, { method: "DELETE" });
      onCategoriesNeedReload();
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  function applyNewCategory() {
    const s = normalizeTagSlug(newCategoryDraft);
    if (!s) {
      alert("Use letters, numbers, and hyphens only (e.g. missions-team).");
      return;
    }
    setCategorySlug(s);
    setNewCategoryDraft("");
    setShowNewCategory(false);
  }

  const selectSlugs = useMemo(() => {
    const set = new Set(categorySlugs);
    if (categorySlug && !set.has(categorySlug)) {
      return [...categorySlugs, categorySlug].sort((a, b) =>
        labelForSlug(a).localeCompare(labelForSlug(b))
      );
    }
    return categorySlugs;
  }, [categorySlugs, categorySlug, labelForSlug]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-stone-200 bg-white shadow-xl sm:max-h-[min(90dvh,880px)] sm:rounded-2xl dark:border-stone-700 dark:bg-stone-900">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[4rem] text-left text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Cancel
          </button>
          <h2 className="text-center text-sm font-semibold text-stone-900 dark:text-stone-100">
            {entry ? "Edit prayer" : "New prayer"}
          </h2>
          <button
            type="submit"
            form="prayer-journal-editor-form"
            disabled={saving || deleting}
            className="min-w-[4rem] text-right text-sm font-semibold text-sky-blue hover:text-sky-blue/90 disabled:opacity-50 dark:text-sky-blue"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </header>

        <form id="prayer-journal-editor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">Title (optional)</label>
              <input
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">Prayer *</label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(ev) => setContent(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">Category</label>
              <select
                value={categorySlug}
                onChange={(ev) => setCategorySlug(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              >
                <option value="">None</option>
                {selectSlugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {labelForSlug(slug)}
                  </option>
                ))}
              </select>
              {!showNewCategory ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-sky-blue hover:underline"
                  onClick={() => setShowNewCategory(true)}
                >
                  + Add category
                </button>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={newCategoryDraft}
                    onChange={(ev) => setNewCategoryDraft(ev.target.value)}
                    placeholder="e.g. missions-team"
                    className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={applyNewCategory}
                    className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white dark:bg-stone-100 dark:text-stone-900"
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryDraft("");
                    }}
                    className="rounded-lg border border-stone-300 px-3 py-2 text-xs dark:border-stone-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowMoreTags((v) => !v)}
                className="text-xs font-medium text-stone-600 underline-offset-2 hover:underline dark:text-stone-400"
              >
                {showMoreTags ? "Hide extra tags" : "More tags (optional)"}
              </button>
              {showMoreTags ? (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                    Extra tags (comma-separated)
                  </label>
                  <input
                    value={extraTagsStr}
                    onChange={(ev) => setExtraTagsStr(ev.target.value)}
                    placeholder="healing, gratitude"
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              ) : null}
            </div>

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
                  onChange={(ev) => {
                    const f = ev.target.files?.[0];
                    if (f) void tryUploadFile(f);
                    ev.target.value = "";
                  }}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={photoUrlInput}
                  onChange={(ev) => setPhotoUrlInput(ev.target.value)}
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

            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={markAnswered}
                onChange={(ev) => setMarkAnswered(ev.target.checked)}
              />
              Mark as answered
            </label>
            {markAnswered ? (
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                  Reflection (optional)
                </label>
                <textarea
                  value={answerNote}
                  onChange={(ev) => setAnswerNote(ev.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            ) : null}

            <div className="rounded-lg border border-dashed border-stone-300 p-3 dark:border-stone-600">
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={addReminder}
                  onChange={(ev) => setAddReminder(ev.target.checked)}
                />
                Set a reminder (after saving)
              </label>
              {addReminder ? (
                <div className="mt-3 space-y-2">
                  <input
                    required={addReminder}
                    value={remLabel}
                    onChange={(ev) => setRemLabel(ev.target.value)}
                    placeholder="e.g. Pray for Mom"
                    className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={remCadence}
                      onChange={(ev) => setRemCadence(ev.target.value as "DAILY" | "WEEKLY")}
                      className="rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                    <input
                      type="time"
                      value={remTime}
                      onChange={(ev) => setRemTime(ev.target.value)}
                      className="rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                    />
                  </div>
                  {remCadence === "WEEKLY" ? (
                    <select
                      value={remWeekDay}
                      onChange={(ev) => setRemWeekDay(ev.target.value)}
                      className="w-full rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {entry ? (
            <div className="mt-8 border-t border-stone-200 pt-6 dark:border-stone-700">
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {deleting ? "Deleting…" : "Delete prayer"}
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
