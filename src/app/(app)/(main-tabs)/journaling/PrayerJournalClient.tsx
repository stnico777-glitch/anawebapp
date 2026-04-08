"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LockIcon from "@/components/LockIcon";
import {
  DAY_CARD_SHELL_HOVER,
  SABBATH_CARD_SUBTITLE_CLASS,
  SABBATH_CARD_TITLE_CLASS,
  WEEKDAY_CARD_SHADOW_RING,
} from "@/constants/dayCardVisual";
import { parseTagFilter } from "@/lib/prayer-journal";
import { TEAM_WELCOME_AVATAR_SRC, TEAM_WELCOME_TAG } from "@/constants/teamWelcomeJournal";
import type { JournalStatusFilterKey } from "@/constants/prayerJournalNav";
import { slugToLabel } from "@/constants/prayerJournalNav";
import { PrayerJournalSidebar } from "./PrayerJournalSidebar";
import { PrayerJournalEditor, type PrayerEntry } from "./PrayerJournalEditor";
import {
  loadCategoryAliases,
  loadHiddenCategories,
  loadPinnedCategories,
  saveHiddenCategories,
  savePinnedCategories,
} from "./categoryPreferences";
import {
  parseArr,
  primaryCategorySlug,
  statusBadgeClass,
  statusDisplayLabel,
  shareJournalEntry,
} from "./journalingUtils";
type StatusFilter = JournalStatusFilterKey | "ALL";

/** Answer celebration modal — peaceful nature art (on-theme with routine / rest). */
const PRAYER_ANSWER_DECOR_SRC = "/weekly-routine-birds.png";

function parseStatusFromUrl(s: string | null): StatusFilter {
  if (s === "ACTIVE" || s === "ANSWERED" || s === "PAUSED") return s;
  return "ALL";
}

