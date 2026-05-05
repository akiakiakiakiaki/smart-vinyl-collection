export type ReleaseDetailLink = {
  label: string;
  href: string;
};

export type ReleaseDetailImage = {
  type: string;
  uri: string;
  width: number | null;
  height: number | null;
};

export type ReleaseDetailSectionItem = {
  primary: string;
  secondary?: string;
};

export type ReleaseDetailTrack = {
  position: string;
  title: string;
  duration: string;
  artists: string;
  extraArtists: string;
  type: string;
};

export type ReleaseDetailVideo = {
  title: string;
  uri: string;
  duration: string;
  description: string;
};

export type ReleaseDetailView = {
  id: number;
  title: string;
  artists: string;
  extraArtists: ReleaseDetailSectionItem[];
  year: number | null;
  country: string;
  released: string;
  formats: string[];
  labels: ReleaseDetailSectionItem[];
  series: ReleaseDetailSectionItem[];
  companies: ReleaseDetailSectionItem[];
  genres: string[];
  styles: string[];
  identifiers: ReleaseDetailSectionItem[];
  tracklist: ReleaseDetailTrack[];
  videos: ReleaseDetailVideo[];
  images: ReleaseDetailImage[];
  notes: string;
  dataQuality: string;
  community: {
    have: number | null;
    want: number | null;
    ratingAverage: number | null;
    ratingCount: number | null;
    status: string;
  };
  userRating: number | null;
  marketplace: {
    lowestPrice: number | null;
    numForSale: number | null;
  };
  links: ReleaseDetailLink[];
};
