import { DiscogsReleaseItem } from '@/types/discogs';

export function createReleaseItem(overrides: Partial<DiscogsReleaseItem> = {}): DiscogsReleaseItem {
  return {
    id: 100,
    instance_id: 200,
    date_added: '2026-01-02T12:00:00-06:00',
    rating: 4,
    basic_information: {
      id: 100,
      title: 'Test Album',
      year: 2026,
      artists: [{ name: 'Test Artist' }],
      formats: [{ name: 'Vinyl', qty: '1', descriptions: ['LP'] }],
      labels: [{ name: 'Test Label', catno: 'TEST-001' }],
      genres: ['Electronic'],
      styles: ['House'],
      cover_image: 'https://example.com/cover.jpg',
    },
    ...overrides,
  };
}
