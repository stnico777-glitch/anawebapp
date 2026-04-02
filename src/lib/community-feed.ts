import { prisma } from "@/lib/prisma";
import { participantKeyFromViewer } from "@/lib/community-participant";
import { Prisma, PrayerRequestInteractionKind } from "@prisma/client";
import { getDemoCommunityFeedItems } from "@/lib/demo-preview-data";

type ViewerPrayerRow = {
  prayerRequestId: string;
  kind: string;
  presetKey: string | null;
  message: string | null;
};

async function prayerInteractionsForViewer(
  viewerKey: string,
  prayerIds: string[],
): Promise<ViewerPrayerRow[]> {
  if (prayerIds.length === 0) return [];
  return prisma.$queryRaw<ViewerPrayerRow[]>(Prisma.sql`
    SELECT "prayerRequestId", "kind", "presetKey", "message"
    FROM "PrayerRequestInteraction"
    WHERE "participantKey" = ${viewerKey}
    AND "prayerRequestId" IN (${Prisma.join(prayerIds)})
  `);
}

async function praiseLikesForViewer(
  viewerKey: string,
  praiseIds: string[],
): Promise<{ praiseReportId: string }[]> {
  if (praiseIds.length === 0) return [];
  return prisma.$queryRaw<{ praiseReportId: string }[]>(Prisma.sql`
    SELECT "praiseReportId"
    FROM "PraiseReportLike"
    WHERE "participantKey" = ${viewerKey}
    AND "praiseReportId" IN (${Prisma.join(praiseIds)})
  `);
}

/** Raw SQL so feed works even if a hot-reloaded Prisma delegate is stale (see `lib/prisma.ts`). */
async function prayerCommentCounts(prayerIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  for (const id of prayerIds) map.set(id, 0);
  if (prayerIds.length === 0) return map;
  const rows = await prisma.$queryRaw<{ prayerRequestId: string; cnt: bigint | number }[]>(Prisma.sql`
    SELECT "prayerRequestId", COUNT(*) AS cnt
    FROM "PrayerRequestComment"
    WHERE "prayerRequestId" IN (${Prisma.join(prayerIds)})
    GROUP BY "prayerRequestId"
  `);
  for (const row of rows) {
    map.set(row.prayerRequestId, Number(row.cnt));
  }
  return map;
}

async function praiseCommentCounts(praiseIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  for (const id of praiseIds) map.set(id, 0);
  if (praiseIds.length === 0) return map;
  const rows = await prisma.$queryRaw<{ praiseReportId: string; cnt: bigint | number }[]>(Prisma.sql`
    SELECT "praiseReportId", COUNT(*) AS cnt
    FROM "PraiseReportComment"
    WHERE "praiseReportId" IN (${Prisma.join(praiseIds)})
    GROUP BY "praiseReportId"
  `);
  for (const row of rows) {
    map.set(row.praiseReportId, Number(row.cnt));
  }
  return map;
}

export type CommunityFeedPrayerItem = {
  kind: "prayer";
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  commentCount: number;
  counts: { pray: number; like: number; encourage: number };
  viewer: {
    pray: boolean;
    like: boolean;
    encourage: { presetKey: string | null; message: string | null } | null;
  };
};

export type CommunityFeedPraiseItem = {
  kind: "praise";
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  commentCount: number;
  counts: { celebrate: number };
  viewer: { celebrated: boolean };
};

export type CommunityFeedItem = CommunityFeedPrayerItem | CommunityFeedPraiseItem;

function emptyPrayerCounts() {
  return { pray: 0, like: 0, encourage: 0 };
}

export async function getCommunityFeed(
  userId: string | null,
  visitorId: string | null,
): Promise<CommunityFeedItem[]> {
  try {
    const items = await loadCommunityFeed(userId, visitorId);
    if (items.length > 0) return items;
    return getDemoCommunityFeedItems();
  } catch {
    return getDemoCommunityFeedItems();
  }
}

