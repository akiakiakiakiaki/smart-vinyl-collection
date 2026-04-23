export type DiscogsArtist = {
  name: string;
  anv?: string;
  join?: string;
  role?: string;
  tracks?: string;
  id?: number;
  resource_url?: string;
};

export type DiscogsFormat = {
  name: string;
  qty: string;
  descriptions?: string[];
};

export type DiscogsLabel = {
  name: string;
  catno: string;
  entity_type?: string;
  entity_type_name?: string;
  id?: number;
  resource_url?: string;
};

export type DiscogsBasicInformation = {
  id: number;
  master_id?: number;
  master_url?: string;
  resource_url?: string;
  thumb?: string;
  title: string;
  year?: number;
  cover_image?: string;
  artists?: DiscogsArtist[];
  formats?: DiscogsFormat[];
  labels?: DiscogsLabel[];
  genres?: string[];
  styles?: string[];
};

export type DiscogsReleaseItem = {
  id: number;
  instance_id?: number;
  date_added?: string;
  rating?: number;
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
