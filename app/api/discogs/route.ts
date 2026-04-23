import {
  DiscogsReleaseItem,
  DiscogsReleasesResponse,
  DiscogsFolder,
  DiscogsFoldersResponse,
} from '@/app/types/discogs';
import { NextResponse } from 'next/server';
import { readCache, writeCache } from '@/app/lib/cache';
import { DiscogsCacheData } from '@/app/types/cache';

import { buildOAuthHeader } from '@/app/lib/discogsOauth';
import { adaptCollectionReleases } from '@/app/lib/collectionAdapter';
import { getAuth } from '@/app/lib/auth';

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

function hasUsableCache(data: DiscogsCacheData | null) {
  if (!data) {
    return false;
  }

  return Array.isArray(data.folders) && Array.isArray(data.releases);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderName = searchParams.get('folder') || 'CR';
  const refresh = searchParams.get('refresh') === 'true';

  const auth = await getAuth();

  const isIdentityRequest = searchParams.get('identity') === 'true';

  if (isIdentityRequest && !auth) {
    return NextResponse.json({
      username: null,
      name: null,
      avatar_url: null,
    });
  }

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, secret: tokenSecret } = auth;

  const consumerKey = process.env.DISCOGS_CONSUMER_KEY!;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET!;

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json({ error: 'Missing OAuth consumer keys in .env.local' }, { status: 500 });
  }

  async function fetchIdentity(auth: { token: string; secret: string }) {
    const identityUrl = buildDiscogsUrl('oauth/identity');

    const identityRes = await fetch(identityUrl, {
      headers: {
        Authorization: buildOAuthHeader({
          method: 'GET',
          url: identityUrl,
          consumerKey,
          consumerSecret,
          token: auth.token,
          tokenSecret: auth.secret,
        }),
      },
    });

    if (!identityRes.ok) {
      throw new Error(`Identity request failed: ${identityRes.status}`);
    }

    const identityData = await identityRes.json();

    const profileUrl = buildDiscogsUrl(`users/${identityData.username}`);

    const profileRes = await fetch(profileUrl, {
      headers: {
        Authorization: buildOAuthHeader({
          method: 'GET',
          url: profileUrl,
          consumerKey,
          consumerSecret,
          token: auth.token,
          tokenSecret: auth.secret,
        }),
      },
    });

    if (!profileRes.ok) {
      throw new Error(`Profile request failed: ${profileRes.status}`);
    }

    const profileData = await profileRes.json();

    return {
      username: identityData.username,
      name: profileData.name,
      avatar_url: profileData.avatar_url,
    };
  }

  if (searchParams.get('identity') === 'true') {
    const identity = await fetchIdentity(auth);

    return NextResponse.json(identity);
  }

  try {
    const identity = await fetchIdentity(auth);
    const username = identity.username;

    // --- 1. Folders holen ---
    const foldersUrl = buildDiscogsUrl(`users/${username}/collection/folders`);

    const foldersRes = await fetch(foldersUrl, {
      headers: {
        Authorization: buildOAuthHeader({
          method: 'GET',
          url: foldersUrl,
          consumerKey,
          consumerSecret,
          token,
          tokenSecret,
        }),
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

      if (hasUsableCache(cached)) {
        return NextResponse.json({
          folders: cached.folders,
          releases: cached.releases,
          collectionOverviewRows: adaptCollectionReleases(cached.releases, 'collectionOverview'),
        });
      }
    }

    // --- 2. Releases holen (mit Pagination) ---
    let page = 1;
    let totalPages = 1;
    let allReleases: DiscogsReleaseItem[] = [];

    do {
      const releasesUrl = buildDiscogsUrl(`users/${username}/collection/folders/${selectedFolder.id}/releases`, {
        per_page: 100,
        page,
      });

      const releasesRes = await fetch(releasesUrl, {
        headers: {
          Authorization: buildOAuthHeader({
            method: 'GET',
            url: releasesUrl,
            consumerKey,
            consumerSecret,
            token,
            tokenSecret,
          }),
        },
      });

      if (!releasesRes.ok) {
        throw new Error(`Releases request failed: ${releasesRes.status}`);
      }

      const releasesData: DiscogsReleasesResponse = await releasesRes.json();

      // console.log(
      //   '[discogs] folder releases raw response',
      //   JSON.stringify(
      //     {
      //       folder: folderName,
      //       page,
      //       totalPages: releasesData.pagination.pages,
      //       sample: releasesData.releases.slice(0, 3),
      //     },
      //     null,
      //     2
      //   )
      // );

      allReleases = allReleases.concat(releasesData.releases);

      totalPages = releasesData.pagination.pages;
      page++;

      // Safety limit
      if (page > 50) break;
    } while (page <= totalPages);

    const responseData: DiscogsCacheData = {
      folders: foldersData.folders,
      releases: allReleases,
    };

    await writeCache(username, folderName, responseData);

    return NextResponse.json({
      ...responseData,
      collectionOverviewRows: adaptCollectionReleases(allReleases, 'collectionOverview'),
    });
  } catch (err) {
    console.error('Discogs API error:', err);

    return NextResponse.json({ error: 'Failed to fetch Discogs data' }, { status: 500 });
  }
}
