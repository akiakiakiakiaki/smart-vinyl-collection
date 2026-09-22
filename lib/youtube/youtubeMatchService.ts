import { readYouTubeMatchCache, writeYouTubeMatchCache } from '@/lib/cache/youtubeMatchesCache';
import { getPlaylistTitles, getVideoId, searchYouTube, YouTubeApiError } from '@/lib/youtube/youtubeClient';
import {
  YouTubeEmbedMatch,
  YouTubeMatchResponse,
  YouTubeReleaseQuery,
} from '@/lib/youtube/youtubeTypes';

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function includesNormalized(text: string, value: string) {
  const normalizedText = normalize(text);
  const normalizedValue = normalize(value);
  return Boolean(normalizedValue) && normalizedText.includes(normalizedValue);
}

function isSingle(query: YouTubeReleaseQuery) {
  return query.trackTitles.length <= 2 || query.formats.some((format) => /single|7 inch|7"/i.test(format));
}

function scorePlaylist(title: string, query: YouTubeReleaseQuery, trackTitles: string[]) {
  const artistScore = includesNormalized(title, query.artists) ? 0.35 : 0;
  const releaseScore = includesNormalized(title, query.title) ? 0.45 : 0;
  const matchedTracks = query.trackTitles.filter((track) =>
    trackTitles.some((candidate) => includesNormalized(candidate, track) || includesNormalized(track, candidate))
  ).length;
  const trackScore = query.trackTitles.length ? (matchedTracks / query.trackTitles.length) * 0.2 : 0.2;

  return artistScore + releaseScore + trackScore;
}

async function findAlbumMatch(query: YouTubeReleaseQuery): Promise<YouTubeEmbedMatch | null> {
  const search = await searchYouTube(`${query.artists} ${query.title} official album`, 'playlist');
  const candidates = search.items?.filter((item) => item.id.kind === 'youtube#playlist' && item.id.playlistId) ?? [];
  let best: YouTubeEmbedMatch | null = null;

  for (const candidate of candidates) {
    const playlistId = candidate.id.playlistId;
    if (!playlistId) continue;
    const trackTitles = await getPlaylistTitles(playlistId);
    const confidence = scorePlaylist(candidate.snippet.title, query, trackTitles);

    if (confidence < 0.72 || (query.trackTitles.length > 0 && trackTitles.length === 0)) continue;
    if (!best || confidence > best.confidence) {
      best = {
        kind: 'playlist',
        title: candidate.snippet.title,
        playlistId,
        url: `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(playlistId)}`,
        confidence,
      };
    }
  }

  return best;
}

async function findSingleMatch(query: YouTubeReleaseQuery): Promise<YouTubeEmbedMatch | null> {
  const videoIds: string[] = [];
  let title = '';
  let confidence = 0;

  for (const trackTitle of query.trackTitles.slice(0, 2)) {
    const search = await searchYouTube(`${query.artists} ${trackTitle} official audio`, 'video');
    const candidate = search.items?.find((item) => {
      const videoId = getVideoId(item);
      return videoId && includesNormalized(item.snippet.title, trackTitle);
    });
    if (!candidate) continue;
    const videoId = candidate ? getVideoId(candidate) : null;

    if (!videoId) continue;
    if (!title) title = candidate.snippet.title;
    videoIds.push(videoId);
    confidence = Math.max(confidence, includesNormalized(candidate.snippet.title, query.artists) ? 0.9 : 0.75);
  }

  if (videoIds.length === 0 || confidence < 0.75) return null;
  const uniqueVideoIds = Array.from(new Set(videoIds));
  const [firstVideoId, ...playlistVideoIds] = uniqueVideoIds;

  return {
    kind: 'videos',
    title,
    videoIds: uniqueVideoIds,
    url: `https://www.youtube.com/embed/${firstVideoId}${playlistVideoIds.length ? `?playlist=${playlistVideoIds.join(',')}` : ''}`,
    confidence,
  };
}

export async function matchYouTubeRelease(query: YouTubeReleaseQuery): Promise<YouTubeMatchResponse> {
  const cached = await readYouTubeMatchCache(query.releaseId);
  if (cached) return cached;

  try {
    const match = isSingle(query) ? await findSingleMatch(query) : await findAlbumMatch(query);
    const result: YouTubeMatchResponse = match
      ? { status: 'matched', match }
      : { status: 'not-found', reason: 'no-match' };
    await writeYouTubeMatchCache(query.releaseId, result);
    return result;
  } catch (error) {
    if (error instanceof YouTubeApiError && error.status === 503 && error.message.includes('YOUTUBE_API_KEY')) {
      return { status: 'unavailable', reason: 'not-configured' };
    }
    return { status: 'unavailable', reason: 'api-error' };
  }
}
