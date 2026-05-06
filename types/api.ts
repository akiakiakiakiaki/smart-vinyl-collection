import { DiscogsFolder, DiscogsReleaseDetail, DiscogsReleaseItem } from '@/types/discogs';
import { CollectionsCacheData } from '@/types/cache';

export type ApiErrorResponse = {
  error: string;
  upstream?: unknown;
};

export type CollectionResponse = {
  folders?: DiscogsFolder[];
  releases: DiscogsReleaseItem[];
  releaseDetailsByReleaseId: Record<number, DiscogsReleaseDetail>;
  ratingSync?: CollectionsCacheData['ratingSync'];
};

export type ReleaseDetailResponse = {
  release: DiscogsReleaseDetail;
  userRating: number | null;
};
