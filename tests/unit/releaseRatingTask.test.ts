import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDisconnectDatabase } from '@/lib/discogs/disconnectClient';
import { fetchReleaseRatingsBatch } from '@/lib/sync/tasks/releaseRatingTask';

vi.mock('@/lib/discogs/disconnectClient', () => ({
  createDisconnectDatabase: vi.fn(),
}));

vi.mock('@/lib/discogs/rateLimit', () => ({
  shouldPauseForRateLimit: vi.fn((remaining: number | null) => remaining !== null && remaining <= 2),
  waitForRateLimitWindow: vi.fn().mockResolvedValue(undefined),
}));

const createDisconnectDatabaseMock = vi.mocked(createDisconnectDatabase);

const params = {
  releaseIds: [100, 200],
  username: 'tester',
  consumerKey: 'key',
  consumerSecret: 'secret',
  token: 'token',
  tokenSecret: 'token-secret',
};

beforeEach(() => vi.clearAllMocks());

describe('fetchReleaseRatingsBatch', () => {
  it('returns an empty map without creating a Discogs client for no ids', async () => {
    await expect(fetchReleaseRatingsBatch({ ...params, releaseIds: [] })).resolves.toEqual(new Map());
    expect(createDisconnectDatabaseMock).not.toHaveBeenCalled();
  });

  it('fetches ratings sequentially and normalizes missing ratings to zero', async () => {
    const getReleaseRating = vi
      .fn()
      .mockImplementationOnce((_id, _username, callback) => callback(null, { rating: 4 }, { remaining: 10 }))
      .mockImplementationOnce((_id, _username, callback) => callback(null, {}, { remaining: 9 }));
    createDisconnectDatabaseMock.mockReturnValue({ getReleaseRating });

    await expect(fetchReleaseRatingsBatch(params)).resolves.toEqual(
      new Map([
        [100, 4],
        [200, 0],
      ])
    );
    expect(getReleaseRating).toHaveBeenNthCalledWith(1, 100, 'tester', expect.any(Function));
    expect(getReleaseRating).toHaveBeenNthCalledWith(2, 200, 'tester', expect.any(Function));
  });

  it('waits when the remaining rate limit reaches the safety buffer', async () => {
    const getReleaseRating = vi.fn((_id, _username, callback) => callback(null, { rating: 3 }, { remaining: 2 }));
    createDisconnectDatabaseMock.mockReturnValue({ getReleaseRating });

    await fetchReleaseRatingsBatch({ ...params, releaseIds: [100] });

    const { waitForRateLimitWindow } = await import('@/lib/discogs/rateLimit');
    expect(waitForRateLimitWindow).toHaveBeenCalledOnce();
  });

  it('stops without fetching further ratings after cancellation', async () => {
    const controller = new AbortController();
    const getReleaseRating = vi.fn((_id, _username, callback) => {
      callback(null, { rating: 3 }, { remaining: 10 });
      controller.abort();
    });
    createDisconnectDatabaseMock.mockReturnValue({ getReleaseRating });

    await expect(fetchReleaseRatingsBatch({ ...params, signal: controller.signal })).resolves.toEqual(new Map([[100, 3]]));
    expect(getReleaseRating).toHaveBeenCalledOnce();
  });

  it('rejects when the database reports an error', async () => {
    const getReleaseRating = vi.fn((_id, _username, callback) => callback(new Error('Discogs unavailable'), null));
    createDisconnectDatabaseMock.mockReturnValue({ getReleaseRating });

    await expect(fetchReleaseRatingsBatch({ ...params, releaseIds: [100] })).rejects.toThrow('Discogs unavailable');
  });
});
