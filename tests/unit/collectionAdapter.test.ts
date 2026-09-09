import { describe, expect, it } from 'vitest';
import { adaptCollectionReleases } from '@/lib/adapters/collectionAdapter';
import { createReleaseItem } from '../fixtures/discogs';

describe('adaptCollectionReleases', () => {
  it('maps Discogs collection items to overview rows', () => {
    const [row] = adaptCollectionReleases([createReleaseItem()], 'collectionOverview');

    expect(row).toMatchObject({
      id: 100,
      instanceId: 200,
      title: 'Test Album',
      artist: 'Test Artist',
      formats: 'Vinyl / LP',
      labels: 'Test Label',
      genres: 'Electronic',
      styles: 'House',
      rating: 4,
    });
  });

  it('labels duplicate release instances as copies', () => {
    const rows = adaptCollectionReleases(
      [createReleaseItem(), createReleaseItem({ instance_id: 201 })],
      'collectionOverview'
    );

    expect(rows.map((row) => row.displayTitle)).toEqual(['Test Album (Copy 1)', 'Test Album (Copy 2)']);
  });

  it('uses release detail data when available', () => {
    const [row] = adaptCollectionReleases([createReleaseItem()], 'collectionOverview', {
      releaseDetailsByReleaseId: { 100: { id: 100, title: 'Test Album', lowest_price: 9.99 } },
    });

    expect(row.lowestPrice).toBe(9.99);
    expect(row.releaseDetailsLoaded).toBe(true);
  });
});
