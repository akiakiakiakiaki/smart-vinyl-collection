export type DiscogsArtist = {
  name: string;
};

export type DiscogsBasicInformation = {
  id: number;
  title: string;
  year?: number;
  cover_image?: string;
  artists?: DiscogsArtist[];
};

export type DiscogsReleaseItem = {
  basic_information: DiscogsBasicInformation;
};

export type DiscogsPagination = {
  pages: number;
};

export type DiscogsReleasesResponse = {
  releases: DiscogsReleaseItem[];
  pagination: DiscogsPagination;
};

export type DiscogsFolder = {
  id: number;
  name: string;
};

export type DiscogsFoldersResponse = {
  folders: DiscogsFolder[];
};
