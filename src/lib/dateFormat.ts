/** Format week range for display (e.g. "Jan 13 – Jan 18, 2026"). Safe for client and server. */
export function formatWeekRange(weekStart: Date): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 5);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}