function PrayerJournalInner({ isGuest = false }: { isGuest?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusQ = searchParams.get("status");
  const tagQ = searchParams.get("tag");
  const statusFilter = useMemo(() => parseStatusFromUrl(statusQ), [statusQ]);
  const tagFilter = useMemo(() => (tagQ ? parseTagFilter(tagQ) ?? null : null), [tagQ]);

  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [pinnedCategories, setPinnedCategories] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [categoryAliases, setCategoryAliases] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<PrayerEntry | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedJournalIds, setExpandedJournalIds] = useState<Set<string>>(() => new Set());
  const [journalOptionsOpenId, setJournalOptionsOpenId] = useState<string | null>(null);
  const [celebrateEntry, setCelebrateEntry] = useState<PrayerEntry | null>(null);
  const [celebrateSaving, setCelebrateSaving] = useState(false);

  const toggleJournalExpanded = useCallback((id: string) => {
    setExpandedJournalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const syncUrl = useCallback(
    (status: StatusFilter, tag: string | null) => {
      const p = new URLSearchParams();
      if (status !== "ALL") p.set("status", status);
      if (tag) p.set("tag", tag);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const loadTagSuggestions = useCallback(async () => {
    const res = await fetch("/api/prayer-journal/tag-suggestions");
    if (!res.ok) return;
    const data = (await res.json()) as { slugs: string[] };
    setCategorySlugs(data.slugs ?? []);
  }, []);

  const loadEntries = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (tagFilter) params.set("tag", tagFilter);
    const q = params.toString();
    const res = await fetch(`/api/prayer-journal${q ? `?${q}` : ""}`);
    if (!res.ok) return;
    setEntries(await res.json());
  }, [statusFilter, tagFilter]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage after mount (avoid SSR hydration mismatch) */
    setPinnedCategories(loadPinnedCategories());
    setHiddenCategories(loadHiddenCategories());
    setCategoryAliases(loadCategoryAliases());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (isGuest) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadTagSuggestions();
    });
    return () => {
      cancelled = true;
    };
  }, [loadTagSuggestions, isGuest]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isGuest) {
        setEntries([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        await loadEntries();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadEntries, isGuest]);

  useEffect(() => {
    if (!celebrateEntry) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [celebrateEntry]);

  useEffect(() => {
    if (!celebrateEntry) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setCelebrateEntry(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [celebrateEntry]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (journalOptionsOpenId === null) return;
    let onDocClick: (() => void) | undefined;
    const t = window.setTimeout(() => {
      onDocClick = () => setJournalOptionsOpenId(null);
      document.addEventListener("click", onDocClick);
    }, 0);
    return () => {
      clearTimeout(t);
      if (onDocClick) document.removeEventListener("click", onDocClick);
    };
  }, [journalOptionsOpenId]);

  useEffect(() => {
    if (isGuest) return;
    const verseRef = searchParams.get("verseRef");
    const verseText = searchParams.get("verseText");
    if (!verseRef || !verseText) return;
    const id = window.setTimeout(() => setComposerOpen(true), 0);
    return () => window.clearTimeout(id);
  }, [searchParams, isGuest]);

  const openNewWithVerse = searchParams.get("verseRef") && searchParams.get("verseText");

  const resolveCategoryLabel = useCallback(
    (slug: string) => {
      const custom = categoryAliases[slug]?.trim();
      if (custom) return custom;
      return slugToLabel(slug);
    },
    [categoryAliases]
  );

  const hiddenCategorySet = useMemo(() => new Set(hiddenCategories), [hiddenCategories]);

  const mergedBaseCategorySlugs = useMemo(() => {
    const set = new Set([...categorySlugs, ...pinnedCategories]);
    return [...set].sort((a, b) => resolveCategoryLabel(a).localeCompare(resolveCategoryLabel(b)));
  }, [categorySlugs, pinnedCategories, resolveCategoryLabel]);

  /** Shown in sidebar and editor dropdown (hidden slugs excluded). */
  const sidebarCategorySlugs = useMemo(
    () => mergedBaseCategorySlugs.filter((s) => !hiddenCategorySet.has(s)),
    [mergedBaseCategorySlugs, hiddenCategorySet],
  );

  const filterSummaryParts: string[] = [];
  if (statusFilter !== "ALL") {
    const labels: Record<string, string> = { ACTIVE: "Unanswered", ANSWERED: "Answered", PAUSED: "Archive" };
    filterSummaryParts.push(labels[statusFilter] ?? statusFilter);
  }
  if (tagFilter) {
    filterSummaryParts.push(resolveCategoryLabel(tagFilter));
  }
  const filterSummary = filterSummaryParts.length ? filterSummaryParts.join(" · ") : "All prayers";

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8">
      <PrayerJournalSidebar
        statusFilter={statusFilter}
        tagFilter={tagFilter}
        categorySlugs={sidebarCategorySlugs}
        labelForSlug={resolveCategoryLabel}
        guestNavigate={isGuest ? () => router.push("/register") : undefined}
        onAddPinnedCategory={(slug) => {
          setHiddenCategories((hPrev) => {
            if (!hPrev.includes(slug)) return hPrev;
            const next = hPrev.filter((s) => s !== slug);
            saveHiddenCategories(next);
            return next;
          });
          setPinnedCategories((prev) => {
            const next = [...new Set([...prev, slug])];
            savePinnedCategories(next);
            return next;
          });
        }}
        onHideCategory={(slug) => {
          setHiddenCategories((prev) => {
            const next = [...new Set([...prev, slug])];
            saveHiddenCategories(next);
            return next;
          });
          setPinnedCategories((prev) => {
            if (!prev.includes(slug)) return prev;
            const next = prev.filter((s) => s !== slug);
            savePinnedCategories(next);
            return next;
          });
          if (tagFilter === slug) syncUrl(statusFilter, null);
        }}
        onStatusChange={(s) => syncUrl(s, tagFilter)}
        onTagChange={(t) => syncUrl(statusFilter, t)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="min-w-0 flex-1 space-y-8">
        <section
          className={`group relative z-0 h-36 w-full overflow-hidden rounded-none bg-pastel-blue-light sm:h-40 md:h-44 ${WEEKDAY_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`}
          aria-label="Prayer journal"
        >
          {/* Soft sky-blue glow in the center (matches schedule weekday cards) */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 62% 90% at 50% 36%, rgb(110 173 228 / 0.24) 0%, rgb(232 238 243 / 0.55) 46%, transparent 72%)",
            }}
            aria-hidden
          />
          {/* Birds + margin */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-4 pb-[3.5rem] pt-5 sm:pb-14 sm:pt-6 md:pb-[3.75rem]">
            <div className="relative h-[8.75rem] w-[8.95rem] shrink-0 origin-[center_40%] scale-[1.3] sm:h-[9.75rem] sm:w-[9.95rem] md:h-[10.75rem] md:w-[10.95rem]">
              <Image
                src="/sabbath-birds.png"
                alt=""
                fill
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 245px, 265px"
                quality={92}
                className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          </div>
          {/* Vertical wash: open top; stronger bottom for headline legibility */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: `linear-gradient(
                to bottom,
                transparent 0%,
                rgb(255 252 247 / 0.06) 14%,
                transparent 38%,
                transparent 58%,
                rgb(255 252 247 / 0.14) 76%,
                rgb(255 252 247 / 0.88) 100%
              )`,
            }}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 pt-2 sm:px-5 sm:pb-4 md:px-6">
            <p className={SABBATH_CARD_TITLE_CLASS}>Prayer journal</p>
            <p className={SABBATH_CARD_SUBTITLE_CLASS}>
              Remember · return · rejoice
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 md:hidden dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileNavOpen(true)}
              aria-expanded={mobileNavOpen}
            >
              Menu
            </button>
            <p className="text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]">
              {filterSummary}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isGuest) {
                  router.push("/register");
                  return;
                }
                setEditing(null);
                setComposerOpen(true);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white hover:bg-sky-blue/90 ${
                isGuest ? "bg-sky-blue/85" : "bg-sky-blue"
              }`}
              aria-label={isGuest ? "New prayer — sign up to access" : undefined}
            >
              {isGuest ? (
                <LockIcon size="sm" className="text-white" ariaHidden />
              ) : null}
              New prayer
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">Loading…</p>
        ) : entries.length === 0 ? (
          isGuest ? (
            <div
              className={`relative overflow-hidden rounded-xl border border-sand bg-white shadow-[0_8px_32px_-10px_rgba(120,130,135,0.18)] ${WEEKDAY_CARD_SHADOW_RING}`}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pastel-blue-light/70 via-app-surface/90 to-sunset-peach/50"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/80"
                aria-hidden
              />
              <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">
                <h2 className="text-lg font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif] sm:text-xl">
                  Your prayer journal
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
                  Sign up or log in for a private space to write prayers, celebrate when God answers, and keep
                  everything organized in one place.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/register"
                    className="rounded-lg bg-sky-blue px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(110,173,228,0.35)] transition hover:bg-sky-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white [font-family:var(--font-body),sans-serif]"
                  >
                    Create free account
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg border border-sand bg-white px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white [font-family:var(--font-body),sans-serif]"
                  >
                    Member login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-sand bg-white/60 py-12 text-center text-sm text-gray [font-family:var(--font-body),sans-serif] ring-1 ring-sky-blue/20">
              No entries in this view. Tap <strong className="font-semibold text-foreground">New prayer</strong> or
              adjust filters in the sidebar.
            </p>
          )
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => {
              const tags = parseArr(e.tags);
              const isTeamWelcome = tags.some((t) => t.trim().toLowerCase() === TEAM_WELCOME_TAG);
              const photos = parseArr(e.photos);
              const catSlug = primaryCategorySlug(tags);
              const fullHeadline = e.title?.trim() || "Prayer";
              const isBodyExpanded = expandedJournalIds.has(e.id);
              const hasPrayerBody = e.content.trim().length > 0;
              const showBody = isBodyExpanded;
              const thumb = photos[0];

              const optionsOpen = journalOptionsOpenId === e.id;

              return (
                <li
                  key={e.id}
                  className="relative rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
                >
                  <div className="flex gap-3">
                    <div
                      className={`shrink-0 ${hasPrayerBody ? "cursor-pointer" : ""}`}
                      onClick={() => {
                        if (hasPrayerBody) toggleJournalExpanded(e.id);
                      }}
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-stone-100 dark:ring-stone-700"
                        />
                      ) : isTeamWelcome ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={TEAM_WELCOME_AVATAR_SRC}
                          alt="From the Awake & Align team"
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-sky-blue/30 dark:ring-sky-blue/40"
                        />
                      ) : (
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-400 dark:bg-stone-800 dark:text-stone-500"
                          aria-hidden
                        >
                          ···
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div
                        className={hasPrayerBody ? "cursor-pointer" : undefined}
                        onClick={() => {
                          if (hasPrayerBody) toggleJournalExpanded(e.id);
                        }}
                        onKeyDown={(ev) => {
                          if (!hasPrayerBody) return;
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            toggleJournalExpanded(e.id);
                          }
                        }}
                        tabIndex={hasPrayerBody ? 0 : undefined}
                        aria-expanded={hasPrayerBody ? isBodyExpanded : undefined}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {catSlug ? (
                              <p className="text-xs text-stone-500 dark:text-stone-400">
                                {resolveCategoryLabel(catSlug)}
                              </p>
                            ) : null}
                            <h3 className="break-words font-semibold text-stone-900 dark:text-stone-100">
                              {fullHeadline}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(e.status)}`}
                              >
                                {statusDisplayLabel(e.status)}
                              </span>
                              {isTeamWelcome ? (
                                <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/35 dark:text-amber-100">
                                  From our team
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div
                            className="relative shrink-0"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="rounded-lg px-2 py-1 text-lg leading-none text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                              aria-expanded={optionsOpen}
                              aria-haspopup="menu"
                              aria-label="More options"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setJournalOptionsOpenId((prev) => (prev === e.id ? null : e.id));
                              }}
                            >
                              ⋯
                            </button>
                            {optionsOpen ? (
                              <div
                                role="menu"
                                className="absolute right-0 z-10 mt-1 min-w-[10rem] rounded-lg border border-stone-200 bg-white py-1 text-left shadow-lg dark:border-stone-600 dark:bg-stone-800"
                                onClick={(ev) => ev.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
                                  onClick={() => {
                                    shareJournalEntry(e.title, e.content);
                                    setJournalOptionsOpenId(null);
                                  }}
                                >
                                  Share
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
                                  onClick={() => {
                                    setJournalOptionsOpenId(null);
                                    setEditing(e);
                                    setComposerOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                                {e.status === "ANSWERED" ? (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
                                    onClick={async () => {
                                      setJournalOptionsOpenId(null);
                                      await fetch(`/api/prayer-journal/${e.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "ACTIVE" }),
                                      });
                                      loadEntries();
                                    }}
                                  >
                                    Mark as active again
                                  </button>
                                ) : null}
                                {e.status !== "PAUSED" ? (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
                                    onClick={async () => {
                                      setJournalOptionsOpenId(null);
                                      await fetch(`/api/prayer-journal/${e.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "PAUSED" }),
                                      });
                                      loadEntries();
                                    }}
                                  >
                                    Archive
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
                                    onClick={async () => {
                                      setJournalOptionsOpenId(null);
                                      await fetch(`/api/prayer-journal/${e.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "ACTIVE" }),
                                      });
                                      loadEntries();
                                    }}
                                  >
                                    Unarchive
                                  </button>
                                )}
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                  onClick={async () => {
                                    setJournalOptionsOpenId(null);
                                    if (!confirm("Delete this prayer entry?")) return;
                                    await fetch(`/api/prayer-journal/${e.id}`, { method: "DELETE" });
                                    loadEntries();
                                    loadTagSuggestions();
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {hasPrayerBody && !showBody ? (
                          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Tap to read</p>
                        ) : null}
                        {showBody && hasPrayerBody ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
                            {e.content}
                          </p>
                        ) : null}
                        {showBody && tags.length > 0 && !catSlug ? (
                          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                            {tags.map((t) => `#${t}`).join(" ")}
                          </p>
                        ) : null}
                        {showBody && photos.length > 1 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {photos.slice(1).map((src) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={src}
                                src={src}
                                alt=""
                                className="h-12 w-12 rounded-md object-cover"
                              />
                            ))}
                          </div>
                        ) : null}
                        {showBody && e.status === "ANSWERED" && e.answerNote ? (
                          <p className="mt-2 text-sm italic text-emerald-800 dark:text-emerald-200">
                            Answered: {e.answerNote}
                          </p>
                        ) : null}
                      </div>
                      <div
                        className="mt-4 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {e.status !== "ANSWERED" ? (
                          <>
                            <p className="max-w-[14rem] text-right text-[11px] leading-snug tracking-wide text-gray dark:text-stone-400 [font-family:var(--font-body),sans-serif] sm:max-w-[12.5rem]">
                              <span className="font-medium text-stone-700 dark:text-stone-300">
                                He answered?
                              </span>
                            </p>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="whitespace-nowrap text-right text-[11px] leading-snug tracking-wide text-gray dark:text-stone-400 [font-family:var(--font-body),sans-serif]">
                                Tap here
                              </span>
                              <svg
                                className="h-3.5 w-3.5 shrink-0 text-stone-500 dark:text-stone-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                                aria-hidden
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                              </svg>
                            <button
                              type="button"
                              aria-label="Mark this prayer as answered — opens celebration, then saves as answered"
                              title="Mark as answered"
                              className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-blue/35 bg-sky-blue text-white shadow-[0_2px_8px_rgba(110,173,228,0.35)] ring-2 ring-white transition hover:scale-105 hover:bg-sky-blue/90 active:scale-95 dark:border-sky-blue/50 dark:ring-stone-900"
                              onClick={() => setCelebrateEntry(e)}
                            >
                              <span
                                className="absolute inset-0 rounded-full opacity-0 transition group-hover:opacity-100 motion-reduce:transition-none"
                                style={{
                                  background:
                                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45) 0%, transparent 55%)",
                                }}
                                aria-hidden
                              />
                              <svg
                                className="relative z-10 h-6 w-6 drop-shadow-sm"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zm10.5 0a.75.75 0 01.641.364l1.39 2.311a.75.75 0 00.513.34l2.582.613a.75.75 0 01.478 1.17l-1.714 2.12a.75.75 0 00-.141.65l.515 2.521a.75.75 0 01-1.106.806l-2.284-1.256a.75.75 0 00-.696 0l-2.284 1.256a.75.75 0 01-1.106-.806l.515-2.52a.75.75 0 00-.142-.654l-1.714-2.121a.75.75 0 01.478-1.17l2.582-.613a.75.75 0 00.514-.34l1.39-2.311a.75.75 0 011.128-.036z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className="inline-flex items-center gap-2 rounded-full border border-sky-blue/25 bg-gradient-to-r from-sunset-peach/50 via-white to-pastel-blue-light/60 px-3.5 py-2 text-left shadow-[0_2px_12px_rgba(110,173,228,0.12)] ring-1 ring-sand/80 dark:from-amber-950/30 dark:via-stone-900 dark:to-sky-950/40 dark:ring-stone-600"
                            role="status"
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-blue text-white shadow-sm"
                              aria-hidden
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground [font-family:var(--font-headline),sans-serif]">
                              God did — prayer answered
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {celebrateEntry ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/72 p-4 dark:bg-stone-950/82"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prayer-celebrate-title"
            onClick={() => !celebrateSaving && setCelebrateEntry(null)}
          >
            <div
              className="prayer-celebrate-modal-inner relative w-full max-w-md overflow-hidden rounded-xl border-2 border-sand bg-app-surface shadow-[0_24px_48px_-12px_rgba(120,130,135,0.22)] dark:border-stone-600 dark:bg-stone-900"
              onClick={(ev) => ev.stopPropagation()}
            >
              {/* Solid theme layers — less “glassy” */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-pastel-blue-light via-app-surface to-pastel-blue-light dark:from-sky-950/40 dark:via-stone-900 dark:to-stone-950"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-blue/15 via-transparent to-transparent dark:from-sky-blue/20"
                aria-hidden
              />
              {/* Soft nature accent */}
              <div
                className="pointer-events-none absolute -bottom-2 -right-6 z-[1] h-40 w-44 opacity-35 sm:h-44 sm:w-52 dark:opacity-25"
                aria-hidden
              >
                <Image
                  src={PRAYER_ANSWER_DECOR_SRC}
                  alt=""
                  fill
                  className="object-contain object-right object-bottom"
                  sizes="200px"
                />
              </div>
              <div className="relative z-[2] p-8">
              <div className="relative mx-auto mb-6 flex h-28 w-full items-center justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <span className="prayer-answer-ring-wave" />
                  <span className="prayer-answer-ring-wave" />
                  <span className="prayer-answer-ring-wave" />
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-sky-blue/25 bg-sky-blue text-white shadow-md shadow-sky-blue/25">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <h2
                id="prayer-celebrate-title"
                className="text-center text-xl font-semibold tracking-tight text-foreground dark:text-stone-100 [font-family:var(--font-headline),sans-serif]"
              >
                Whoa — your prayer was answered!
              </h2>
              <p className="mt-3 text-center text-sm leading-relaxed text-gray dark:text-stone-400 [font-family:var(--font-body),sans-serif]">
                Take a breath and give thanks. When you&apos;re ready, mark it below.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={celebrateSaving}
                  className="w-full rounded-lg bg-sky-blue py-3.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(110,173,228,0.35)] transition hover:bg-sky-blue/90 disabled:opacity-60 [font-family:var(--font-body),sans-serif]"
                  onClick={async () => {
                    if (!celebrateEntry) return;
                    setCelebrateSaving(true);
                    await fetch(`/api/prayer-journal/${celebrateEntry.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "ANSWERED" }),
                    });
                    setCelebrateSaving(false);
                    setCelebrateEntry(null);
                    loadEntries();
                  }}
                >
                  {celebrateSaving ? "Saving…" : "Yes! Mark as answered"}
                </button>
              </div>
              <button
                type="button"
                disabled={celebrateSaving}
                className="mt-5 w-full text-center text-xs font-medium text-gray underline-offset-2 hover:text-foreground hover:underline dark:text-stone-400"
                onClick={() => setCelebrateEntry(null)}
              >
                Not yet
              </button>
              </div>
            </div>
          </div>
        ) : null}

        {composerOpen && !isGuest ? (
          <PrayerJournalEditor
            key={`${editing?.id ?? "new"}-${openNewWithVerse ? "v" : "x"}`}
            entry={editing}
            categorySlugs={sidebarCategorySlugs}
            labelForSlug={resolveCategoryLabel}
            initialVerseRef={openNewWithVerse ? searchParams.get("verseRef") : null}
            initialVerseText={openNewWithVerse ? searchParams.get("verseText") : null}
            onClose={() => {
              setComposerOpen(false);
              setEditing(null);
            }}
            onSaved={() => {
              setComposerOpen(false);
              setEditing(null);
              loadEntries();
              loadTagSuggestions();
            }}
            onDeleted={() => {
              setComposerOpen(false);
              setEditing(null);
              loadEntries();
              loadTagSuggestions();
            }}
            onCategoriesNeedReload={loadTagSuggestions}
          />
        ) : null}
      </div>
    </div>
  );
}

export default function PrayerJournalClient({ isGuest = false }: { isGuest?: boolean }) {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">Loading journal…</p>
      }
    >
      <PrayerJournalInner isGuest={isGuest} />
    </Suspense>
  );
}
