import { NextResponse } from 'next/server';
import { readReleaseDetailsCache, writeReleaseDetailsCache } from '@/lib/cache/releaseDetailsCache';
import { DiscogsContext, getReleaseDetails as getReleaseDetailsClient } from '@/lib/discogs/client';
import { DiscogsUpstreamError } from '@/lib/discogs/errors';
import { DiscogsReleaseDetail } from '@/types/discogs';
import { mergeRatingsCache, readRatingsCache } from '@/lib/cache/ratingsCache';
import { fetchReleaseRatingsBatch } from '@/lib/sync/tasks/releaseRatingTask';

function parseReleaseId(value: string) {
  const releaseId = Number(value);

  if (!Number.isInteger(releaseId) || releaseId <= 0) {
    return null;
  }

  return releaseId;
}

export async function getReleaseDetail(params: {
  releaseId: string;
  username: string | null;
  refresh: boolean;
  ctx: DiscogsContext;
  signal: AbortSignal;
}) {
  const releaseId = parseReleaseId(params.releaseId);

  if (!releaseId) {
    return NextResponse.json({ error: 'Invalid release id' }, { status: 400 });
  }

  try {
    const userRatingPromise = getUserRatingForRelease({
      releaseId,
      username: params.username,
      refresh: params.refresh,
      ctx: params.ctx,
      signal: params.signal,
    });

    if (!params.refresh) {
      const cached = await readReleaseDetailsCache(releaseId);

      if (cached) {
        const userRating = await userRatingPromise;
        return NextResponse.json({ release: cached, userRating });
      }
    }

    const [release, userRating] = await Promise.all([
      getReleaseDetailsClient(releaseId, params.ctx, params.signal) as Promise<DiscogsReleaseDetail>,
      userRatingPromise,
    ]);
    await writeReleaseDetailsCache(releaseId, release);

    return NextResponse.json({ release, userRating });
  } catch (err) {
    if (err instanceof DiscogsUpstreamError) {
      return NextResponse.json({ error: err.message, upstream: err.upstream ?? null }, { status: err.status });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch Discogs release details' }, { status: 500 });
  }
}

async function getUserRatingForRelease(params: {
  releaseId: number;
  username: string | null;
  refresh: boolean;
  ctx: DiscogsContext;
  signal: AbortSignal;
}) {
  if (!params.username) {
    return null;
  }

  if (!params.refresh) {
    return readCachedUserRating(params.username, params.releaseId);
  }

  try {
    const ratings = await fetchReleaseRatingsBatch({
      releaseIds: [params.releaseId],
      username: params.username,
      consumerKey: params.ctx.consumerKey,
      consumerSecret: params.ctx.consumerSecret,
      token: params.ctx.token,
      tokenSecret: params.ctx.tokenSecret,
      signal: params.signal,
    });

    await mergeRatingsCache(params.username, Object.fromEntries(ratings));

    return ratings.get(params.releaseId) ?? null;
  } catch (err) {
    console.warn('[release-rating-refresh-failed]', {
      releaseId: params.releaseId,
      error: err instanceof Error ? err.message : 'Unknown error',
    });

    return readCachedUserRating(params.username, params.releaseId);
  }
}

async function readCachedUserRating(username: string, releaseId: number) {
  const ratings = await readRatingsCache(username);
  return ratings[releaseId] ?? null;
}
