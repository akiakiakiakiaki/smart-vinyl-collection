import { DiscogsReleaseDetail, DiscogsReleaseItem } from './discogs';

export type CollectionsCacheData = {
  releases: DiscogsReleaseItem[];
  syncedAt?: string;
  folderId?: number;
  ratingSync?: {
    fetched: number;
    total: number;
  };
};

export type RatingsCacheData = Record<number, number>;

export type ReleaseDetailsCacheData = DiscogsReleaseDetail;
