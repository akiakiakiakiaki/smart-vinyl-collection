import { useEffect, useState } from 'react';
import { adaptReleaseDetail } from '@/lib/adapters/releaseDetailAdapter';
import { ReleaseDetailView } from '@/types/release';

export function useReleaseDetail(releaseId: string | null) {
  const [release, setRelease] = useState<ReleaseDetailView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!releaseId) return;

    const abortController = new AbortController();

    const fetchReleaseDetail = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/discogs/releases/${releaseId}`, {
          signal: abortController.signal,
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unknown error');
        }

        setRelease(adaptReleaseDetail(data.release));
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRelease(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReleaseDetail();

    return () => abortController.abort();
  }, [releaseId]);

  return {
    release,
    loading,
    error,
  };
}
