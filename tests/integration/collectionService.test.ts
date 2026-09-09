import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscogsUpstreamError } from '@/lib/discogs/errors';
import { getCollection, getFolders } from '@/lib/services/collectionService';
import { getFolders as getFoldersClient, getFolderReleasesPage } from '@/lib/discogs/client';
import { readCollectionsCache, writeCollectionsCache } from '@/lib/cache/collectionsCache';
import { invalidateFoldersCache, readFoldersCache, writeFoldersCache } from '@/lib/cache/foldersCache';
import { readRatingsCache } from '@/lib/cache/ratingsCache';
import { fetchReleaseRatingsBatch, getPendingRatingReleaseIds, mergeRatingsIntoReleases } from '@/lib/discogs/ratings';
import { mergeRatingsCache } from '@/lib/cache/ratingsCache';

vi.mock('@/lib/discogs/client', () => ({
  getFolders: vi.fn(),
  getFolderReleasesPage: vi.fn(),
}));

vi.mock('@/lib/cache/collectionsCache', () => ({
  readCollectionsCache: vi.fn(),
  writeCollectionsCache: vi.fn(),
}));

vi.mock('@/lib/cache/foldersCache', () => ({
  invalidateFoldersCache: vi.fn(),
  readFoldersCache: vi.fn(),
  writeFoldersCache: vi.fn(),
}));

vi.mock('@/lib/cache/ratingsCache', () => ({
  readRatingsCache: vi.fn(),
  mergeRatingsCache: vi.fn(),
}));

vi.mock('@/lib/collection/buildCollectionResponse', () => ({
  buildCollectionResponse: vi.fn(async ({ releases, folders }) => ({
    ...(folders ? { folders } : {}),
    releases,
    releaseDetailsByReleaseId: {},
  })),
}));

vi.mock('@/lib/discogs/ratings', () => ({
  fetchReleaseRatingsBatch: vi.fn(),
  getPendingRatingReleaseIds: vi.fn(() => []),
  mergeRatingsIntoReleases: vi.fn((releases) => releases),
}));

const getFoldersClientMock = vi.mocked(getFoldersClient);
const getFolderReleasesPageMock = vi.mocked(getFolderReleasesPage);
const readCollectionsCacheMock = vi.mocked(readCollectionsCache);
const writeCollectionsCacheMock = vi.mocked(writeCollectionsCache);
const invalidateFoldersCacheMock = vi.mocked(invalidateFoldersCache);
const readFoldersCacheMock = vi.mocked(readFoldersCache);
const writeFoldersCacheMock = vi.mocked(writeFoldersCache);
const readRatingsCacheMock = vi.mocked(readRatingsCache);
const mergeRatingsCacheMock = vi.mocked(mergeRatingsCache);
const fetchReleaseRatingsBatchMock = vi.mocked(fetchReleaseRatingsBatch);
const getPendingRatingReleaseIdsMock = vi.mocked(getPendingRatingReleaseIds);
const mergeRatingsIntoReleasesMock = vi.mocked(mergeRatingsIntoReleases);

const ctx = {
  consumerKey: 'key',
  consumerSecret: 'secret',
  token: 'token',
  tokenSecret: 'token-secret',
};

beforeEach(() => {
  vi.clearAllMocks();
  readFoldersCacheMock.mockResolvedValue(null);
  writeFoldersCacheMock.mockResolvedValue(undefined);
  readRatingsCacheMock.mockResolvedValue({});
  writeCollectionsCacheMock.mockResolvedValue(undefined);
  mergeRatingsCacheMock.mockResolvedValue(undefined);
  fetchReleaseRatingsBatchMock.mockResolvedValue(new Map());
  getPendingRatingReleaseIdsMock.mockReturnValue([]);
  mergeRatingsIntoReleasesMock.mockImplementation((releases) => releases);
});

