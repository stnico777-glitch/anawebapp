import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrayerRequestInteractionKind } from "@prisma/client";

const RANGES = ["7d", "30d", "all"] as const;
type Range = (typeof RANGES)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function sinceForRange(range: Range): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function parseRange(raw: string | null): Range {
  if (raw && (RANGES as readonly string[]).includes(raw)) return raw as Range;
  return "7d";
}

function parseLimit(raw: string | null): number {
  const n = raw == null ? NaN : parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return 500;
  return Math.min(2000, n);
}

/** Returns `{ gte, lt }` bounds spanning the given YYYY-MM-DD in UTC (entire calendar day). */
function parseDateFilter(raw: string | null): { gte: Date; lt: Date } | null {
  if (!raw || !DATE_RE.test(raw)) return null;
  const gte = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(gte.getTime())) return null;
  const lt = new Date(gte.getTime() + 24 * 60 * 60 * 1000);
  return { gte, lt };
}

export const GET = withAdmin(async (_, request) => {
  const { searchParams } = new URL(request.url);
  const date = parseDateFilter(searchParams.get("date"));
  const range = parseRange(searchParams.get("range"));
  const take = parseLimit(searchParams.get("take"));

  const where = date
    ? { createdAt: { gte: date.gte, lt: date.lt } }
    : (() => {
        const since = sinceForRange(range);
        return since ? { createdAt: { gte: since } } : undefined;
      })();

  const rows = await prisma.prayerRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  const ids = rows.map((r) => r.id);

  const interactionGroups = ids.length
    ? await prisma.prayerRequestInteraction.groupBy({
        by: ["prayerRequestId", "kind"],
        where: { prayerRequestId: { in: ids } },
        _count: true,
      })
    : [];
  const counts = new Map<string, { pray: number; like: number; encourage: number }>();
  for (const id of ids) counts.set(id, { pray: 0, like: 0, encourage: 0 });
  for (const g of interactionGroups) {
    const cur = counts.get(g.prayerRequestId) ?? { pray: 0, like: 0, encourage: 0 };
    if (g.kind === PrayerRequestInteractionKind.PRAY) cur.pray = g._count;
    else if (g.kind === PrayerRequestInteractionKind.LIKE) cur.like = g._count;
    else if (g.kind === PrayerRequestInteractionKind.ENCOURAGE) cur.encourage = g._count;
    counts.set(g.prayerRequestId, cur);
  }

  const commentGroups = ids.length
    ? await prisma.prayerRequestComment.groupBy({
        by: ["prayerRequestId"],
        where: { prayerRequestId: { in: ids } },
        _count: true,
      })
    : [];
  const commentMap = new Map<string, number>();
  for (const id of ids) commentMap.set(id, 0);
  for (const g of commentGroups) commentMap.set(g.prayerRequestId, g._count);

  return NextResponse.json({
    range: date ? null : range,
    date: date ? searchParams.get("date") : null,
    count: rows.length,
    items: rows.map((r) => ({
      id: r.id,
      content: r.content,
      authorName: r.authorName,
      userId: r.userId,
      createdAt: r.createdAt.toISOString(),
      counts: counts.get(r.id) ?? { pray: 0, like: 0, encourage: 0 },
      commentCount: commentMap.get(r.id) ?? 0,
    })),
  });
});
