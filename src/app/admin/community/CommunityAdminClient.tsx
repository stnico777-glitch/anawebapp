"use client";

import { useCallback, useState } from "react";
import { adminJson, readAdminError } from "@/lib/admin-fetch";

type Tab = "prayer" | "praise";
type Range = "7d" | "30d" | "all";

type AdminPrayerItem = {
  id: string;
  content: string;
  authorName: string;
  userId: string | null;
  createdAt: string;
  counts: { pray: number; like: number; encourage: number };
  commentCount: number;
};

type AdminPraiseItem = {
  id: string;
  content: string;
  authorName: string;
  userId: string | null;
  createdAt: string;
  counts: { celebrate: number };
  commentCount: number;
};

type Scope = { kind: "range"; range: Range } | { kind: "date"; date: string };

type LoadState<T> = {
  scope: Scope | null;
  items: T[];
  count: number;
  loading: boolean;
  error: string | null;
};

const EMPTY_STATE: LoadState<never> = {
  scope: null,
  items: [],
  count: 0,
  loading: false,
  error: null,
};

const RANGE_LABEL: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

function scopeIsRange(scope: Scope | null, range: Range): boolean {
  return scope?.kind === "range" && scope.range === range;
}

function scopeIsDate(scope: Scope | null, date: string): boolean {
  return scope?.kind === "date" && scope.date === date;
}

