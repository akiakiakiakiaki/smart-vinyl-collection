import { afterAll, describe, expect, it } from 'vitest';
import { invalidateFoldersCache } from '@/lib/cache/foldersCache';
import { readCollectionsCache, writeCollectionsCache } from '@/lib/cache/collectionsCache';
import { mergeRatingsCache, readRatingsCache, writeRatingsCache } from '@/lib/cache/ratingsCache';

const testUser = `vitest-cache-files-${process.pid}`;

afterAll(async () => {
  await invalidateFoldersCache(testUser);
});

describe('cache file helpers', () => {
  it('writes and reads collection cache data', async () => {
    const cache = { releases: [], syncedAt: new Date().toISOString(), folderId: 123 };

    await writeCollectionsCache(testUser, 'test', cache);

    await expect(readCollectionsCache(testUser, 'test')).resolves.toEqual(cache);
  });

  it('returns null for a missing collection cache', async () => {
    await expect(readCollectionsCache(testUser, 'missing')).resolves.toBeNull();
  });

  it('writes and merges rating cache data', async () => {
    await writeRatingsCache(testUser, { 100: 3 });
    await mergeRatingsCache(testUser, { 200: 5 });

    await expect(readRatingsCache(testUser)).resolves.toEqual({ 100: 3, 200: 5 });
  });
});
