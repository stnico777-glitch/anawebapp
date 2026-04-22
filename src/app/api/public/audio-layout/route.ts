import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";
import {
  DEFAULT_AUDIO_COLLECTION_CARDS,
  DEFAULT_AUDIO_ESSENTIAL_TILES,
} from "@/lib/audio-layout-defaults";
import { ensureAudioLayoutSeeded } from "@/lib/audio-layout";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET() {
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
    return publicJson({
      collections: (collections.length
        ? collections
        : DEFAULT_AUDIO_COLLECTION_CARDS
      ).map((c) => ({
        id: c.id,
        title: c.title,
        metaLine: c.metaLine,
        imageUrl: c.imageUrl,
        summary: c.summary,
        linkHref: c.linkHref,
        sortOrder: c.sortOrder,
      })),
      essentials: (essentials.length ? essentials : DEFAULT_AUDIO_ESSENTIAL_TILES).map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
        imageUrl: e.imageUrl,
        linkHref: e.linkHref,
        sortOrder: e.sortOrder,
      })),
    });
  } catch {
    return publicJson({
      collections: DEFAULT_AUDIO_COLLECTION_CARDS,
      essentials: DEFAULT_AUDIO_ESSENTIAL_TILES,
    });
  }
}
