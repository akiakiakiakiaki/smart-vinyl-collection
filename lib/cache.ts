import fs from 'fs/promises';
import path from 'path';
import { DiscogsCacheData } from '../../types/cache';

const CACHE_BASE = path.join(process.cwd(), '.cache', 'discogs');

function getFilePath(user: string, folder: string) {
  return path.join(CACHE_BASE, user, `${folder}.json`);
}

export async function readCache(user: string, folder: string) {
  try {
    const filePath = getFilePath(user, folder);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeCache(user: string, folder: string, data: DiscogsCacheData) {
  const filePath = getFilePath(user, folder);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
