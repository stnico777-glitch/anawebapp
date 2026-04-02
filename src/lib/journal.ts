/**
 * Normalize a date to midnight UTC for consistent DB storage.
 * SQLite stores DateTime; we use start-of-day for unique constraint.
 */
export function toEntryDate(d: Date): Date {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function formatEntryDate(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
