import { describe, expect, it } from 'vitest';
import { adaptReleaseDetail } from '@/lib/adapters/releaseDetailAdapter';

describe('adaptReleaseDetail', () => {
  it('maps release metadata, tracks, videos and marketplace data', () => {
    const view = adaptReleaseDetail(
      {
        id: 100,
        title: 'Test Album',
        artists: [{ name: 'Artist', anv: 'A' }],
        released: '2026-01-01',
        formats: [{ qty: '1', name: 'Vinyl', descriptions: ['LP'] }],
        labels: [{ name: 'Label', catno: 'CAT-1' }],
        tracklist: [{ position: 'A1', title: 'Track', duration: '3:30' }],
        videos: [{ title: 'Video', uri: 'https://example.com/video', duration: 125 }],
        lowest_price: 12.5,
        num_for_sale: 4,
        uri: 'https://discogs.com/release/100',
      },
      { userRating: 4 }
    );

    expect(view).toMatchObject({
      id: 100,
      title: 'Test Album',
      artists: 'A',
      year: 2026,
      formats: ['1 / Vinyl / LP'],
      userRating: 4,
      marketplace: { lowestPrice: 12.5, numForSale: 4 },
    });
    expect(view.tracklist[0]).toMatchObject({ position: 'A1', title: 'Track' });
    expect(view.videos[0]).toMatchObject({ title: 'Video', duration: '2:05' });
  });

  it('uses safe defaults for missing optional values', () => {
    const view = adaptReleaseDetail({ id: 100, title: 'Untitled' });

    expect(view.artists).toBe('');
    expect(view.year).toBeNull();
    expect(view.tracklist).toEqual([]);
    expect(view.userRating).toBeNull();
  });
});
