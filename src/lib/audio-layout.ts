import { prisma } from "@/lib/prisma";
import {
  DEFAULT_AUDIO_COLLECTION_CARDS,
  DEFAULT_AUDIO_ESSENTIAL_TILES,
} from "@/lib/audio-layout-defaults";
import {
  AUDIO_COLLECTION_CATEGORIES,
  type AudioCollectionCardDTO,
  type AudioCollectionCategory,
  type AudioEssentialTileDTO,
} from "@/lib/audio-layout-types";

function normalizeCategory(raw: string): AudioCollectionCategory {
  return (AUDIO_COLLECTION_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as AudioCollectionCategory)
    : "AFFIRMATIONS";
}

function mapCollection(row: {
  id: string;
  category: string;
  title: string;
  metaLine: string;
  imageUrl: string;
  summary: string;
  audioUrl: string;
  linkHref: string;
  sortOrder: number;
}): AudioCollectionCardDTO {
  return {
    id: row.id,
    category: normalizeCategory(row.category),
    title: row.title,
    metaLine: row.metaLine,
    imageUrl: row.imageUrl,
    summary: row.summary,
    audioUrl: row.audioUrl,
    linkHref: row.linkHref,
    sortOrder: row.sortOrder,
  };
}

function mapEssential(row: {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkHref: string;
  sortOrder: number;
}): AudioEssentialTileDTO {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    linkHref: row.linkHref,
    sortOrder: row.sortOrder,
  };
}

/**
 * If a section’s table is empty (e.g. DB migrated but seed never ran), insert the same
 * defaults the member app would show. Keeps CMS and consumer Audio tab in sync.
 */
export async function ensureAudioLayoutSeeded(): Promise<void> {
  try {
    const [nC, nE] = await Promise.all([
      prisma.audioCollectionCard.count(),
      prisma.audioEssentialTile.count(),
    ]);
    if (nC === 0) {
      await prisma.audioCollectionCard.createMany({
        data: DEFAULT_AUDIO_COLLECTION_CARDS.map((row, i) => ({
          category: row.category,
          title: row.title,
          metaLine: row.metaLine,
          imageUrl: row.imageUrl,
          summary: row.summary,
          audioUrl: row.audioUrl,
          linkHref: row.linkHref,
          sortOrder: i,
        })),
      });
    }
    if (nE === 0) {
      await prisma.audioEssentialTile.createMany({
        data: DEFAULT_AUDIO_ESSENTIAL_TILES.map((row, i) => ({
          title: row.title,
          subtitle: row.subtitle,
          imageUrl: row.imageUrl,
          linkHref: row.linkHref,
          sortOrder: i,
        })),
      });
    }
  } catch {
    /* DB unavailable — callers fall back to in-memory defaults */
  }
}

/** Member + public API: DB-backed after ensure; in-memory defaults if Prisma fails. */
export async function getAudioLayoutForDisplay(): Promise<{
  collections: AudioCollectionCardDTO[];
  essentials: AudioEssentialTileDTO[];
}> {
  try {
    await ensureAudioLayoutSeeded();
    const [collections, essentials] = await Promise.all([
      prisma.audioCollectionCard.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      prisma.audioEssentialTile.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    ]);
    return {
      collections: collections.length ? collections.map(mapCollection) : DEFAULT_AUDIO_COLLECTION_CARDS,
      essentials: essentials.length ? essentials.map(mapEssential) : DEFAULT_AUDIO_ESSENTIAL_TILES,
    };
  } catch {
    return {
      collections: DEFAULT_AUDIO_COLLECTION_CARDS,
      essentials: DEFAULT_AUDIO_ESSENTIAL_TILES,
    };
  }
}

/** CMS: same persisted data as the member app after ensure. */
export async function getAudioLayoutForAdmin(): Promise<{
  collections: AudioCollectionCardDTO[];
  essentials: AudioEssentialTileDTO[];
}> {
  try {
    await ensureAudioLayoutSeeded();
    const [collections, essentials] = await Promise.all([
      prisma.audioCollectionCard.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.audioEssentialTile.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    return {
      collections: collections.length ? collections.map(mapCollection) : DEFAULT_AUDIO_COLLECTION_CARDS,
      essentials: essentials.length ? essentials.map(mapEssential) : DEFAULT_AUDIO_ESSENTIAL_TILES,
    };
  } catch {
    return {
      collections: DEFAULT_AUDIO_COLLECTION_CARDS,
      essentials: DEFAULT_AUDIO_ESSENTIAL_TILES,
    };
  }
}