describe('getCollection', () => {
  it('returns cached folders without calling Discogs', async () => {
    const cached = { folders: [{ id: 123, name: 'CR' }] };
    readFoldersCacheMock.mockResolvedValue(cached);

    await expect(getFolders('tester', ctx)).resolves.toEqual(cached);

    expect(getFoldersClientMock).not.toHaveBeenCalled();
    expect(writeFoldersCacheMock).not.toHaveBeenCalled();
  });

  it('force-refreshes folders and writes the upstream result', async () => {
    const folders = { folders: [{ id: 123, name: 'CR' }] };
    getFoldersClientMock.mockResolvedValue(folders);

    await expect(getFolders('tester', ctx, { forceRefresh: true })).resolves.toEqual(folders);

    expect(readFoldersCacheMock).not.toHaveBeenCalled();
    expect(getFoldersClientMock).toHaveBeenCalledWith('tester', ctx);
    expect(writeFoldersCacheMock).toHaveBeenCalledWith('tester', folders);
  });

  it('serves a fresh collection cache without fetching releases', async () => {
    const cached = {
      releases: [],
      syncedAt: new Date().toISOString(),
      folderId: 123,
    };
    readCollectionsCacheMock.mockResolvedValue(cached);
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'CR' }] });

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: false,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(200);
    expect(getFolderReleasesPageMock).not.toHaveBeenCalled();
  });

  it('invalidates the folder cache when Discogs rejects the folder id', async () => {
    readCollectionsCacheMock.mockResolvedValue({ releases: [], syncedAt: new Date().toISOString() });
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'Jorge' }] });
    getFolderReleasesPageMock.mockRejectedValue(new DiscogsUpstreamError('Request failed: 404', 404));

    const response = await getCollection({
      username: 'tester',
      folderName: 'Jorge',
      progress: false,
      refresh: true,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ folderDeleted: true });
    expect(invalidateFoldersCacheMock).toHaveBeenCalledWith('tester');
  });

  it('returns 404 when a requested folder is not in the refreshed folder index', async () => {
    readCollectionsCacheMock.mockResolvedValue(null);
    getFoldersClientMock.mockResolvedValue({ folders: [] });

    const response = await getCollection({
      username: 'tester',
      folderName: 'Missing',
      progress: false,
      refresh: true,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Folder "Missing" not found' });
    expect(getFolderReleasesPageMock).not.toHaveBeenCalled();
  });

  it('returns progress data from the collection cache', async () => {
    const releases = [{ id: 100, basic_information: { id: 100, title: 'Test' } }];
    readCollectionsCacheMock.mockResolvedValue({ releases, ratingSync: { fetched: 1, total: 1 } });
    readRatingsCacheMock.mockResolvedValue({ 100: 5 });

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: true,
      refresh: false,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(200);
    expect(readRatingsCacheMock).toHaveBeenCalledWith('tester');
    expect(mergeRatingsIntoReleasesMock).toHaveBeenCalledWith(releases, new Map([[100, 5]]));
    expect(getFoldersClientMock).not.toHaveBeenCalled();
  });

  it('refreshes pending ratings from the collection cache', async () => {
    const releases = [{ id: 100, basic_information: { id: 100, title: 'Test' } }];
    readCollectionsCacheMock.mockResolvedValue({ releases, syncedAt: new Date().toISOString(), folderId: 123 });
    getPendingRatingReleaseIdsMock.mockReturnValueOnce([100]).mockReturnValue([]);
    fetchReleaseRatingsBatchMock.mockResolvedValue(new Map([[100, 5]]));
    readRatingsCacheMock.mockResolvedValue({});
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'CR' }] });

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: false,
      refreshRatings: true,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(200);
    expect(fetchReleaseRatingsBatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ releaseIds: [100], username: 'tester', signal: expect.any(AbortSignal) })
    );
    expect(mergeRatingsCacheMock).toHaveBeenCalledWith('tester', { 100: 5 });
    expect(writeCollectionsCacheMock).toHaveBeenCalled();
  });

  it('does not start rating work when the refresh signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const releases = [{ id: 100, basic_information: { id: 100, title: 'Test' } }];
    readCollectionsCacheMock.mockResolvedValue({ releases });
    getPendingRatingReleaseIdsMock.mockReturnValue([100]);
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'CR' }] });

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: false,
      refreshRatings: true,
      ctx,
      signal: controller.signal,
    });

    expect(response.status).toBe(200);
    expect(fetchReleaseRatingsBatchMock).not.toHaveBeenCalled();
  });

  it('fetches all release pages and stores synchronization metadata', async () => {
    const firstRelease = { id: 100, basic_information: { id: 100, title: 'First' } };
    const secondRelease = { id: 200, basic_information: { id: 200, title: 'Second' } };
    readCollectionsCacheMock.mockResolvedValue(null);
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'CR' }] });
    getFolderReleasesPageMock
      .mockResolvedValueOnce({ releases: [firstRelease], pagination: { pages: 2 } })
      .mockResolvedValueOnce({ releases: [secondRelease], pagination: { pages: 2 } });

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: true,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.releases).toEqual([firstRelease, secondRelease]);
    expect(getFolderReleasesPageMock).toHaveBeenNthCalledWith(1, 'tester', 123, 1, ctx, 100, expect.any(AbortSignal));
    expect(getFolderReleasesPageMock).toHaveBeenNthCalledWith(2, 'tester', 123, 2, ctx, 100, expect.any(AbortSignal));
    expect(writeCollectionsCacheMock).toHaveBeenCalledWith(
      'tester',
      'CR',
      expect.objectContaining({ folderId: 123, syncedAt: expect.any(String), releases: [firstRelease, secondRelease] })
    );
  });

  it('converts non-Discogs errors into a 500 response', async () => {
    readCollectionsCacheMock.mockResolvedValue(null);
    getFoldersClientMock.mockRejectedValue(new Error('network unavailable'));

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: true,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch folders' });
  });

  it('returns an upstream error when a release page fails unexpectedly', async () => {
    readCollectionsCacheMock.mockResolvedValue(null);
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'CR' }] });
    getFolderReleasesPageMock.mockRejectedValue(new DiscogsUpstreamError('Rate limited', 429, { message: 'Wait' }));

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: true,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: 'Rate limited', upstream: { message: 'Wait' } });
  });

  it('returns a generic error for unknown failures in the collection service', async () => {
    readCollectionsCacheMock.mockResolvedValue(null);
    getFoldersClientMock.mockResolvedValue({ folders: [{ id: 123, name: 'CR' }] });
    getFolderReleasesPageMock.mockRejectedValue('unexpected failure');

    const response = await getCollection({
      username: 'tester',
      folderName: 'CR',
      progress: false,
      refresh: true,
      refreshRatings: false,
      ctx,
      signal: new AbortController().signal,
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch Discogs data' });
  });
});
