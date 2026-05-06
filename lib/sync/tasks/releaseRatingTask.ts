import { createDisconnectDatabase } from '@/lib/discogs/disconnectClient';
import { shouldPauseForRateLimit, waitForRateLimitWindow } from '@/lib/discogs/rateLimit';
import { DiscogsReleaseItem } from '@/types/discogs';

export const RATING_SYNC_BATCH_SIZE = 5;

export function getPendingRatingReleaseIds(
  releases: DiscogsReleaseItem[],
  fetchedReleaseIds: number[],
  batchSize = RATING_SYNC_BATCH_SIZE
) {
  const fetched = new Set(fetchedReleaseIds);
  const uniqueReleaseIds = new Set<number>();

  for (const release of releases) {
    uniqueReleaseIds.add(release.basic_information.id);
  }

  return Array.from(uniqueReleaseIds)
    .filter((releaseId) => !fetched.has(releaseId))
    .slice(0, batchSize);
}

export async function fetchReleaseRatingsBatch(params: {
  releaseIds: number[];
  username: string;
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  signal?: AbortSignal;
}) {
  const { releaseIds, username, consumerKey, consumerSecret, token, tokenSecret, signal } = params;

  if (releaseIds.length === 0) {
    return new Map<number, number>();
  }

  const database = createDisconnectDatabase({ consumerKey, consumerSecret, token, tokenSecret });
  const results = new Map<number, number>();

  for (const releaseId of releaseIds) {
    if (signal?.aborted) {
      break;
    }

    const { rating, remaining } = await new Promise<{ rating: number; remaining: number | null }>((resolve, reject) => {
      database.getReleaseRating(releaseId, username, (err, data, rateLimit) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          rating: typeof data?.rating === 'number' ? data.rating : 0,
          remaining: rateLimit?.remaining ?? null,
        });
      });
    });

    console.info('[discogs-rating]', {
      releaseId,
      rating,
      rateLimitRemaining: remaining,
    });

    results.set(releaseId, rating);

    if (signal?.aborted) {
      break;
    }

    if (shouldPauseForRateLimit(remaining)) {
      await waitForRateLimitWindow(signal);
    }
  }

  return results;
}
