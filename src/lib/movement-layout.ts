import { prisma } from "@/lib/prisma";
import {
  DEFAULT_BEGINNER_PILATES_ITEMS,
  DEFAULT_MOVEMENT_HERO_TILES,
  DEFAULT_MOVEMENT_LANDING_COPY,
  DEFAULT_MOVEMENT_QUICKIE_CARDS,
} from "@/lib/movement-layout-defaults";
import type {
  MovementHeroCollectionItemDTO,
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

function mapCollectionItem(row: {
  id: string;
  heroTileId: string;
  dayIndex: number;
  title: string;
  imageUrl: string;
  videoUrl: string;
  sortOrder: number;
}): MovementHeroCollectionItemDTO {
  return {
    id: row.id,
    heroTileId: row.heroTileId,
    dayIndex: row.dayIndex,
    title: row.title,
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl ?? "",
    sortOrder: row.sortOrder,
  };
}

function mapHero(row: {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl: string;
  sortOrder: number;
  items?: {
    id: string;
    heroTileId: string;
    dayIndex: number;
    title: string;
    imageUrl: string;
    videoUrl: string;
    sortOrder: number;
  }[];
}): MovementHeroTileDTO {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl ?? "",
    sortOrder: row.sortOrder,
    items: (row.items ?? []).map(mapCollectionItem),
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
      /** One hero tile by design (the Beginner Pilates collection). Item rows are inserted
       *  below inside a short sequential loop so we get the tile ids to link against. */
      for (const tile of DEFAULT_MOVEMENT_HERO_TILES) {
        const created = await prisma.movementHeroTile.create({
          data: {
            title: tile.title,
            subtitle: tile.subtitle,
            imageUrl: tile.imageUrl,
            videoUrl: tile.videoUrl,
            sortOrder: tile.sortOrder,
          },
        });
        if (tile.items.length > 0) {
          await prisma.movementHeroCollectionItem.createMany({
            data: tile.items.map((item) => ({
              heroTileId: created.id,
              dayIndex: item.dayIndex,
              title: item.title,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              sortOrder: item.sortOrder,
            })),
          });
        }
      }
    } else {
      /** Backfill: if a tile exists but has no items (e.g. after the schema migration),
       *  seed the default 6-day Beginner Pilates set onto the first tile. Keeps the
       *  live environment functional without requiring a manual CMS pass. */
      const firstTile = await prisma.movementHeroTile.findFirst({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });
      if (firstTile) {
        const existingItems = await prisma.movementHeroCollectionItem.count({
          where: { heroTileId: firstTile.id },
        });
        if (existingItems === 0) {
          await prisma.movementHeroCollectionItem.createMany({
            data: DEFAULT_BEGINNER_PILATES_ITEMS.map((item) => ({
              heroTileId: firstTile.id,
              dayIndex: item.dayIndex,
              title: item.title,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              sortOrder: item.sortOrder,
            })),
          });
        }
      }
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

/** CMS: reflects DB exactly (empty rails stay empty). Member display still uses defaults when DB has no rows.
 *  Admins always get a singleton hero tile scaffolded so "Add day" has a parent to attach to — the
 *  parent tile's metadata (title/subtitle/image) is no longer surfaced in the UI, but it remains the
 *  FK anchor for collection items. */
export async function getMovementLayoutForAdmin(): Promise<MovementLayoutDTO> {
  await ensureSingletonHeroTile();
  return await loadMovementLayout({ forAdmin: true });
}

/** Ensures the singleton hero tile that owns the Just Getting Started collection items exists.
 *  Called from admin "Add day" flows so the FK anchor is always available even if the table was
 *  cleared by a previous admin. Returns the tile id to attach new items to. */
export async function ensureSingletonHeroTile(): Promise<string | null> {
  try {
    const existing = await prisma.movementHeroTile.findFirst({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    });
    if (existing) return existing.id;
    const seed = DEFAULT_MOVEMENT_HERO_TILES[0];
    if (!seed) return null;
    const created = await prisma.movementHeroTile.create({
      data: {
        title: seed.title,
        subtitle: seed.subtitle,
        imageUrl: seed.imageUrl,
        videoUrl: seed.videoUrl,
        sortOrder: seed.sortOrder,
      },
      select: { id: true },
    });
    return created.id;
  } catch {
    return null;
  }
}
