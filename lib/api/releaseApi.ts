import { ReleaseDetailResponse } from '@/types/api';
import { requestJson } from '@/lib/api/request';

export function fetchReleaseDetail(
  releaseId: string | number,
  options: { refresh?: boolean; signal?: AbortSignal } = {}
) {
  const searchParams = new URLSearchParams();

  if (options.refresh) {
    searchParams.set('refresh', 'true');
  }

  const queryString = searchParams.toString();

  return requestJson<ReleaseDetailResponse>(`/api/discogs/releases/${releaseId}${queryString ? `?${queryString}` : ''}`, {
    signal: options.signal,
  });
}
