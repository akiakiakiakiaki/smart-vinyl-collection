import { DiscogsReleaseItem } from '@/types/discogs';
export {
  fetchReleaseRatingsBatch,
  getPendingRatingReleaseIds,
  RATING_SYNC_BATCH_SIZE,
} from '@/lib/sync/tasks/releaseRatingTask';

export function mergeRatingsIntoReleases(releases: DiscogsReleaseItem[], ratingsByReleaseId: Map<number, number>) {
  if (ratingsByReleaseId.size === 0) {
    return releases;
  }

  return releases.map((release) => {
    const releaseId = release.basic_information.id;

    if (!ratingsByReleaseId.has(releaseId)) {
      return release;
    }

    return {
      ...release,
      rating: ratingsByReleaseId.get(releaseId) ?? 0,
    };
  });
}
