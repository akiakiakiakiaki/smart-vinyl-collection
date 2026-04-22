import { RecordItem } from './collection';
import { DiscogsFolder } from './discogs';

export type DiscogsCacheData = {
  folders: DiscogsFolder[];
  records: RecordItem[];
};
