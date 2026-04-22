import { prisma } from "@/lib/prisma";
import { participantKeyFromViewer } from "@/lib/community-participant";
import { PrayerRequestInteractionKind } from "@prisma/client";

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
  /** True when the signed-in viewer authored this post (drives edit/delete UI). */
  ownedByViewer: boolean;
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
  /** True when the signed-in viewer authored this post (drives edit/delete UI). */
  ownedByViewer: boolean;
};

export type CommunityFeedItem = CommunityFeedPrayerItem | CommunityFeedPraiseItem;

function emptyPrayerCounts() {
  return { pray: 0, like: 0, encourage: 0 };
}

/**
 * Real community feed — no demo fallback. Returns `[]` when the DB is empty or
 * Prisma fails (admin seed the wall for now; no fake content bleeds through).
 */
export async function getCommunityFeed(
  userId: string | null,
  visitorId: string | null,
): Promise<CommunityFeedItem[]> {
  try {
    return await loadCommunityFeed(userId, visitorId);
  } catch (err) {
    console.error("[community-feed] getCommunityFeed failed:", err);
    return [];
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

  const prayerIds = prayers.map((p) => p.id);
  const praiseIds = praises.map((p) => p.id);

  const prayerCountMap = new Map<string, { pray: number; like: number; encourage: number }>();
  for (const id of prayerIds) prayerCountMap.set(id, emptyPrayerCounts());
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
    const mine = await prisma.prayerRequestInteraction.findMany({
      where: {
        participantKey: viewerKey,
        prayerRequestId: { in: prayerIds },
      },
      select: {
        prayerRequestId: true,
        kind: true,
        presetKey: true,
        message: true,
      },
    });
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
    const mine = await prisma.praiseReportLike.findMany({
      where: {
        participantKey: viewerKey,
        praiseReportId: { in: praiseIds },
      },
      select: { praiseReportId: true },
    });
    for (const row of mine) praiseCelebrated.add(row.praiseReportId);
  }

  const prayerCommentMap = new Map<string, number>();
  for (const id of prayerIds) prayerCommentMap.set(id, 0);
  if (prayerIds.length > 0) {
    const groups = await prisma.prayerRequestComment.groupBy({
      by: ["prayerRequestId"],
      where: { prayerRequestId: { in: prayerIds } },
      _count: true,
    });
    for (const g of groups) prayerCommentMap.set(g.prayerRequestId, g._count);
  }

  const praiseCommentMap = new Map<string, number>();
  for (const id of praiseIds) praiseCommentMap.set(id, 0);
  if (praiseIds.length > 0) {
    const groups = await prisma.praiseReportComment.groupBy({
      by: ["praiseReportId"],
      where: { praiseReportId: { in: praiseIds } },
      _count: true,
    });
    for (const g of groups) praiseCommentMap.set(g.praiseReportId, g._count);
  }

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
    ownedByViewer: Boolean(userId && p.userId && p.userId === userId),
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
    ownedByViewer: Boolean(userId && p.userId && p.userId === userId),
  }));

  const merged = [...prayerItems, ...praiseItems] as CommunityFeedItem[];
  merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return merged;
}
