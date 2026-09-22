import {
  YouTubePlaylistItemsResponse,
  YouTubeSearchResponse,
  YouTubeSearchItem,
} from '@/lib/youtube/youtubeTypes';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export class YouTubeApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'YouTubeApiError';
  }
}

function getApiKey() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YouTubeApiError(503, 'Missing YOUTUBE_API_KEY');
  }
  return apiKey;
}

async function getJson<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${YOUTUBE_API_URL}/${path}?${searchParams}`, {
    signal,
    headers: { 'x-goog-api-key': getApiKey() },
  });

  const data: unknown = await response.json();
  if (!response.ok) {
    const errorData = data && typeof data === 'object' && 'error' in data ? data.error : null;
    const message = errorData && typeof errorData === 'object' && errorData && 'message' in errorData
      ? String(errorData.message)
      : 'YouTube API request failed';
    throw new YouTubeApiError(response.status, message);
  }

  return data as T;
}

export function searchYouTube(
  query: string,
  type: 'video' | 'playlist',
  signal?: AbortSignal
): Promise<YouTubeSearchResponse> {
  return getJson<YouTubeSearchResponse>('search', {
    part: 'snippet',
    q: query,
    type,
    maxResults: '5',
    ...(type === 'video' ? { videoEmbeddable: 'true', videoSyndicated: 'true' } : {}),
  }, signal);
}

export async function getPlaylistTitles(playlistId: string, signal?: AbortSignal): Promise<string[]> {
  const data = await getJson<YouTubePlaylistItemsResponse>('playlistItems', {
    part: 'snippet',
    playlistId,
    maxResults: '50',
  }, signal);

  return (data.items ?? [])
    .map((item) => item.snippet?.title ?? '')
    .filter(Boolean);
}

export function getVideoId(item: YouTubeSearchItem) {
  return item.id.kind === 'youtube#video' ? item.id.videoId ?? null : null;
}
