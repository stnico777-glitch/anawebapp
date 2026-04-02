"use client";

import { useState } from "react";
import { STATUS_NAV, type JournalStatusFilterKey } from "@/constants/prayerJournalNav";
import { normalizeTagSlug } from "./journalingUtils";

type StatusFilter = JournalStatusFilterKey | "ALL";

export function PrayerJournalSidebar({
  statusFilter,
  tagFilter,
  categorySlugs,
  labelForSlug,
  onAddPinnedCategory,
  onHideCategory,
  onStatusChange,
  onTagChange,
  mobileOpen,
  onCloseMobile,
}: {
  statusFilter: StatusFilter;
  tagFilter: string | null;
  categorySlugs: string[];
  labelForSlug: (slug: string) => string;
  onAddPinnedCategory: (slug: string) => void;
  onHideCategory: (slug: string) => void;
  onStatusChange: (s: StatusFilter) => void;
  onTagChange: (tag: string | null) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const [editingCategories, setEditingCategories] = useState(false);
  const [addDraft, setAddDraft] = useState("");

  function tryAddCategory() {
    const slug = normalizeTagSlug(addDraft);
    if (!slug) {
      alert("Use letters, numbers, and hyphens (e.g. work or prayer-team).");
      return;
    }
    onAddPinnedCategory(slug);
    setAddDraft("");
  }

  const navBody = (
    <nav className="flex flex-col gap-6 text-sm" aria-label="Prayer journal filters">
      <div>
        <h3 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
          View by status
        </h3>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => {
                onStatusChange("ALL");
                onCloseMobile();
              }}
              className={`w-full rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-sky-blue text-white"
                  : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              }`}
            >
              All
            </button>
          </li>
          {STATUS_NAV.map(({ key, label }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => {
                  onStatusChange(key);
                  onCloseMobile();
                }}
                className={`w-full rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                  statusFilter === key
                    ? "bg-sky-blue text-white"
                    : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
            View by category
          </h3>
          <button
            type="button"
            aria-expanded={editingCategories}
            aria-controls="journal-category-list"
            onClick={() => {
              setEditingCategories((v) => {
                if (v) setAddDraft("");
                return !v;
              });
            }}
            className="shrink-0 rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-sky-blue hover:bg-sky-blue/10 dark:text-sky-blue dark:hover:bg-sky-blue/15"
          >
            {editingCategories ? "Done" : "Edit"}
          </button>
        </div>
        <ul id="journal-category-list" className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => {
                onTagChange(null);
                onCloseMobile();
              }}
              className={`w-full rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                tagFilter == null
                  ? "bg-sky-blue/15 text-sky-blue dark:bg-sky-blue/20"
                  : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              }`}
            >
              All categories
            </button>
          </li>
          {categorySlugs.map((slug) =>
            editingCategories ? (
              <li key={slug} className="flex items-stretch gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onTagChange(slug);
                    onCloseMobile();
                  }}
                  className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-left transition-colors ${
                    tagFilter === slug
                      ? "bg-sky-blue/15 font-medium text-sky-blue dark:bg-sky-blue/20"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                  }`}
                >
                  <span className="block truncate">{labelForSlug(slug)}</span>
                </button>
                <button
                  type="button"
                  className="flex w-8 shrink-0 items-center justify-center rounded-lg text-base leading-none text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                  aria-label={`Remove ${labelForSlug(slug)} from list`}
                  onClick={(e) => {
                    e.preventDefault();
                    onHideCategory(slug);
                  }}
                >
                  ×
                </button>
              </li>
            ) : (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => {
                    onTagChange(slug);
                    onCloseMobile();
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    tagFilter === slug
                      ? "bg-sky-blue/15 font-medium text-sky-blue dark:bg-sky-blue/20"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                  }`}
                >
                  {labelForSlug(slug)}
                </button>
              </li>
            ),
          )}
        </ul>

        {editingCategories ? (
          <>
            <div className="mt-4 border-t border-stone-200 pt-3 dark:border-stone-700">
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Add category
              </p>
              <div className="flex gap-1.5">
                <input
                  value={addDraft}
                  onChange={(e) => setAddDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      tryAddCategory();
                    }
                  }}
                  placeholder="Name (e.g. work)"
                  className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={tryAddCategory}
                  className="shrink-0 rounded-lg bg-sky-blue px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sky-blue/90"
                >
                  Add
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 border-r border-stone-200 pr-6 dark:border-stone-700 md:block">
        {navBody}
      </aside>

      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onCloseMobile}
          aria-label="Close menu"
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[min(88vw,300px)] flex-col border-r border-stone-200 bg-app-surface shadow-xl transition-transform dark:border-stone-700 dark:bg-stone-900 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Organize</span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              Done
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{navBody}</div>
        </div>
      </div>
    </>
  );
}
