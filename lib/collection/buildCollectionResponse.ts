import { readReleaseDetailsCaches } from '@/lib/cache/releaseDetailsCache';
import { CollectionResponse } from '@/types/api';
import { CollectionsCacheData } from '@/types/cache';
import { DiscogsFoldersResponse, DiscogsReleaseItem } from '@/types/discogs';

export async function buildCollectionResponse(params: {
  folders?: DiscogsFoldersResponse['folders'];
  releases: DiscogsReleaseItem[];
  ratingSync?: CollectionsCacheData['ratingSync'];
}): Promise<CollectionResponse> {
  const releaseDetailsByReleaseId = await readReleaseDetailsCaches(
    params.releases.map((release) => release.basic_information.id)
  );

  return {
    ...(params.folders ? { folders: params.folders } : {}),
    releases: params.releases,
    releaseDetailsByReleaseId,
    ...(params.ratingSync ? { ratingSync: params.ratingSync } : {}),
  };
}
