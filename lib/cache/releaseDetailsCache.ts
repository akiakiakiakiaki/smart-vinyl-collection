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
