import { afterAll, describe, expect, it } from 'vitest';
import { invalidateFoldersCache, readFoldersCache, writeFoldersCache } from '@/lib/cache/foldersCache';

const testUser = `vitest-cache-${process.pid}`;

afterAll(async () => {
  await invalidateFoldersCache(testUser);
});

describe('foldersCache', () => {
  it('writes and reads a fresh folder cache', async () => {
    const folders = { folders: [{ id: 123, name: 'Test Folder' }] };

    await writeFoldersCache(testUser, folders);

    await expect(readFoldersCache(testUser)).resolves.toEqual(folders);
  });

  it('returns null when the cache is older than the requested max age', async () => {
    await writeFoldersCache(testUser, { folders: [{ id: 123, name: 'Test Folder' }] });

    await expect(readFoldersCache(testUser, -1)).resolves.toBeNull();
  });

  it('can invalidate the cache', async () => {
    await writeFoldersCache(testUser, { folders: [] });
    await invalidateFoldersCache(testUser);

    await expect(readFoldersCache(testUser)).resolves.toBeNull();
  });
});
