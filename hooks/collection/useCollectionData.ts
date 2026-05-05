import { useEffect, useState, useRef } from 'react';
import { useCollectionStore } from '@/store/useCollectionStore';
import { adaptCollectionReleases } from '@/lib/adapters/collectionAdapter';
import { CollectionOverviewRow } from '@/types/collection';

export function useCollectionData(selectedFolder: string | null) {
  const [rows, setRows] = useState<CollectionOverviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshReleasesVersion = useCollectionStore((s) => s.refreshReleasesVersion);
  const setIsLoading = useCollectionStore((s) => s.setIsLoading);
  const markFolderCached = useCollectionStore((s) => s.markFolderCached);
  const resetRatingSyncProgress = useCollectionStore((s) => s.resetRatingSyncProgress);

  const handledReleasesRefreshVersion = useRef(0);

  useEffect(() => {
    if (!selectedFolder) return;

    const fetchFromCache = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const res = await fetch(`/api/discogs?folder=${selectedFolder}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unknown error');
        }

        setRows(adaptCollectionReleases(data.releases ?? [], 'collectionOverview'));
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
        const res = await fetch(`/api/discogs?folder=${selectedFolder}&refresh=true`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unknown error');
        }

        setRows(adaptCollectionReleases(data.releases ?? [], 'collectionOverview'));
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
  };
}
