import { CollectionResponse } from '@/types/api';
import { requestJson } from '@/lib/api/request';

export function fetchCollection(folder: string, options: { refresh?: boolean; signal?: AbortSignal } = {}) {
  const searchParams = new URLSearchParams({ folder });

  if (options.refresh) {
    searchParams.set('refresh', 'true');
  }

  return requestJson<CollectionResponse>(`/api/discogs?${searchParams.toString()}`, {
    signal: options.signal,
  });
}

export function fetchCollectionRatingProgress(folder: string, signal?: AbortSignal) {
  const searchParams = new URLSearchParams({ folder, progress: 'true' });

  return requestJson<CollectionResponse>(`/api/discogs?${searchParams.toString()}`, {
    signal,
  });
}

export function refreshCollectionRatings(folder: string, signal?: AbortSignal) {
  const searchParams = new URLSearchParams({ folder, refreshRatings: 'true' });

  return requestJson<CollectionResponse>(`/api/discogs?${searchParams.toString()}`, {
    signal,
  });
}
