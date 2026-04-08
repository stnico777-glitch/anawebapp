export type MovementLandingCopyDTO = {
  justStartedTagline: string;
  quickieIntro: string;
};

export type MovementHeroTileDTO = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl: string;
  sortOrder: number;
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
