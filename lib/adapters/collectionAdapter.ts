import { CollectionOverviewRow } from '@/types/collection';
import { DiscogsArtist, DiscogsReleaseDetail, DiscogsReleaseItem } from '@/types/discogs';

export type CollectionAdapterFormat = 'collectionOverview';

type CollectionAdapterOptions = {
  releaseDetailsByReleaseId?: Record<number, DiscogsReleaseDetail>;
};

export function adaptCollectionReleases(
  releases: DiscogsReleaseItem[],
  format: 'collectionOverview',
  options?: CollectionAdapterOptions
): CollectionOverviewRow[];

export function adaptCollectionReleases(
  releases: DiscogsReleaseItem[],
  format: CollectionAdapterFormat,
  options: CollectionAdapterOptions = {}
) {
  switch (format) {
    case 'collectionOverview':
      return mapToCollectionOverviewRows(releases, options);
    default:
      return assertNever(format);
  }
}

function mapToCollectionOverviewRows(
  releases: DiscogsReleaseItem[],
  { releaseDetailsByReleaseId = {} }: CollectionAdapterOptions
): CollectionOverviewRow[] {
  const releaseCounts = new Map<number, number>();
  const releasePositions = new Map<number, number>();

  releases.forEach((item) => {
    const releaseId = item.basic_information.id;
    releaseCounts.set(releaseId, (releaseCounts.get(releaseId) ?? 0) + 1);
  });

  return releases.map((item): CollectionOverviewRow => {
    const release = item.basic_information;
    const releaseDetailsLoaded = Object.prototype.hasOwnProperty.call(releaseDetailsByReleaseId, release.id);
    const releaseDetail = releaseDetailsByReleaseId[release.id];
    const occurrence = (releasePositions.get(release.id) ?? 0) + 1;
    const totalOccurrences = releaseCounts.get(release.id) ?? 1;

    releasePositions.set(release.id, occurrence);

    return {
      id: release.id,
      instanceId: item.instance_id ?? null,
      title: release.title ?? 'Unknown Title',
      displayTitle:
        totalOccurrences > 1
          ? `${release.title ?? 'Unknown Title'} (Copy ${occurrence})`
          : (release.title ?? 'Unknown Title'),
      artist: release.artists?.map((artist: DiscogsArtist) => artist.name).join(', ') ?? 'Unknown Artist',
      year: release.year ?? null,
      dateAdded: item.date_added ?? '',
      formats:
        release.formats
          ?.map((formatItem) => [formatItem.name, ...(formatItem.descriptions ?? [])].join(' / '))
          .join(', ') ?? '',
      cover: release.cover_image ?? null,
      rating: item.rating ?? null,
      lowestPrice: releaseDetail?.lowest_price ?? null,
      releaseDetailsLoaded,
      labels: release.labels?.map((label) => label.name).join(', ') ?? '',
      genres: release.genres?.join(', ') ?? '',
      styles: release.styles?.join(', ') ?? '',
    };
  });
}

function assertNever(value: never): never {
  throw new Error(`Unsupported collection adapter format: ${String(value)}`);
}
