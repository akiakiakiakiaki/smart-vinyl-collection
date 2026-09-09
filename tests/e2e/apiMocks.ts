import type { Page } from '@playwright/test';
import { createReleaseItem } from '../fixtures/discogs';
import type { DiscogsReleaseItem } from '@/types/discogs';

export const testRelease = createReleaseItem({
  basic_information: {
    ...createReleaseItem().basic_information,
    cover_image: '',
  },
});

type CollectionMockOptions = {
  releases?: DiscogsReleaseItem[];
  collectionStatus?: number;
  collectionError?: string;
  deletedOnRefresh?: boolean;
};

export async function mockCollectionApi(page: Page, options: CollectionMockOptions = {}) {
  let folderWasDeleted = false;

  await page.route('**/api/discogs**', async (route) => {
    const url = new URL(route.request().url());

    if (url.searchParams.get('folders') === 'true') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ folders: folderWasDeleted ? [] : [{ id: 1, name: 'CR', count: 1 }] }),
      });
      return;
    }

    if (url.searchParams.get('folder') === 'CR') {
      if (options.deletedOnRefresh && url.searchParams.get('refresh') === 'true') {
        folderWasDeleted = true;
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Folder no longer exists', folderDeleted: true }),
        });
        return;
      }

      if (options.collectionStatus && options.collectionStatus >= 400) {
        await route.fulfill({
          status: options.collectionStatus,
          contentType: 'application/json',
          body: JSON.stringify({ error: options.collectionError ?? 'Collection request failed' }),
        });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          releases: options.releases ?? [testRelease],
          releaseDetailsByReleaseId: {},
          ratingSync: { fetched: 0, total: (options.releases ?? [testRelease]).length },
        }),
      });
      return;
    }

    await route.continue();
  });
}

export async function mockReleaseApi(page: Page) {
  await page.route('**/api/discogs/releases/100**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        release: {
          id: 100,
          title: 'Test Album',
          artists: [{ name: 'Test Artist' }],
          released: '2026-01-02',
          formats: [{ name: 'Vinyl', qty: '1', descriptions: ['LP'] }],
          genres: ['Electronic'],
          styles: ['House'],
        },
        userRating: 4,
      }),
    });
  });
}
