/**
 * Pure calendar helpers for week schedules (safe for client bundles — no DB).
 *
 * Admin + API treat HTML `type="date"` values (YYYY-MM-DD) as UTC civil dates so
 * clash checks match the client even when `weekStart` in the DB is stored as UTC
 * midnight (which parses as the previous calendar day in US timezones when using
 * local getters).
 */

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Stable key for “this calendar week” (local Monday YYYY-MM-DD). */
export function weekScheduleAnchorKey(weekStart: Date): string {
  const m = getMonday(weekStart);
  const y = m.getFullYear();
  const mo = String(m.getMonth() + 1).padStart(2, "0");
  const d = String(m.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

/** Parses HTML date input YYYY-MM-DD as that civil date at noon UTC. */
export function parseScheduleDateInput(isoDate: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return new Date(NaN);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0));
}

export function getMondayUTC(d: Date): Date {
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const wd = new Date(t).getUTCDay();
  const diff = wd === 0 ? -6 : 1 - wd;
  return new Date(t + diff * 86400000);
}

/** UTC midnight for the UTC calendar day of this instant. */
export function utcMidnightForUtcDate(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Monday 00:00 UTC for the UTC week containing `d`. */
export function utcMondayMidnightForInstant(d: Date): Date {
  return utcMidnightForUtcDate(getMondayUTC(d));
}

export function weekScheduleAnchorKeyUTC(d: Date): string {
  const mon = getMondayUTC(d);
  const y = mon.getUTCFullYear();
  const mo = String(mon.getUTCMonth() + 1).padStart(2, "0");
  const day = String(mon.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Monday 00:00 UTC for the admin/API week of the given YYYY-MM-DD (UTC civil calendar). */
export function weekStartMondayUtcFromDateInput(isoDate: string): Date {
  const mon = getMondayUTC(parseScheduleDateInput(isoDate));
  return utcMidnightForUtcDate(mon);
}

export function addDaysUtc(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

/** Today’s date as YYYY-MM-DD in UTC (default “this week” create). */
export function utcDateInputStringForInstant(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
