import { afterAll, describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { readYouTubeMatchCache, writeYouTubeMatchCache } from '@/lib/cache/youtubeMatchesCache';

const releaseId = 900000 + process.pid;
const filePath = path.join(process.cwd(), '.cache', 'youtube-matches', `${releaseId}.json`);

afterAll(async () => {
  await fs.rm(filePath, { force: true });
});

describe('YouTube match cache', () => {
  it('writes and reads a match result', async () => {
    const result = { status: 'not-found' as const, reason: 'no-match' as const };

    await writeYouTubeMatchCache(releaseId, result);

    await expect(readYouTubeMatchCache(releaseId)).resolves.toEqual(result);
  });
});