function formatScopeLabel(scope: Scope | null): string | null {
  if (!scope) return null;
  if (scope.kind === "range") return RANGE_LABEL[scope.range];
  try {
    return new Date(`${scope.date}T00:00:00.000Z`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return scope.date;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const toolbarBtn =
  "rounded-md border border-sand bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:bg-sunset-peach/40 disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--font-body),sans-serif]";
const toolbarBtnActive =
  "rounded-md border border-sky-blue bg-sky-blue/10 px-3 py-2 text-sm font-semibold text-foreground [font-family:var(--font-body),sans-serif]";
const dangerBtn =
  "shrink-0 rounded-md border border-sand bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--font-body),sans-serif]";

function scopeToQuery(scope: Scope): string {
  return scope.kind === "range" ? `range=${scope.range}` : `date=${scope.date}`;
}

export default function CommunityAdminClient() {
  const [tab, setTab] = useState<Tab>("prayer");
  const [prayers, setPrayers] = useState<LoadState<AdminPrayerItem>>(EMPTY_STATE);
  const [praises, setPraises] = useState<LoadState<AdminPraiseItem>>(EMPTY_STATE);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [prayerDateInput, setPrayerDateInput] = useState("");
  const [praiseDateInput, setPraiseDateInput] = useState("");

  const loadPrayers = useCallback(async (scope: Scope) => {
    setPrayers((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await adminJson(
        `/api/admin/community/prayer-requests?${scopeToQuery(scope)}`,
      );
      if (!res.ok) {
        const msg = await readAdminError(res);
        setPrayers((s) => ({ ...s, loading: false, error: msg }));
        return;
      }
      const data = (await res.json()) as { items: AdminPrayerItem[]; count: number };
      setPrayers({ scope, items: data.items, count: data.count, loading: false, error: null });
    } catch (e) {
      setPrayers((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  }, []);

  const loadPraises = useCallback(async (scope: Scope) => {
    setPraises((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await adminJson(
        `/api/admin/community/praise-reports?${scopeToQuery(scope)}`,
      );
      if (!res.ok) {
        const msg = await readAdminError(res);
        setPraises((s) => ({ ...s, loading: false, error: msg }));
        return;
      }
      const data = (await res.json()) as { items: AdminPraiseItem[]; count: number };
      setPraises({ scope, items: data.items, count: data.count, loading: false, error: null });
    } catch (e) {
      setPraises((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  }, []);

  const deletePrayer = useCallback(
    async (id: string) => {
      if (!confirm("Delete this prayer? This also removes its prays, encourages, likes, and comments. This can't be undone.")) return;
      setDeletingId(id);
      try {
        const res = await adminJson(`/api/admin/community/prayer-requests/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          alert(await readAdminError(res));
          return;
        }
        setPrayers((s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== id),
          count: Math.max(0, s.count - 1),
        }));
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const deletePraise = useCallback(
    async (id: string) => {
      if (!confirm("Delete this praise? This also removes its celebrations and comments. This can't be undone.")) return;
      setDeletingId(id);
      try {
        const res = await adminJson(`/api/admin/community/praise-reports/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          alert(await readAdminError(res));
          return;
        }
        setPraises((s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== id),
          count: Math.max(0, s.count - 1),
        }));
      } finally {
        setDeletingId(null);
      }
    },
    [],
  );

  const current = tab === "prayer" ? prayers : praises;
  const onLoad = tab === "prayer" ? loadPrayers : loadPraises;
  const dateInput = tab === "prayer" ? prayerDateInput : praiseDateInput;
  const setDateInput = tab === "prayer" ? setPrayerDateInput : setPraiseDateInput;
  const scopeLabel = formatScopeLabel(current.scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("prayer")}
          className={tab === "prayer" ? toolbarBtnActive : toolbarBtn}
        >
          Prayers
          {prayers.scope ? <span className="ml-1.5 text-gray">· {prayers.count}</span> : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("praise")}
          className={tab === "praise" ? toolbarBtnActive : toolbarBtn}
        >
          Praises
          {praises.scope ? <span className="ml-1.5 text-gray">· {praises.count}</span> : null}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-sand bg-white/90 p-3 shadow-[0_1px_2px_rgba(120,130,135,0.06)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-foreground [font-family:var(--font-body),sans-serif]">
            Load
          </span>
          {(["7d", "30d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => void onLoad({ kind: "range", range: r })}
              disabled={current.loading}
              className={scopeIsRange(current.scope, r) ? toolbarBtnActive : toolbarBtn}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
          {current.scope ? (
            <button
              type="button"
              onClick={() => void onLoad(current.scope!)}
              disabled={current.loading}
              className={toolbarBtn}
              title="Re-fetch the current view"
            >
              {current.loading ? "Refreshing…" : "Refresh"}
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-sand pt-3">
          <label
            htmlFor={`community-admin-date-${tab}`}
            className="text-sm font-semibold text-foreground [font-family:var(--font-body),sans-serif]"
          >
            Pick a date
          </label>
          <input
            id={`community-admin-date-${tab}`}
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="rounded-md border border-sand bg-white px-3 py-1.5 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]"
          />
          <button
            type="button"
            onClick={() => {
              if (!dateInput.trim()) return;
              void onLoad({ kind: "date", date: dateInput });
            }}
            disabled={current.loading || !dateInput.trim()}
            className={
              current.scope?.kind === "date" && current.scope.date === dateInput
                ? toolbarBtnActive
                : toolbarBtn
            }
          >
            Load that day
          </button>
          <span className="text-xs text-gray [font-family:var(--font-body),sans-serif]">
            UTC calendar day
          </span>
        </div>
      </div>

      {current.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 [font-family:var(--font-body),sans-serif]">
          {current.error}
        </p>
      ) : null}

      {current.scope == null && !current.loading ? (
        <p className="rounded-lg border border-dashed border-sand bg-app-surface/80 p-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
          Pick a range or a specific date above to load{" "}
          {tab === "prayer" ? "prayers" : "praises"}. Nothing is downloaded until you ask.
        </p>
      ) : null}

      {current.scope != null && current.loading && current.items.length === 0 ? (
        <p className="rounded-lg border border-sand bg-white p-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
          Loading…
        </p>
      ) : null}

      {current.scope != null && !current.loading && current.items.length === 0 && !current.error ? (
        <p className="rounded-lg border border-sand bg-white p-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
          No {tab === "prayer" ? "prayers" : "praises"}{" "}
          {current.scope.kind === "date" ? `on ${scopeLabel}` : "in that range"}.
        </p>
      ) : null}

      {current.scope != null && current.items.length > 0 ? (
        <p className="text-sm text-gray [font-family:var(--font-body),sans-serif]">
          Showing <strong className="font-semibold text-foreground">{current.count}</strong>{" "}
          {tab === "prayer" ? "prayers" : "praises"}{" "}
          {current.scope.kind === "date" ? `from ${scopeLabel}` : `· ${scopeLabel}`}.
        </p>
      ) : null}

      {tab === "prayer" && prayers.items.length > 0 ? (
        <ul className="space-y-3">
          {prayers.items.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-sand bg-white p-4 shadow-[0_1px_2px_rgba(120,130,135,0.06)]"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground [font-family:var(--font-body),sans-serif]">
                    {p.authorName}
                    {p.userId ? null : <span className="ml-2 text-xs font-normal text-gray">· anonymous</span>}
                  </p>
                  <p className="text-xs text-gray">{formatDate(p.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deletePrayer(p.id)}
                  disabled={deletingId === p.id}
                  className={dangerBtn}
                >
                  {deletingId === p.id ? "Deleting…" : "Delete"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground [font-family:var(--font-body),sans-serif]">
                {p.content}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray [font-family:var(--font-body),sans-serif]">
                <span>{p.counts.pray} prayed</span>
                <span>{p.counts.encourage} encouraged</span>
                <span>{p.counts.like} liked</span>
                <span>{p.commentCount} comments</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "praise" && praises.items.length > 0 ? (
        <ul className="space-y-3">
          {praises.items.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-sand bg-white p-4 shadow-[0_1px_2px_rgba(120,130,135,0.06)]"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground [font-family:var(--font-body),sans-serif]">
                    {p.authorName}
                    {p.userId ? null : <span className="ml-2 text-xs font-normal text-gray">· anonymous</span>}
                  </p>
                  <p className="text-xs text-gray">{formatDate(p.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deletePraise(p.id)}
                  disabled={deletingId === p.id}
                  className={dangerBtn}
                >
                  {deletingId === p.id ? "Deleting…" : "Delete"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground [font-family:var(--font-body),sans-serif]">
                {p.content}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray [font-family:var(--font-body),sans-serif]">
                <span>{p.counts.celebrate} celebrated</span>
                <span>{p.commentCount} comments</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
