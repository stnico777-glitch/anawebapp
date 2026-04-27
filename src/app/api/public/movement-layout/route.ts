import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";
import {
  DEFAULT_MOVEMENT_HERO_TILES,
  DEFAULT_MOVEMENT_LANDING_COPY,
  DEFAULT_MOVEMENT_QUICKIE_CARDS,
} from "@/lib/movement-layout-defaults";
import { ensureMovementLayoutSeeded } from "@/lib/movement-layout";
import type { MovementHeroTileDTO } from "@/lib/movement-layout-types";

export async function OPTIONS() {
  return publicOptions();
}

function serializeHero(h: MovementHeroTileDTO) {
  return {
    id: h.id,
    title: h.title,
    subtitle: h.subtitle,
    imageUrl: h.imageUrl,
    videoUrl: h.videoUrl,
    sortOrder: h.sortOrder,
    items: h.items.map((item) => ({
      id: item.id,
      heroTileId: item.heroTileId,
      dayIndex: item.dayIndex,
      title: item.title,
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl,
      sortOrder: item.sortOrder,
    })),
  };
}

export async function GET() {
  try {
    await ensureMovementLayoutSeeded();
    const [copyRow, heroTiles, quickieCards] = await Promise.all([
      prisma.movementLandingCopy.findUnique({ where: { id: "main" } }),
      prisma.movementHeroTile.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { dayIndex: "asc" }],
          },
        },
      }),
      prisma.movementQuickieCard.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    const copy = copyRow ?? DEFAULT_MOVEMENT_LANDING_COPY;
    const heroes: MovementHeroTileDTO[] = heroTiles.length
      ? heroTiles.map((h) => ({
          id: h.id,
          title: h.title,
          subtitle: h.subtitle,
          imageUrl: h.imageUrl,
          videoUrl: h.videoUrl,
          sortOrder: h.sortOrder,
          items: h.items.map((item) => ({
            id: item.id,
            heroTileId: item.heroTileId,
            dayIndex: item.dayIndex,
            title: item.title,
            imageUrl: item.imageUrl,
            videoUrl: item.videoUrl,
            sortOrder: item.sortOrder,
          })),
        }))
      : DEFAULT_MOVEMENT_HERO_TILES;
    const quickies = quickieCards.length ? quickieCards : DEFAULT_MOVEMENT_QUICKIE_CARDS;
    return publicJson({
      copy: {
        justStartedTagline: copy.justStartedTagline,
        quickieIntro: copy.quickieIntro,
      },
      heroTiles: heroes.map(serializeHero),
      quickieCards: quickies.map((q) => ({
        id: q.id,
        title: q.title,
        metaLine: q.metaLine,
        imageUrl: q.imageUrl,
        summary: q.summary,
        videoUrl: q.videoUrl,
        sortOrder: q.sortOrder,
      })),
    });
  } catch {
    return publicJson({
      copy: DEFAULT_MOVEMENT_LANDING_COPY,
      heroTiles: DEFAULT_MOVEMENT_HERO_TILES.map(serializeHero),
      quickieCards: DEFAULT_MOVEMENT_QUICKIE_CARDS,
    });
  }
}
