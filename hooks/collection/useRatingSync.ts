import { useEffect, useRef } from 'react';
import { useCollectionStore } from '@/store/useCollectionStore';
import { adaptCollectionReleases } from '@/lib/adapters/collectionAdapter';
import { CollectionOverviewRow } from '@/types/collection';
import { fetchCollectionRatingProgress, refreshCollectionRatings } from '@/lib/api/collectionApi';
import { RATE_LIMIT_PER_MINUTE, RATE_LIMIT_SAFETY_BUFFER, RATE_LIMIT_WINDOW_MS } from '@/lib/discogs/rateLimit';

export function useRatingSync(
  selectedFolder: string | null,
  rows: CollectionOverviewRow[],
  setRows: React.Dispatch<React.SetStateAction<CollectionOverviewRow[]>>
) {
  const refreshRatingsVersion = useCollectionStore((s) => s.refreshRatingsVersion);
  const cancelRefreshVersion = useCollectionStore((s) => s.cancelRefreshVersion);
  const setIsRefreshing = useCollectionStore((s) => s.setIsRefreshing);
  const setRatingSyncProgress = useCollectionStore((s) => s.setRatingSyncProgress);
  const setRatingSyncEtaSeconds = useCollectionStore((s) => s.setRatingSyncEtaSeconds);
  const tickRatingSyncEtaSeconds = useCollectionStore((s) => s.tickRatingSyncEtaSeconds);
  const resetRatingSyncProgress = useCollectionStore((s) => s.resetRatingSyncProgress);
  const markFolderCached = useCollectionStore((s) => s.markFolderCached);

  const requestAbortController = useRef<AbortController | null>(null);
  const handledRatingsRefreshVersion = useRef(0);

  useEffect(() => {
    requestAbortController.current?.abort();
  }, [cancelRefreshVersion]);

  useEffect(() => {
    if (!selectedFolder) return;
    if (refreshRatingsVersion <= handledRatingsRefreshVersion.current) return;

    handledRatingsRefreshVersion.current = refreshRatingsVersion;

    const refreshRatings = async () => {
      const abortController = new AbortController();
      requestAbortController.current = abortController;

      setIsRefreshing(true);

      const totalAtStart = getUniqueReleaseCountFromRows(rows);
      setRatingSyncProgress(0, totalAtStart);
      setRatingSyncEtaSeconds(estimateRatingSyncEtaSeconds(totalAtStart));

      const syncPollAbortController = new AbortController();

      const pollSyncProgress = async () => {
        try {
          const data = await fetchCollectionRatingProgress(selectedFolder, syncPollAbortController.signal);
          const total = getUniqueReleaseCount(data.releases ?? []);
          const fetched = Math.min(data.ratingSync?.fetched ?? 0, total);

          setRatingSyncProgress(fetched, total);
          const incoming = adaptCollectionReleases(data.releases ?? [], 'collectionOverview', {
            releaseDetailsByReleaseId: data.releaseDetailsByReleaseId ?? {},
          });

          setRows((prev) => mergeRows(prev, incoming));
        } catch {
          // ignore
        }
      };

      await pollSyncProgress();

      const etaIntervalId = setInterval(() => {
        tickRatingSyncEtaSeconds();
      }, 1000);

      const intervalId = setInterval(() => {
        void pollSyncProgress();
      }, 1000);

      try {
        const data = await refreshCollectionRatings(selectedFolder, abortController.signal);

        const incoming = adaptCollectionReleases(data.releases ?? [], 'collectionOverview', {
          releaseDetailsByReleaseId: data.releaseDetailsByReleaseId ?? {},
        });

        setRows((prev) => mergeRows(prev, incoming));
        markFolderCached(selectedFolder);

        const total = getUniqueReleaseCount(data.releases ?? []);
        const fetched = Math.min(data.ratingSync?.fetched ?? 0, total);

        setRatingSyncProgress(fetched, total);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        console.error(err);
      } finally {
        clearInterval(etaIntervalId);
        clearInterval(intervalId);
        syncPollAbortController.abort();

        if (requestAbortController.current === abortController) {
          requestAbortController.current = null;
        }

        setIsRefreshing(false);
        resetRatingSyncProgress();
      }
    };

    refreshRatings();
  }, [
    refreshRatingsVersion,
    selectedFolder,
    rows,
    markFolderCached,
    setIsRefreshing,
    setRatingSyncProgress,
    setRatingSyncEtaSeconds,
    tickRatingSyncEtaSeconds,
    resetRatingSyncProgress,
    setRows,
  ]);
}

function estimateRatingSyncEtaSeconds(remainingItems: number) {
  if (remainingItems <= 0) return 0;

  const requestsPerSecond = RATE_LIMIT_PER_MINUTE / 60;
  const baseSeconds = Math.ceil(remainingItems / requestsPerSecond);
  const safeRequestsPerWindow = Math.max(1, RATE_LIMIT_PER_MINUTE - RATE_LIMIT_SAFETY_BUFFER);
  const expectedCooldowns = Math.floor((remainingItems - 1) / safeRequestsPerWindow);
  const cooldownSeconds = Math.ceil((expectedCooldowns * RATE_LIMIT_WINDOW_MS) / 1000);

  return baseSeconds + cooldownSeconds;
}

function getUniqueReleaseCountFromRows(rows: CollectionOverviewRow[]) {
  return new Set(rows.map((row) => row.id)).size;
}

function getUniqueReleaseCount(releases: Array<{ basic_information?: { id?: number } }>) {
  const ids = new Set<number>();

  for (const release of releases) {
    const releaseId = release.basic_information?.id;

    if (typeof releaseId === 'number') {
      ids.add(releaseId);
    }
  }

  return ids.size;
}

function mergeRows(prev: CollectionOverviewRow[], incoming: CollectionOverviewRow[]): CollectionOverviewRow[] {
  const map = new Map<number, CollectionOverviewRow>();

  for (const row of prev) {
    map.set(row.id, row);
  }

  for (const row of incoming) {
    const existing = map.get(row.id);

    map.set(row.id, {
      ...existing,
      ...row,
      rating: row.rating ?? existing?.rating ?? null,
      lowestPrice: row.lowestPrice ?? existing?.lowestPrice ?? null,
      releaseDetailsLoaded: row.releaseDetailsLoaded || existing?.releaseDetailsLoaded || false,
    });
  }

  return Array.from(map.values());
}
