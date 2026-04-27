export type MovementLandingCopyDTO = {
  justStartedTagline: string;
  quickieIntro: string;
};

export type MovementHeroCollectionItemDTO = {
  id: string;
  heroTileId: string;
  dayIndex: number;
  title: string;
  imageUrl: string;
  videoUrl: string;
  sortOrder: number;
};

export type MovementHeroTileDTO = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl: string;
  sortOrder: number;
  /** Collection entries (e.g. Day 1..Day 6). When non-empty, these render as the
   *  "Just Getting Started" 3×2 grid directly on the Movement tab; otherwise the tile falls
   *  back to its legacy single-video button layout (older CMS data). */
  items: MovementHeroCollectionItemDTO[];
};

export type MovementQuickieCardDTO = {
  id: string;
  title: string;
  metaLine: string;
  imageUrl: string;
  summary: string;
  videoUrl: string;
  sortOrder: number;
};

export type MovementLayoutDTO = {
  copy: MovementLandingCopyDTO;
  heroTiles: MovementHeroTileDTO[];
  quickieCards: MovementQuickieCardDTO[];
};
