import fs from 'fs/promises';
import path from 'path';
import { CollectionsCacheData } from '@/types/cache';

const CACHE_BASE = path.join(process.cwd(), '.cache', 'discogs-collections');

function getFilePath(user: string, folder: string) {
  return path.join(CACHE_BASE, user, `${folder}.json`);
}

export async function readCollectionsCache(user: string, folder: string) {
  try {
    const filePath = getFilePath(user, folder);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeCollectionsCache(user: string, folder: string, data: CollectionsCacheData) {
  const filePath = getFilePath(user, folder);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