async function loadCommunityFeed(
  userId: string | null,
  visitorId: string | null,
): Promise<CommunityFeedItem[]> {
  const viewerKey = participantKeyFromViewer(userId, visitorId);
  const [prayers, praises] = await Promise.all([
    prisma.prayerRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.praiseReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const prayerIds = prayers
    .map((p) => p.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const praiseIds = praises
    .map((p) => p.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  const prayerCountMap = new Map<string, { pray: number; like: number; encourage: number }>();
  for (const id of prayerIds) {
    prayerCountMap.set(id, emptyPrayerCounts());
  }
  if (prayerIds.length > 0) {
    const groups = await prisma.prayerRequestInteraction.groupBy({
      by: ["prayerRequestId", "kind"],
      where: { prayerRequestId: { in: prayerIds } },
      _count: true,
    });
    for (const g of groups) {
      const cur = prayerCountMap.get(g.prayerRequestId) ?? emptyPrayerCounts();
      if (g.kind === PrayerRequestInteractionKind.PRAY) cur.pray = g._count;
      else if (g.kind === PrayerRequestInteractionKind.LIKE) cur.like = g._count;
      else if (g.kind === PrayerRequestInteractionKind.ENCOURAGE) cur.encourage = g._count;
      prayerCountMap.set(g.prayerRequestId, cur);
    }
  }

  const prayerViewerMap = new Map<
    string,
    {
      pray: boolean;
      like: boolean;
      encourage: { presetKey: string | null; message: string | null } | null;
    }
  >();
  for (const id of prayerIds) {
    prayerViewerMap.set(id, { pray: false, like: false, encourage: null });
  }
  if (viewerKey && prayerIds.length > 0) {
    const mine = await prayerInteractionsForViewer(viewerKey, prayerIds);
    for (const row of mine) {
      const v = prayerViewerMap.get(row.prayerRequestId) ?? {
        pray: false,
        like: false,
        encourage: null,
      };
      if (row.kind === PrayerRequestInteractionKind.PRAY) v.pray = true;
      if (row.kind === PrayerRequestInteractionKind.LIKE) v.like = true;
      if (row.kind === PrayerRequestInteractionKind.ENCOURAGE) {
        v.encourage = { presetKey: row.presetKey, message: row.message };
      }
      prayerViewerMap.set(row.prayerRequestId, v);
    }
  }

  const praiseCountMap = new Map<string, number>();
  for (const id of praiseIds) praiseCountMap.set(id, 0);
  if (praiseIds.length > 0) {
    const groups = await prisma.praiseReportLike.groupBy({
      by: ["praiseReportId"],
      where: { praiseReportId: { in: praiseIds } },
      _count: true,
    });
    for (const g of groups) {
      praiseCountMap.set(g.praiseReportId, g._count);
    }
  }

  const praiseCelebrated = new Set<string>();
  if (viewerKey && praiseIds.length > 0) {
    const mine = await praiseLikesForViewer(viewerKey, praiseIds);
    for (const row of mine) praiseCelebrated.add(row.praiseReportId);
  }

  const [prayerCommentMap, praiseCommentMap] = await Promise.all([
    prayerCommentCounts(prayerIds),
    praiseCommentCounts(praiseIds),
  ]);

  const prayerItems: CommunityFeedPrayerItem[] = prayers.map((p) => ({
    kind: "prayer",
    id: p.id,
    content: p.content,
    authorName: p.authorName,
    createdAt: p.createdAt.toISOString(),
    commentCount: prayerCommentMap.get(p.id) ?? 0,
    counts: prayerCountMap.get(p.id) ?? emptyPrayerCounts(),
    viewer: prayerViewerMap.get(p.id) ?? {
      pray: false,
      like: false,
      encourage: null,
    },
  }));

  const praiseItems: CommunityFeedPraiseItem[] = praises.map((p) => ({
    kind: "praise",
    id: p.id,
    content: p.content,
    authorName: p.authorName,
    createdAt: p.createdAt.toISOString(),
    commentCount: praiseCommentMap.get(p.id) ?? 0,
    counts: { celebrate: praiseCountMap.get(p.id) ?? 0 },
    viewer: { celebrated: praiseCelebrated.has(p.id) },
  }));

  const merged = [...prayerItems, ...praiseItems] as CommunityFeedItem[];
  merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return merged;
}
