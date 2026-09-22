import fs from 'fs/promises';
import path from 'path';
import { YouTubeMatchResponse } from '@/lib/youtube/youtubeTypes';

const DEFAULT_YOUTUBE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_BASE = path.join(process.cwd(), '.cache', 'youtube-matches');

function getCacheTtlMs() {
  const configuredTtl = Number(process.env.YOUTUBE_CACHE_TTL_MS);
  return Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : DEFAULT_YOUTUBE_CACHE_TTL_MS;
}

function getFilePath(releaseId: number) {
  return path.join(CACHE_BASE, `${releaseId}.json`);
}

export async function readYouTubeMatchCache(releaseId: number): Promise<YouTubeMatchResponse | null> {
  try {
    const filePath = getFilePath(releaseId);
    const stats = await fs.stat(filePath);
    if (Date.now() - stats.mtimeMs > getCacheTtlMs()) return null;
    return JSON.parse(await fs.readFile(filePath, 'utf-8')) as YouTubeMatchResponse;
  } catch {
    return null;
  }
}

export async function writeYouTubeMatchCache(releaseId: number, data: YouTubeMatchResponse) {
  const filePath = getFilePath(releaseId);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
