import { NextResponse } from 'next/server';
import { readReleaseDetailsCache, writeReleaseDetailsCache } from '@/lib/cache/releaseDetailsCache';
import { DiscogsContext, getReleaseDetails as getReleaseDetailsClient } from '@/lib/discogs/client';
import { DiscogsUpstreamError } from '@/lib/discogs/errors';
import { DiscogsReleaseDetail } from '@/types/discogs';
import { readRatingsCache } from '@/lib/cache/ratingsCache';

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
    const userRating = params.username ? (await readRatingsCache(params.username))[releaseId] ?? null : null;

    if (!params.refresh) {
      const cached = await readReleaseDetailsCache(releaseId);

      if (cached) {
        return NextResponse.json({ release: cached, userRating });
      }
    }

    const release = (await getReleaseDetailsClient(releaseId, params.ctx, params.signal)) as DiscogsReleaseDetail;
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
