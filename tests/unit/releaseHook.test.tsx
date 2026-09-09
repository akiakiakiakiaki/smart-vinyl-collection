import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReleaseDetail } from '@/hooks/releases/useReleaseDetail';
import { fetchReleaseDetail } from '@/lib/api/releaseApi';
import { useReleaseStore } from '@/store/useReleaseStore';

vi.mock('@/lib/api/releaseApi', () => ({
  fetchReleaseDetail: vi.fn(),
}));

const fetchReleaseDetailMock = vi.mocked(fetchReleaseDetail);

beforeEach(() => {
  useReleaseStore.setState({ refreshVersions: {}, refreshingReleaseIds: {} });
  fetchReleaseDetailMock.mockReset();
});

describe('useReleaseDetail', () => {
  it('loads and adapts release details', async () => {
    fetchReleaseDetailMock.mockResolvedValue({
      release: { id: 100, title: 'Test Album', released: '2026-01-01' },
      userRating: 4,
    });

    const { result } = renderHook(() => useReleaseDetail('100'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.release).toMatchObject({ id: 100, title: 'Test Album', year: 2026, userRating: 4 });
    expect(result.current.error).toBeNull();
    expect(fetchReleaseDetailMock).toHaveBeenCalledWith('100', expect.objectContaining({ refresh: false }));
  });

  it('requests a fresh release after a refresh is triggered', async () => {
    fetchReleaseDetailMock.mockResolvedValue({ release: { id: 100, title: 'Test Album' }, userRating: null });
    const { result } = renderHook(() => useReleaseDetail('100'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    useReleaseStore.getState().triggerReleaseRefresh('100');

    await waitFor(() =>
      expect(fetchReleaseDetailMock).toHaveBeenCalledWith('100', expect.objectContaining({ refresh: true }))
    );
    expect(fetchReleaseDetailMock).toHaveBeenLastCalledWith('100', expect.objectContaining({ refresh: true }));
  });

  it('exposes release loading errors', async () => {
    fetchReleaseDetailMock.mockRejectedValue(new Error('Release unavailable'));

    const { result } = renderHook(() => useReleaseDetail('100'));

    await waitFor(() => expect(result.current.error).toBe('Release unavailable'));

    expect(result.current.release).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('ignores aborted release requests', async () => {
    const abortError = Object.assign(new Error('Request aborted'), { name: 'AbortError' });
    fetchReleaseDetailMock.mockRejectedValue(abortError);

    const { result } = renderHook(() => useReleaseDetail('100'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.release).toBeNull();
  });
});
