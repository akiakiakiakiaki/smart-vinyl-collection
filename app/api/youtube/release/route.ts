import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { matchYouTubeRelease } from '@/lib/youtube/youtubeMatchService';
import { YouTubeReleaseQuery } from '@/lib/youtube/youtubeTypes';

function isReleaseQuery(value: unknown): value is YouTubeReleaseQuery {
  if (!value || typeof value !== 'object') return false;
  const query = value as Record<string, unknown>;
  return (
    typeof query.releaseId === 'number' &&
    Number.isInteger(query.releaseId) &&
    query.releaseId > 0 &&
    typeof query.title === 'string' &&
    typeof query.artists === 'string' &&
    Array.isArray(query.trackTitles) &&
    query.trackTitles.every((track) => typeof track === 'string') &&
    Array.isArray(query.formats) &&
    query.formats.every((format) => typeof format === 'string')
  );
}

export async function POST(request: Request) {
  if (!(await getAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isReleaseQuery(body)) {
    return NextResponse.json({ error: 'Invalid release data' }, { status: 400 });
  }

  return NextResponse.json(await matchYouTubeRelease(body));
}
