import fs from 'fs/promises';
import path from 'path';
import { RatingsCacheData } from '@/types/cache';

const CACHE_BASE = path.join(process.cwd(), '.cache', 'discogs-ratings');

function getFilePath(user: string) {
  return path.join(CACHE_BASE, `${user}.json`);
}

export async function readRatingsCache(user: string): Promise<RatingsCacheData> {
  try {
    const filePath = getFilePath(user);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function writeRatingsCache(user: string, ratings: RatingsCacheData) {
  const filePath = getFilePath(user);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(ratings, null, 2), 'utf-8');
}

export async function mergeRatingsCache(user: string, newRatings: RatingsCacheData) {
  const existing = await readRatingsCache(user);
  const merged = { ...existing, ...newRatings };
  await writeRatingsCache(user, merged);
}
