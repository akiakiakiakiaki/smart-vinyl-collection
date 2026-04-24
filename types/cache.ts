import { DiscogsReleaseItem } from './discogs';

export type CollectionsCacheData = {
  releases: DiscogsReleaseItem[];
  ratingSync?: {
    fetched: number;
    total: number;
  };
};

export type RatingsCacheData = Record<number, number>;
