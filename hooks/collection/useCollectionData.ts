import { useCallback, useEffect, useState, useRef } from 'react';
import { useCollectionStore } from '@/store/useCollectionStore';
import { adaptCollectionReleases } from '@/lib/adapters/collectionAdapter';
import { CollectionOverviewRow } from '@/types/collection';
import { fetchCollection } from '@/lib/api/collectionApi';
import { fetchReleaseDetail } from '@/lib/api/releaseApi';

export function useCollectionData(selectedFolder: string | null) {
  const [rows, setRows] = useState<CollectionOverviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshReleasesVersion = useCollectionStore((s) => s.refreshReleasesVersion);
  const setIsLoading = useCollectionStore((s) => s.setIsLoading);
  const markFolderCached = useCollectionStore((s) => s.markFolderCached);
  const resetRatingSyncProgress = useCollectionStore((s) => s.resetRatingSyncProgress);

  const handledReleasesRefreshVersion = useRef(0);

  const fetchReleaseDetails = useCallback(async (releaseId: number) => {
    const data = await fetchReleaseDetail(releaseId);

    setRows((prev) =>
      prev.map((row) =>
        row.id === releaseId
          ? {
              ...row,
              lowestPrice: data.release?.lowest_price ?? null,
              releaseDetailsLoaded: true,
            }
          : row
      )
    );
  }, []);

  useEffect(() => {
    if (!selectedFolder) return;

    const fetchFromCache = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const data = await fetchCollection(selectedFolder);

        setRows(
          adaptCollectionReleases(data.releases ?? [], 'collectionOverview', {
            releaseDetailsByReleaseId: data.releaseDetailsByReleaseId ?? {},
          })
        );
        markFolderCached(selectedFolder);
        resetRatingSyncProgress();
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRows([]);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchFromCache();
  }, [selectedFolder, markFolderCached, setIsLoading, resetRatingSyncProgress]);

  useEffect(() => {
    if (!selectedFolder) return;
    if (refreshReleasesVersion <= handledReleasesRefreshVersion.current) return;

    handledReleasesRefreshVersion.current = refreshReleasesVersion;

    const refreshReleases = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const data = await fetchCollection(selectedFolder, { refresh: true });

        setRows(
          adaptCollectionReleases(data.releases ?? [], 'collectionOverview', {
            releaseDetailsByReleaseId: data.releaseDetailsByReleaseId ?? {},
          })
        );
        markFolderCached(selectedFolder);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    refreshReleases();
  }, [refreshReleasesVersion, selectedFolder, markFolderCached, setIsLoading]);

  return {
    rows,
    setRows,
    loading,
    error,
    fetchReleaseDetails,
  };
}
