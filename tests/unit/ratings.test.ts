import { describe, expect, it } from 'vitest';
import { getPendingRatingReleaseIds, mergeRatingsIntoReleases } from '@/lib/discogs/ratings';
import { createReleaseItem } from '../fixtures/discogs';

describe('ratings', () => {
  it('returns unique pending release ids up to the batch size', () => {
    const releases = [
      createReleaseItem(),
      createReleaseItem({ id: 201, basic_information: { ...createReleaseItem().basic_information, id: 201 } }),
      createReleaseItem({ id: 202, basic_information: { ...createReleaseItem().basic_information, id: 202 } }),
    ];

    expect(getPendingRatingReleaseIds(releases, [], 2)).toEqual([100, 201]);
  });

  it('does not return already fetched ratings', () => {
    expect(getPendingRatingReleaseIds([createReleaseItem()], [100])).toEqual([]);
  });

  it('merges ratings while preserving releases without an incoming rating', () => {
    const releases = [
      createReleaseItem(),
      createReleaseItem({ id: 201, basic_information: { ...createReleaseItem().basic_information, id: 201 } }),
    ];
    const merged = mergeRatingsIntoReleases(releases, new Map([[100, 5]]));

    expect(merged[0].rating).toBe(5);
    expect(merged[1]).toBe(releases[1]);
  });

  it('handles an explicit zero rating', () => {
    const [merged] = mergeRatingsIntoReleases([createReleaseItem()], new Map([[100, 0]]));

    expect(merged.rating).toBe(0);
  });
});
