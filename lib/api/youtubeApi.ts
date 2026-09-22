import { requestJson } from '@/lib/api/request';
import { YouTubeMatchResponse, YouTubeReleaseQuery } from '@/lib/youtube/youtubeTypes';

export function fetchYouTubeMatch(query: YouTubeReleaseQuery, signal?: AbortSignal) {
  return requestJson<YouTubeMatchResponse>('/api/youtube/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
    signal,
  });
}
