import { DiscogsFolder, DiscogsReleaseItem } from './discogs';

export type DiscogsCacheData = {
  folders: DiscogsFolder[];
  releases: DiscogsReleaseItem[];
};
