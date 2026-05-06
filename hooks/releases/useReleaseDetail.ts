import { useEffect, useRef, useState } from 'react';
import { adaptReleaseDetail } from '@/lib/adapters/releaseDetailAdapter';
import { ReleaseDetailView } from '@/types/release';
import { useReleaseStore } from '@/store/useReleaseStore';
import { fetchReleaseDetail } from '@/lib/api/releaseApi';

export function useReleaseDetail(releaseId: string | null) {
  const [release, setRelease] = useState<ReleaseDetailView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshVersion = useReleaseStore((s) => (releaseId ? (s.refreshVersions[releaseId] ?? 0) : 0));
  const setReleaseRefreshing = useReleaseStore((s) => s.setReleaseRefreshing);
  const activeReleaseId = useRef<string | null>(null);
  const handledRefreshVersion = useRef(0);

  useEffect(() => {
    if (!releaseId) return;

    if (activeReleaseId.current !== releaseId) {
      activeReleaseId.current = releaseId;
      handledRefreshVersion.current = refreshVersion;
    }

    const refresh = refreshVersion > handledRefreshVersion.current;
    handledRefreshVersion.current = refreshVersion;

    const abortController = new AbortController();

    const loadReleaseDetail = async () => {
      setLoading(true);
      if (refresh) {
        setReleaseRefreshing(releaseId, true);
      }

      try {
        const data = await fetchReleaseDetail(releaseId, {
          refresh,
          signal: abortController.signal,
        });

        setRelease(adaptReleaseDetail(data.release, { userRating: data.userRating ?? null }));
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRelease(null);
      } finally {
        setLoading(false);
        if (refresh) {
          setReleaseRefreshing(releaseId, false);
        }
      }
    };

    loadReleaseDetail();

    return () => abortController.abort();
  }, [releaseId, refreshVersion, setReleaseRefreshing]);

  return {
    release,
    loading,
    error,
  };
}
