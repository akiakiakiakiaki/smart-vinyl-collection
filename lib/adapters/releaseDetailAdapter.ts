import { ReleaseDetailSectionItem, ReleaseDetailTrack, ReleaseDetailView, ReleaseDetailVideo } from '@/types/release';
import { DiscogsArtist, DiscogsLabel, DiscogsReleaseDetail, DiscogsTrack } from '@/types/discogs';

type ReleaseDetailAdapterOptions = {
  userRating?: number | null;
};

export function adaptReleaseDetail(
  release: DiscogsReleaseDetail,
  { userRating = null }: ReleaseDetailAdapterOptions = {}
): ReleaseDetailView {
  return {
    id: release.id,
    title: release.title ?? 'Unknown Title',
    artists: formatArtists(release.artists),
    extraArtists: mapArtistsToSectionItems(release.extraartists),
    year: getReleaseYear(release.released),
    country: release.country ?? '',
    released: release.released_formatted ?? release.released ?? '',
    formats: release.formats?.map((format) => [format.qty, format.name, ...(format.descriptions ?? [])].filter(Boolean).join(' / ')) ?? [],
    labels: mapLabels(release.labels),
    series: mapLabels(release.series),
    companies: mapLabels(release.companies),
    genres: release.genres ?? [],
    styles: release.styles ?? [],
    identifiers: release.identifiers?.map((identifier) => ({
      primary: `${identifier.type}: ${identifier.value}`,
      secondary: identifier.description,
    })) ?? [],
    tracklist: release.tracklist?.map(mapTrack) ?? [],
    videos: release.videos?.map(mapVideo) ?? [],
    images: release.images?.map((image) => ({
      type: image.type,
      uri: image.uri,
      width: image.width ?? null,
      height: image.height ?? null,
    })) ?? [],
    notes: release.notes ?? '',
    dataQuality: release.data_quality ?? release.community?.data_quality ?? '',
    community: {
      have: release.community?.have ?? null,
      want: release.community?.want ?? null,
      ratingAverage: release.community?.rating?.average ?? null,
      ratingCount: release.community?.rating?.count ?? null,
      status: release.community?.status ?? '',
    },
    userRating,
    marketplace: {
      lowestPrice: release.lowest_price ?? null,
      numForSale: release.num_for_sale ?? null,
    },
    links: [
      release.uri ? { label: 'Discogs', href: release.uri } : null,
      release.master_url ? { label: 'Master release API', href: release.master_url } : null,
      release.resource_url ? { label: 'Release API', href: release.resource_url } : null,
    ].filter((link): link is { label: string; href: string } => Boolean(link)),
  };
}

function mapTrack(track: DiscogsTrack): ReleaseDetailTrack {
  return {
    position: track.position ?? '',
    title: track.title ?? '',
    duration: track.duration ?? '',
    artists: formatArtists(track.artists),
    extraArtists: formatArtists(track.extraartists),
    type: track.type_ ?? '',
  };
}

function mapVideo(video: { title?: string; uri?: string; duration?: number; description?: string }): ReleaseDetailVideo {
  return {
    title: video.title ?? 'Untitled video',
    uri: video.uri ?? '',
    duration: typeof video.duration === 'number' ? formatDuration(video.duration) : '',
    description: video.description ?? '',
  };
}

function mapLabels(labels: DiscogsLabel[] | undefined): ReleaseDetailSectionItem[] {
  return labels?.map((label) => ({
    primary: label.name,
    secondary: [label.catno, label.entity_type_name].filter(Boolean).join(' / ') || undefined,
  })) ?? [];
}

function mapArtistsToSectionItems(artists: DiscogsArtist[] | undefined): ReleaseDetailSectionItem[] {
  return artists?.map((artist) => ({
    primary: artist.name,
    secondary: [artist.role, artist.tracks].filter(Boolean).join(' / ') || undefined,
  })) ?? [];
}

function formatArtists(artists: DiscogsArtist[] | undefined) {
  return artists?.map((artist) => [artist.anv || artist.name, artist.role ? `(${artist.role})` : ''].filter(Boolean).join(' ')).join(', ') ?? '';
}

function getReleaseYear(released: string | undefined) {
  if (!released) return null;

  const year = Number(released.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
}
