import fs from 'fs/promises';
import path from 'path';
import { ReleaseDetailsCacheData } from '@/types/cache';

const CACHE_BASE = path.join(process.cwd(), '.cache', 'discogs-releases');

function getFilePath(releaseId: number) {
  return path.join(CACHE_BASE, `${releaseId}.json`);
}

export async function readReleaseDetailsCache(releaseId: number): Promise<ReleaseDetailsCacheData | null> {
  try {
    const filePath = getFilePath(releaseId);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeReleaseDetailsCache(releaseId: number, data: ReleaseDetailsCacheData) {
  const filePath = getFilePath(releaseId);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readReleaseDetailsCaches(releaseIds: number[]): Promise<Record<number, ReleaseDetailsCacheData>> {
  const uniqueReleaseIds = Array.from(new Set(releaseIds));
  const entries = await Promise.all(
    uniqueReleaseIds.map(async (releaseId) => {
      const release = await readReleaseDetailsCache(releaseId);
      return [releaseId, release] as const;
    })
  );

  const cachedReleases: Record<number, ReleaseDetailsCacheData> = {};

  for (const [releaseId, release] of entries) {
    if (release) {
      cachedReleases[releaseId] = release;
    }
  }

  return cachedReleases;
}
