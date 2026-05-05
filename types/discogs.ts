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

export type DiscogsCompany = DiscogsLabel;

export type DiscogsIdentifier = {
  type: string;
  value: string;
  description?: string;
};

export type DiscogsImage = {
  type: string;
  uri: string;
  resource_url?: string;
  uri150?: string;
  width?: number;
  height?: number;
};

export type DiscogsTrack = {
  position?: string;
  type_?: string;
  title?: string;
  duration?: string;
  artists?: DiscogsArtist[];
  extraartists?: DiscogsArtist[];
};

export type DiscogsVideo = {
  uri: string;
  title: string;
  description?: string;
  duration?: number;
  embed?: boolean;
};

export type DiscogsCommunity = {
  have?: number;
  want?: number;
  rating?: {
    count?: number;
    average?: number;
  };
  submitter?: {
    username?: string;
    resource_url?: string;
  };
  contributors?: Array<{
    username?: string;
    resource_url?: string;
  }>;
  data_quality?: string;
  status?: string;
};

export type DiscogsReleaseDetail = {
  id: number;
  title: string;
  artists?: DiscogsArtist[];
  extraartists?: DiscogsArtist[];
  labels?: DiscogsLabel[];
  series?: DiscogsLabel[];
  companies?: DiscogsCompany[];
  formats?: DiscogsFormat[];
  genres?: string[];
  styles?: string[];
  country?: string;
  released?: string;
  released_formatted?: string;
  notes?: string;
  data_quality?: string;
  master_id?: number;
  master_url?: string;
  uri?: string;
  resource_url?: string;
  thumb?: string;
  images?: DiscogsImage[];
  identifiers?: DiscogsIdentifier[];
  tracklist?: DiscogsTrack[];
  videos?: DiscogsVideo[];
  community?: DiscogsCommunity;
  lowest_price?: number;
  num_for_sale?: number;
  estimated_weight?: number;
  blocked_from_sale?: boolean;
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
