import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MOVEMENT_HERO_TILES,
  DEFAULT_MOVEMENT_LANDING_COPY,
  DEFAULT_MOVEMENT_QUICKIE_CARDS,
} from "@/lib/movement-layout-defaults";
import type {
  MovementHeroTileDTO,
  MovementLandingCopyDTO,
  MovementLayoutDTO,
  MovementQuickieCardDTO,
} from "@/lib/movement-layout-types";

function mapCopy(row: {
  justStartedTagline: string;
  quickieIntro: string;
}): MovementLandingCopyDTO {
  return {
    justStartedTagline: row.justStartedTagline,
    quickieIntro: row.quickieIntro,
  };
}

function mapHero(row: {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkHref: string;
  sortOrder: number;
}): MovementHeroTileDTO {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    linkHref: row.linkHref,
    sortOrder: row.sortOrder,
  };
}

function mapQuickie(row: {
  id: string;
  title: string;
  metaLine: string;
  imageUrl: string;
  summary: string;
  linkHref: string;
  sortOrder: number;
}): MovementQuickieCardDTO {
  return {
    id: row.id,
    title: row.title,
    metaLine: row.metaLine,
    imageUrl: row.imageUrl,
    summary: row.summary,
    linkHref: row.linkHref,
    sortOrder: row.sortOrder,
  };
}

export async function ensureMovementLayoutSeeded(): Promise<void> {
  try {
    await prisma.movementLandingCopy.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        justStartedTagline: DEFAULT_MOVEMENT_LANDING_COPY.justStartedTagline,
        quickieIntro: DEFAULT_MOVEMENT_LANDING_COPY.quickieIntro,
      },
      update: {},
    });

    const nH = await prisma.movementHeroTile.count();
    if (nH === 0) {
      await prisma.movementHeroTile.createMany({
        data: DEFAULT_MOVEMENT_HERO_TILES.map((row, i) => ({
          title: row.title,
          subtitle: row.subtitle,
          imageUrl: row.imageUrl,
          linkHref: row.linkHref,
          sortOrder: i,
        })),
      });
    }

    const nQ = await prisma.movementQuickieCard.count();
    if (nQ === 0) {
      await prisma.movementQuickieCard.createMany({
        data: DEFAULT_MOVEMENT_QUICKIE_CARDS.map((row, i) => ({
          title: row.title,
          metaLine: row.metaLine,
          imageUrl: row.imageUrl,
          summary: row.summary,
          linkHref: row.linkHref,
          sortOrder: i,
        })),
      });
    }
  } catch {
    /* ignore */
  }
}

async function loadMovementLayout(): Promise<MovementLayoutDTO> {
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

  const copy = copyRow
    ? mapCopy(copyRow)
    : DEFAULT_MOVEMENT_LANDING_COPY;

  return {
    copy,
    heroTiles: heroTiles.length ? heroTiles.map(mapHero) : DEFAULT_MOVEMENT_HERO_TILES,
    quickieCards: quickieCards.length ? quickieCards.map(mapQuickie) : DEFAULT_MOVEMENT_QUICKIE_CARDS,
  };
}

export async function getMovementLayoutForDisplay(): Promise<MovementLayoutDTO> {
  try {
    return await loadMovementLayout();
  } catch {
    return {
      copy: DEFAULT_MOVEMENT_LANDING_COPY,
      heroTiles: DEFAULT_MOVEMENT_HERO_TILES,
      quickieCards: DEFAULT_MOVEMENT_QUICKIE_CARDS,
    };
  }
}

export async function getMovementLayoutForAdmin(): Promise<MovementLayoutDTO> {
  return getMovementLayoutForDisplay();
}
