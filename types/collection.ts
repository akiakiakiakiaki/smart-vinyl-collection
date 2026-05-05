export type CollectionOverviewRow = {
  id: number;
  instanceId: number | null;
  title: string;
  displayTitle: string;
  artist: string;
  year: number | null;
  dateAdded: string;
  formats: string;
  cover: string | null;
  rating: number | null;
  lowestPrice: number | null;
  releaseDetailsLoaded: boolean;
  labels: string;
  genres: string;
  styles: string;
};
