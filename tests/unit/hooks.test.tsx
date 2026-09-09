import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCollectionData } from '@/hooks/collection/useCollectionData';
import { fetchCollection } from '@/lib/api/collectionApi';
import { fetchReleaseDetail } from '@/lib/api/releaseApi';
import { useCollectionStore } from '@/store/useCollectionStore';

vi.mock('@/lib/api/collectionApi', () => ({
  fetchCollection: vi.fn(),
}));

vi.mock('@/lib/api/releaseApi', () => ({
  fetchReleaseDetail: vi.fn(),
}));

const fetchCollectionMock = vi.mocked(fetchCollection);
const fetchReleaseDetailMock = vi.mocked(fetchReleaseDetail);

beforeEach(() => {
  useCollectionStore.setState({
    selectedFolder: '',
    refreshReleasesVersion: 0,
    refreshRatingsVersion: 0,
    cancelRefreshVersion: 0,
    isLoading: false,
    isRefreshing: false,
    ratingSyncFetched: 0,
    ratingSyncTotal: 0,
    ratingSyncEtaSeconds: 0,
    cachedFolders: {},
  });
  fetchCollectionMock.mockReset();
  fetchReleaseDetailMock.mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe('useCollectionData', () => {
  it('loads and adapts collection data', async () => {
    fetchCollectionMock.mockResolvedValue({
      releases: [
        {
          id: 100,
          instance_id: 200,
          basic_information: { id: 100, title: 'Test Album', artists: [{ name: 'Artist' }] },
        },
      ],
      releaseDetailsByReleaseId: {},
    });

    const { result } = renderHook(() => useCollectionData('CR'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rows[0]).toMatchObject({ title: 'Test Album', artist: 'Artist' });
    expect(result.current.error).toBeNull();
    expect(useCollectionStore.getState().cachedFolders.CR).toBe(true);
  });

  it('clears a deleted folder without showing a generic error', async () => {
    const deletedFolderError = Object.assign(new Error('Folder no longer exists'), {
      status: 404,
      data: { folderDeleted: true },
    });
    fetchCollectionMock.mockRejectedValue(deletedFolderError);

    const invalidated = vi.fn();
    window.addEventListener('discogs-folders-invalidated', invalidated);

    const { result } = renderHook(() => useCollectionData('Deleted'));

    await waitFor(() => expect(useCollectionStore.getState().selectedFolder).toBe(''));

    expect(result.current.error).toBeNull();
    expect(result.current.rows).toEqual([]);
    expect(invalidated).toHaveBeenCalledOnce();
    window.removeEventListener('discogs-folders-invalidated', invalidated);
  });

  it('requests a fresh collection and exposes refresh errors', async () => {
    fetchCollectionMock.mockResolvedValue({ releases: [], releaseDetailsByReleaseId: {} });

    const { result } = renderHook(() => useCollectionData('CR'));
    await waitFor(() => expect(fetchCollectionMock).toHaveBeenCalledWith('CR'));

    fetchCollectionMock.mockRejectedValue(new Error('Refresh failed'));

    act(() => useCollectionStore.getState().triggerReleasesRefresh());

    await waitFor(() => expect(result.current.error).toBe('Refresh failed'));
    expect(fetchCollectionMock).toHaveBeenLastCalledWith('CR', { refresh: true });
    expect(result.current.loading).toBe(false);
  });

  it('loads fresh collection data when a release refresh is triggered', async () => {
    fetchCollectionMock
      .mockResolvedValueOnce({ releases: [], releaseDetailsByReleaseId: {} })
      .mockResolvedValueOnce({
        releases: [
          {
            id: 101,
            instance_id: 201,
            basic_information: { id: 101, title: 'Refreshed Album' },
          },
        ],
        releaseDetailsByReleaseId: {},
      });

    const { result } = renderHook(() => useCollectionData('CR'));
    await waitFor(() => expect(fetchCollectionMock).toHaveBeenCalledWith('CR'));

    act(() => useCollectionStore.getState().triggerReleasesRefresh());

    await waitFor(() => expect(result.current.rows[0]?.title).toBe('Refreshed Album'));
    expect(fetchCollectionMock).toHaveBeenLastCalledWith('CR', { refresh: true });
    expect(useCollectionStore.getState().cachedFolders.CR).toBe(true);
  });

  it('clears a deleted folder during a release refresh', async () => {
    fetchCollectionMock.mockResolvedValueOnce({ releases: [], releaseDetailsByReleaseId: {} });
    const { result } = renderHook(() => useCollectionData('CR'));
    await waitFor(() => expect(fetchCollectionMock).toHaveBeenCalledWith('CR'));

    const invalidated = vi.fn();
    window.addEventListener('discogs-folders-invalidated', invalidated);
    fetchCollectionMock.mockRejectedValueOnce(
      Object.assign(new Error('Folder deleted'), { status: 404, data: { folderDeleted: true } })
    );

    act(() => useCollectionStore.getState().triggerReleasesRefresh());

    await waitFor(() => expect(result.current.rows).toEqual([]));
    expect(result.current.error).toBeNull();
    expect(invalidated).toHaveBeenCalledOnce();
    window.removeEventListener('discogs-folders-invalidated', invalidated);
  });

  it('uses a fallback message for non-Error collection failures', async () => {
    fetchCollectionMock.mockRejectedValue('unexpected failure');

    const { result } = renderHook(() => useCollectionData('CR'));

    await waitFor(() => expect(result.current.error).toBe('Unknown error'));
    expect(result.current.rows).toEqual([]);
  });
});
