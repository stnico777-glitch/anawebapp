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
  videoUrl: string;
  sortOrder: number;
}): MovementHeroTileDTO {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl ?? "",
    sortOrder: row.sortOrder,
  };
}

function mapQuickie(row: {
  id: string;
  title: string;
  metaLine: string;
  imageUrl: string;
  summary: string;
  videoUrl: string;
  sortOrder: number;
}): MovementQuickieCardDTO {
  return {
    id: row.id,
    title: row.title,
    metaLine: row.metaLine,
    imageUrl: row.imageUrl,
    summary: row.summary,
    videoUrl: row.videoUrl ?? "",
    sortOrder: row.sortOrder,
  };
}

/**
 * Ensures the singleton landing-copy row exists (taglines for Movement tab).
 * Does **not** insert hero tiles or quickie cards — those are CMS-managed; inserting defaults
 * on every read was undoing deletes when a section was emptied.
 */
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
  } catch {
    /* ignore */
  }
}

/**
 * Inserts default hero/quickie rows only when tables are empty. Used by `prisma/seed` (and
 * optional one-off setup), **not** on every public page load — that previously re-created rows
 * after admins deleted them.
 */
export async function seedMovementHeroAndQuickieIfEmpty(): Promise<void> {
  try {
    const nH = await prisma.movementHeroTile.count();
    if (nH === 0) {
      await prisma.movementHeroTile.createMany({
        data: DEFAULT_MOVEMENT_HERO_TILES.map((row, i) => ({
          title: row.title,
          subtitle: row.subtitle,
          imageUrl: row.imageUrl,
          videoUrl: row.videoUrl,
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
          videoUrl: row.videoUrl,
          sortOrder: i,
        })),
      });
    }
  } catch {
    /* ignore */
  }
}

async function loadMovementLayout(options: { forAdmin: boolean }): Promise<MovementLayoutDTO> {
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

  const copy = copyRow ? mapCopy(copyRow) : DEFAULT_MOVEMENT_LANDING_COPY;

  if (options.forAdmin) {
    return {
      copy,
      heroTiles: heroTiles.map(mapHero),
      quickieCards: quickieCards.map(mapQuickie),
    };
  }

  return {
    copy,
    heroTiles: heroTiles.length ? heroTiles.map(mapHero) : DEFAULT_MOVEMENT_HERO_TILES,
    quickieCards: quickieCards.length ? quickieCards.map(mapQuickie) : DEFAULT_MOVEMENT_QUICKIE_CARDS,
  };
}

export async function getMovementLayoutForDisplay(): Promise<MovementLayoutDTO> {
  try {
    return await loadMovementLayout({ forAdmin: false });
  } catch {
    return {
      copy: DEFAULT_MOVEMENT_LANDING_COPY,
      heroTiles: DEFAULT_MOVEMENT_HERO_TILES,
      quickieCards: DEFAULT_MOVEMENT_QUICKIE_CARDS,
    };
  }
}

/** CMS: reflects DB exactly (empty rails stay empty). Member display still uses defaults when DB has no rows. */
export async function getMovementLayoutForAdmin(): Promise<MovementLayoutDTO> {
  return await loadMovementLayout({ forAdmin: true });
}
