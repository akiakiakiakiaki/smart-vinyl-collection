import fs from 'fs/promises';
import path from 'path';
import { afterAll, describe, expect, it } from 'vitest';
import { readCollectionsCache } from '@/lib/cache/collectionsCache';
import {
  readReleaseDetailsCache,
  readReleaseDetailsCaches,
  writeReleaseDetailsCache,
} from '@/lib/cache/releaseDetailsCache';
import { readRatingsCache } from '@/lib/cache/ratingsCache';

const testUser = `vitest-cache-edge-${process.pid}`;
const releaseId = 900000 + process.pid;
const collectionsPath = path.join(process.cwd(), '.cache', 'discogs-collections', testUser, 'invalid.json');
const releasePath = path.join(process.cwd(), '.cache', 'discogs-releases', `${releaseId}.json`);
const missingReleaseId = releaseId + 1;

afterAll(async () => {
  await Promise.all([
    fs.rm(path.dirname(collectionsPath), { recursive: true, force: true }),
    fs.rm(releasePath, { force: true }),
    fs.rm(path.join(process.cwd(), '.cache', 'discogs-releases', `${missingReleaseId}.json`), { force: true }),
  ]);
});

describe('cache edge cases', () => {
  it('returns null for malformed collection cache JSON', async () => {
    await fs.mkdir(path.dirname(collectionsPath), { recursive: true });
    await fs.writeFile(collectionsPath, '{invalid-json', 'utf-8');

    await expect(readCollectionsCache(testUser, 'invalid')).resolves.toBeNull();
  });

  it('returns null for a missing ratings cache', async () => {
    await expect(readRatingsCache(`missing-ratings-${process.pid}`)).resolves.toEqual({});
  });

  it('reads fresh release details and rejects expired details', async () => {
    const release = { id: releaseId, title: 'Cached Release' };
    await writeReleaseDetailsCache(releaseId, release);

    await expect(readReleaseDetailsCache(releaseId, 60_000)).resolves.toEqual(release);
    await expect(readReleaseDetailsCache(releaseId, -1)).resolves.toBeNull();
  });

  it('deduplicates release ids and excludes missing or expired entries', async () => {
    const release = { id: releaseId, title: 'Cached Release' };
    await writeReleaseDetailsCache(releaseId, release);

    await expect(readReleaseDetailsCaches([releaseId, releaseId, missingReleaseId])).resolves.toEqual({
      [releaseId]: release,
    });
  });
});
