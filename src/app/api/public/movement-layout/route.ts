import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";
import {
  DEFAULT_MOVEMENT_HERO_TILES,
  DEFAULT_MOVEMENT_LANDING_COPY,
  DEFAULT_MOVEMENT_QUICKIE_CARDS,
} from "@/lib/movement-layout-defaults";
import { ensureMovementLayoutSeeded } from "@/lib/movement-layout";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET() {
  try {
    await ensureMovementLayoutSeeded();
    const [copyRow, heroTiles, quickieCards] = await Promise.all([
      prisma.movementLandingCopy.findUnique({ where: { id: "main" } }),
      prisma.movementHeroTile.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.movementQuickieCard.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    const copy = copyRow ?? DEFAULT_MOVEMENT_LANDING_COPY;
    const heroes = heroTiles.length ? heroTiles : DEFAULT_MOVEMENT_HERO_TILES;
    const quickies = quickieCards.length ? quickieCards : DEFAULT_MOVEMENT_QUICKIE_CARDS;
    return publicJson({
      copy: {
        justStartedTagline: copy.justStartedTagline,
        quickieIntro: copy.quickieIntro,
      },
      heroTiles: heroes.map((h) => ({
        id: h.id,
        title: h.title,
        subtitle: h.subtitle,
        imageUrl: h.imageUrl,
        videoUrl: h.videoUrl,
        sortOrder: h.sortOrder,
      })),
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
      heroTiles: DEFAULT_MOVEMENT_HERO_TILES,
      quickieCards: DEFAULT_MOVEMENT_QUICKIE_CARDS,
    });
  }
}
