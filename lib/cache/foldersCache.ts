import fs from 'fs/promises';
import path from 'path';
import { DiscogsFoldersResponse } from '@/types/discogs';

const CACHE_BASE = path.join(process.cwd(), '.cache', 'discogs-folders');

function getFilePath(user: string) {
  return path.join(CACHE_BASE, `${user}.json`);
}

export async function readFoldersCache(user: string): Promise<DiscogsFoldersResponse | null> {
  try {
    const filePath = getFilePath(user);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeFoldersCache(user: string, data: DiscogsFoldersResponse) {
  const filePath = getFilePath(user);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
