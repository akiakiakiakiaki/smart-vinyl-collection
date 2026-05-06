import { NextResponse } from 'next/server';
import { DiscogsContext, getFolders as getFoldersClient, getFolderReleasesPage } from '@/lib/discogs/client';
import { DiscogsUpstreamError } from '@/lib/discogs/errors';
import { readCollectionsCache, writeCollectionsCache } from '@/lib/cache/collectionsCache';
import { readFoldersCache, writeFoldersCache } from '@/lib/cache/foldersCache';
import { CollectionsCacheData } from '@/types/cache';
import { DiscogsReleaseItem, DiscogsFoldersResponse } from '@/types/discogs';
import { fetchReleaseRatingsBatch, getPendingRatingReleaseIds, mergeRatingsIntoReleases } from '@/lib/discogs/ratings';
import { mergeRatingsCache, readRatingsCache } from '../cache/ratingsCache';
import { buildCollectionResponse } from '@/lib/collection/buildCollectionResponse';

export async function getFolders(username: string, ctx: DiscogsContext): Promise<DiscogsFoldersResponse> {
  const cached = await readFoldersCache(username);
  if (cached) return cached;

  try {
    const foldersData = (await getFoldersClient(username, ctx)) as DiscogsFoldersResponse;
    await writeFoldersCache(username, foldersData);
    return foldersData;
  } catch (err) {
    if (err instanceof DiscogsUpstreamError) {
      throw err;
    }
    throw new Error('Failed to fetch folders');
  }
}

function hasUsableCache(data: CollectionsCacheData | null) {
  return !!data && Array.isArray(data.releases);
}

export async function getCollection(params: {
  username: string;
  folderName: string;
  progress: boolean;
  refresh: boolean;
  refreshRatings: boolean;
  ctx: DiscogsContext;
  signal: AbortSignal;
}) {
  const { username, folderName, progress, refresh, refreshRatings, ctx, signal } = params;

  try {
    if (progress) {
      const cached = await readCollectionsCache(username, folderName);
      if (!hasUsableCache(cached)) {
        return NextResponse.json({ error: `No cache for folder "${folderName}"` }, { status: 404 });
      }
      const globalRatings = await readRatingsCache(username);

      const merged = mergeRatingsIntoReleases(
        cached.releases,
        new Map(Object.entries(globalRatings).map(([k, v]) => [Number(k), v]))
      );

      return NextResponse.json(await buildCollectionResponse({
        releases: merged,
        ratingSync: cached.ratingSync ?? {
          fetched: 0,
          total: cached.releases.length,
        },
      }));
    }

    const existingCache = await readCollectionsCache(username, folderName);

    if (!refresh && !refreshRatings && hasUsableCache(existingCache)) {
      const folders = await getFolders(username, ctx);
      const globalRatings = await readRatingsCache(username);

      const merged = mergeRatingsIntoReleases(
        existingCache!.releases,
        new Map(Object.entries(globalRatings).map(([k, v]) => [Number(k), v]))
      );

      return NextResponse.json(await buildCollectionResponse({ folders: folders.folders, releases: merged }));
    }

    if (refreshRatings) {
      if (!hasUsableCache(existingCache)) {
        return NextResponse.json({ error: `No cache for folder "${folderName}"` }, { status: 404 });
      }

      const allReleases = existingCache.releases;
      const fetchedReleaseIds: number[] = [];
      let success: number[] = [];
      const globalRatingsForPending = await readRatingsCache(username);
      const alreadyRatedIds = Object.keys(globalRatingsForPending).map(Number);

      let pending = getPendingRatingReleaseIds(allReleases, alreadyRatedIds);

      await writeCollectionsCache(username, folderName, {
        releases: allReleases,
        ratingSync: { fetched: 0, total: allReleases.length },
      });

      while (pending.length > 0) {
        if (signal.aborted) break;

        try {
          const ratings = await fetchReleaseRatingsBatch({
            releaseIds: pending,
            username,
            consumerKey: ctx.consumerKey,
            consumerSecret: ctx.consumerSecret,
            token: ctx.token,
            tokenSecret: ctx.tokenSecret,
            signal,
          });

          await mergeRatingsCache(username, Object.fromEntries(ratings));

          // merge updated ratings into releases immediately
          const updatedGlobalRatings = await readRatingsCache(username);
          const mergedReleases = mergeRatingsIntoReleases(
            allReleases,
            new Map(Object.entries(updatedGlobalRatings).map(([k, v]) => [Number(k), v]))
          );

          success = [...success, ...pending];

          await writeCollectionsCache(username, folderName, {
            releases: mergedReleases,
            ratingSync: {
              fetched: Array.from(new Set([...fetchedReleaseIds, ...success])).length,
              total: allReleases.length,
            },
          });
        } catch {
          break;
        }

        const updatedGlobalRatings = await readRatingsCache(username);
        const updatedRatedIds = Object.keys(updatedGlobalRatings).map(Number);

        pending = getPendingRatingReleaseIds(allReleases, updatedRatedIds);
      }

      const finalGlobalRatings = await readRatingsCache(username);

      const finalMergedReleases = mergeRatingsIntoReleases(
        allReleases,
        new Map(Object.entries(finalGlobalRatings).map(([k, v]) => [Number(k), v]))
      );

      const cacheData: CollectionsCacheData = {
        releases: finalMergedReleases,
        ratingSync: {
          fetched: Array.from(new Set([...fetchedReleaseIds, ...success])).length,
          total: allReleases.length,
        },
      };

      await writeCollectionsCache(username, folderName, cacheData);

      const folders = await getFolders(username, ctx);

      const apiResponse = await buildCollectionResponse({
        folders: folders.folders,
        releases: finalMergedReleases,
        ratingSync: cacheData.ratingSync ?? {
          fetched: 0,
          total: cacheData.releases.length,
        },
      });

      return NextResponse.json(apiResponse);
    }

    const foldersData = (await getFolders(username, ctx)) as DiscogsFoldersResponse;
    const selected = foldersData.folders.find((f) => f.name === folderName);

    if (!selected) {
      return NextResponse.json({ error: `Folder "${folderName}" not found` }, { status: 404 });
    }

    let page = 1;
    let totalPages = 1;
    let allReleases: DiscogsReleaseItem[] = [];

    do {
      const data = await getFolderReleasesPage(username, selected.id, page, ctx, 100, signal);
      allReleases = allReleases.concat(data.releases);
      totalPages = data.pagination.pages;
      page++;
      if (page > 50) break;
    } while (page <= totalPages);

    const globalRatings = await readRatingsCache(username);

    const merged = mergeRatingsIntoReleases(
      allReleases,
      new Map(Object.entries(globalRatings).map(([k, v]) => [Number(k), v]))
    );

    const cacheData: CollectionsCacheData = {
      releases: allReleases,
      ratingSync: existingCache?.ratingSync ?? { fetched: 0, total: allReleases.length },
    };

    await writeCollectionsCache(username, folderName, cacheData);

    const apiResponse = await buildCollectionResponse({
      folders: foldersData.folders,
      releases: merged,
    });

    return NextResponse.json(apiResponse);
  } catch (err) {
    if (err instanceof DiscogsUpstreamError) {
      return NextResponse.json({ error: err.message, upstream: err.upstream ?? null }, { status: err.status });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch Discogs data' }, { status: 500 });
  }
}
