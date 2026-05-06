export const DEFAULT_COLUMN_VISIBILITY = {
  cover: true,
  artist: true,
  displayTitle: true,
  year: true,
  formats: false,
  labels: false,
  genres: false,
  styles: false,
  lowestPrice: false,
  dateAdded: false,
  rating: false,
} as const;

export const COLLECTION_COLUMN_OPTIONS = [
  { field: 'cover', label: 'Cover' },
  { field: 'artist', label: 'Artist' },
  { field: 'displayTitle', label: 'Title' },
  { field: 'year', label: 'Year' },
  { field: 'formats', label: 'Formats' },
  { field: 'labels', label: 'Labels' },
  { field: 'genres', label: 'Genres' },
  { field: 'styles', label: 'Styles' },
  { field: 'lowestPrice', label: 'Lowest Price' },
  { field: 'dateAdded', label: 'Added' },
  { field: 'rating', label: 'Rating' },
] as const;

export type CollectionColumnField = (typeof COLLECTION_COLUMN_OPTIONS)[number]['field'];

export type ColumnVisibilityModel = Record<CollectionColumnField, boolean>;
