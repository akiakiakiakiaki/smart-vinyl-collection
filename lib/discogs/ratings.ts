import { DiscogsReleaseItem } from '@/types/discogs';
import Discogs from 'disconnect';

const DISCogs_USER_AGENT = process.env.DISCOGS_USER_AGENT || 'smart-vinyl-collection/0.1.0';
export const RATE_LIMIT_PER_MINUTE = 60;
export const RATE_LIMIT_SAFETY_BUFFER = 2;
export const RATE_LIMIT_WINDOW_MS = 15_000;

type DisconnectClientInstance = {
  database: () => {
    getReleaseRating: (
      releaseId: number,
      username: string,
      callback: (
        err: Error | null,
        data: { rating?: number } | null,
        rateLimit?: { limit: number; used: number; remaining: number } | null
      ) => void
    ) => void;
  };
};

type DisconnectClientConstructor = new (
  userAgent: string,
  auth: {
    method: 'oauth';
    level: 2;
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
  }
) => DisconnectClientInstance;

const DiscogsClient = Discogs.Client as DisconnectClientConstructor;

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

  const client = new DiscogsClient(DISCogs_USER_AGENT, {
    method: 'oauth',
    level: 2,
    consumerKey,
    consumerSecret,
    token,
    tokenSecret,
  });

  const database = client.database();
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

    if (remaining !== null && remaining <= RATE_LIMIT_SAFETY_BUFFER) {
      await waitForRateLimitWindow(signal);
    }
  }

  return results;
}

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

async function waitForRateLimitWindow(signal?: AbortSignal) {
  if (signal?.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, RATE_LIMIT_WINDOW_MS);

    const onAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
      resolve();
    };

    signal?.addEventListener('abort', onAbort);
  });
}
