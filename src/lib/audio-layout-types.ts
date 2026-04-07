export type AudioCollectionCardDTO = {
  id: string;
  title: string;
  metaLine: string;
  imageUrl: string;
  summary: string;
  linkHref: string;
  sortOrder: number;
};

export type AudioEssentialTileDTO = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkHref: string;
  sortOrder: number;
};

export type MusicSpotlightAlbumDTO = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  listenUrl: string | null;
  sortOrder: number;
};
