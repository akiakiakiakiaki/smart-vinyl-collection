import {
  DiscogsArtist,
  DiscogsReleaseItem,
  DiscogsReleasesResponse,
  DiscogsFolder,
  DiscogsFoldersResponse,
} from '@/app/types/discogs';
import { NextResponse } from 'next/server';
import { readCache, writeCache } from '@/app/lib/cache';
import { DiscogsCacheData } from '@/app/types/cache';
import { RecordItem } from '@/app/types/collection';

function buildDiscogsUrl(path: string, params?: Record<string, string | number>) {
  const baseUrl = process.env.DISCOGS_API_URL;

  if (!baseUrl) {
    throw new Error('Missing DISCOGS_API_URL in .env.local');
  }

  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderName = searchParams.get('folder') || 'CR';
  const refresh = searchParams.get('refresh') === 'true';

  const token = process.env.DISCOGS_USER_TOKEN;
  const username = process.env.DISCOGS_USER_NAME;

  if (!token) {
    return NextResponse.json({ error: 'Missing DISCOGS_USER_TOKEN in .env.local' }, { status: 500 });
  }

  if (!username) {
    return NextResponse.json({ error: 'Missing DISCOGS_USER_NAME in .env.local' }, { status: 500 });
  }

  try {
    // --- 1. Folders holen ---
    const foldersRes = await fetch(buildDiscogsUrl(`users/${username}/collection/folders`), {
      headers: {
        Authorization: `Discogs token=${token}`,
      },
    });

    if (!foldersRes.ok) {
      throw new Error(`Folders request failed: ${foldersRes.status}`);
    }

    const foldersData: DiscogsFoldersResponse = await foldersRes.json();

    const selectedFolder = foldersData.folders.find((f: DiscogsFolder) => f.name === folderName);

    if (!selectedFolder) {
      return NextResponse.json({ error: `Folder "${folderName}" not found` }, { status: 404 });
    }

    // --- Cache check ---
    if (!refresh) {
      const cached = await readCache(username, folderName);

      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // --- 2. Releases holen (mit Pagination) ---
    let page = 1;
    let totalPages = 1;
    let allReleases: DiscogsReleaseItem[] = [];

    do {
      const releasesRes = await fetch(
        buildDiscogsUrl(`users/${username}/collection/folders/${selectedFolder.id}/releases`, { per_page: 100, page }),
        {
          headers: {
            Authorization: `Discogs token=${token}`,
          },
        }
      );

      if (!releasesRes.ok) {
        throw new Error(`Releases request failed: ${releasesRes.status}`);
      }

      const releasesData: DiscogsReleasesResponse = await releasesRes.json();

      allReleases = allReleases.concat(releasesData.releases);

      totalPages = releasesData.pagination.pages;
      page++;

      // Safety limit
      if (page > 50) break;
    } while (page <= totalPages);

    const mapped: RecordItem[] = allReleases.map((item: DiscogsReleaseItem): RecordItem => {
      const r = item.basic_information;

      return {
        id: r.id,
        title: r.title ?? 'Unknown Title',
        artist: r.artists?.map((a: DiscogsArtist) => a.name).join(', ') ?? 'Unknown Artist',
        year: r.year ?? null,
        cover: r.cover_image ?? null,
      };
    });

    const responseData: DiscogsCacheData = {
      folders: foldersData.folders,
      records: mapped,
    };

    await writeCache(username, folderName, responseData);

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('Discogs API error:', err);

    return NextResponse.json({ error: 'Failed to fetch Discogs data' }, { status: 500 });
  }
}
