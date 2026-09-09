import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useRatingSync } from '@/hooks/collection/useRatingSync';
import { fetchCollectionRatingProgress, refreshCollectionRatings } from '@/lib/api/collectionApi';
import { useCollectionStore } from '@/store/useCollectionStore';
import { CollectionOverviewRow } from '@/types/collection';

vi.mock('@/lib/api/collectionApi', () => ({
  fetchCollectionRatingProgress: vi.fn(),
  refreshCollectionRatings: vi.fn(),
}));

const progressMock = vi.mocked(fetchCollectionRatingProgress);
const refreshMock = vi.mocked(refreshCollectionRatings);

const rows: CollectionOverviewRow[] = [
  {
    id: 100,
    instanceId: 200,
    title: 'Test Album',
    displayTitle: 'Test Album',
    artist: 'Artist',
    year: 2026,
    dateAdded: '',
    formats: '',
    cover: null,
    rating: null,
    lowestPrice: null,
    releaseDetailsLoaded: false,
    labels: '',
    genres: '',
    styles: '',
  },
];

beforeEach(() => {
  useCollectionStore.setState({
    refreshRatingsVersion: 0,
    cancelRefreshVersion: 0,
    isRefreshing: false,
    ratingSyncFetched: 0,
    ratingSyncTotal: 0,
    ratingSyncEtaSeconds: 0,
    cachedFolders: {},
  });
  progressMock.mockResolvedValue({ releases: [], releaseDetailsByReleaseId: {} });
  refreshMock.mockResolvedValue({ releases: [], releaseDetailsByReleaseId: {}, ratingSync: { fetched: 0, total: 0 } });
});

describe('useRatingSync', () => {
  it('runs progress polling and rating refresh after being triggered', async () => {
    const setRows = vi.fn();
    renderHook(() => useRatingSync('CR', rows, setRows));

    useCollectionStore.getState().triggerRatingsRefresh();

    await waitFor(() => expect(refreshMock).toHaveBeenCalledWith('CR', expect.any(AbortSignal)));
    expect(progressMock).toHaveBeenCalledWith('CR', expect.any(AbortSignal));
    expect(useCollectionStore.getState().isRefreshing).toBe(false);
  });

  it('merges progress rows and final rating data', async () => {
    const setRows = vi.fn();
    progressMock.mockResolvedValue({
      releases: [{ id: 100, instance_id: 200, basic_information: { id: 100, title: 'Progress Album' }, rating: 3 }],
      releaseDetailsByReleaseId: {},
      ratingSync: { fetched: 1, total: 1 },
    });
    refreshMock.mockResolvedValue({
      releases: [{ id: 100, instance_id: 200, basic_information: { id: 100, title: 'Final Album' }, rating: 5 }],
      releaseDetailsByReleaseId: {},
      ratingSync: { fetched: 1, total: 1 },
    });

    renderHook(() => useRatingSync('CR', rows, setRows));
    act(() => useCollectionStore.getState().triggerRatingsRefresh());

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(progressMock).toHaveBeenCalled();
    expect(setRows).toHaveBeenCalled();
    expect(useCollectionStore.getState().cachedFolders.CR).toBe(true);
  });

  it('cleans up state when rating refresh fails', async () => {
    const setRows = vi.fn();
    refreshMock.mockRejectedValue(new Error('Rating refresh failed'));

    renderHook(() => useRatingSync('CR', rows, setRows));
    act(() => useCollectionStore.getState().triggerRatingsRefresh());

    await waitFor(() => expect(useCollectionStore.getState().isRefreshing).toBe(false));
    expect(useCollectionStore.getState().ratingSyncFetched).toBe(0);
    expect(useCollectionStore.getState().ratingSyncTotal).toBe(0);
  });

  it('aborts an active refresh when cancellation is triggered', async () => {
    const setRows = vi.fn();
    let refreshSignal: AbortSignal | undefined;
    refreshMock.mockImplementation((_folder, signal) => {
      refreshSignal = signal;
      return new Promise((_, reject) => {
        signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      });
    });

    renderHook(() => useRatingSync('CR', rows, setRows));
    act(() => useCollectionStore.getState().triggerRatingsRefresh());
    await waitFor(() => expect(refreshSignal).toBeDefined());

    act(() => useCollectionStore.getState().cancelRefresh());

    await waitFor(() => expect(refreshSignal?.aborted).toBe(true));
    await waitFor(() => expect(useCollectionStore.getState().isRefreshing).toBe(false));
  });

  it('ticks the ETA and polls progress while the refresh is running', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const setRows = vi.fn();
      let resolveRefresh: (value: Awaited<ReturnType<typeof refreshCollectionRatings>>) => void = () => undefined;
      refreshMock.mockImplementation(
        () => new Promise((resolve) => {
          resolveRefresh = resolve;
        })
      );

      renderHook(() => useRatingSync('CR', rows, setRows));
      act(() => useCollectionStore.getState().triggerRatingsRefresh());

      await waitFor(() => expect(progressMock).toHaveBeenCalledTimes(1));
      const etaBeforeTick = useCollectionStore.getState().ratingSyncEtaSeconds;

      act(() => vi.advanceTimersByTime(1000));

      expect(progressMock).toHaveBeenCalledTimes(2);
      expect(useCollectionStore.getState().ratingSyncEtaSeconds).toBeLessThan(etaBeforeTick);

      act(() => resolveRefresh({ releases: [], releaseDetailsByReleaseId: {}, ratingSync: { fetched: 0, total: 0 } }));
      await waitFor(() => expect(useCollectionStore.getState().isRefreshing).toBe(false));
    } finally {
      vi.useRealTimers();
    }
  });

  it('preserves existing row values when progress data omits them', async () => {
    const setRows = vi.fn();
    progressMock.mockResolvedValue({
      releases: [{ id: 100, instance_id: 200, basic_information: { id: 100, title: 'Updated' } }],
      releaseDetailsByReleaseId: {},
      ratingSync: { fetched: 1, total: 1 },
    });

    renderHook(() => useRatingSync('CR', [{ ...rows[0], rating: 4, lowestPrice: 12, releaseDetailsLoaded: true }], setRows));
    act(() => useCollectionStore.getState().triggerRatingsRefresh());

    await waitFor(() => expect(setRows).toHaveBeenCalled());
    const updater = setRows.mock.calls[0][0] as (previous: CollectionOverviewRow[]) => CollectionOverviewRow[];
    expect(updater([{ ...rows[0], rating: 4, lowestPrice: 12, releaseDetailsLoaded: true }])[0]).toMatchObject({
      rating: 4,
      lowestPrice: 12,
      releaseDetailsLoaded: true,
    });
  });
});
