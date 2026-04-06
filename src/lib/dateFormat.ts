/** Format week range for display. Default matches mobile schedule (Mon–Sun, em dash, no year). */
export function formatWeekRange(
  weekStart: Date,
  opts?: { includeYear?: boolean },
): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const withYear = opts?.includeYear ?? false;
  const short = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(withYear ? { year: "numeric" as const } : {}),
    });
  return `${short(start)} — ${short(end)}`;
}
