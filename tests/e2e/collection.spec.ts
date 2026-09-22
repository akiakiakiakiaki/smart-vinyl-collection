import { mockCollectionApi, mockReleaseApi } from './apiMocks';
import { test, expect } from './fixtures';

test.describe('collection', () => {
  test('loads a collection folder in an authenticated local test session', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage);

    await authenticatedPage.goto('/collection/overview');
    await expect(authenticatedPage.getByLabel('Collection folder')).toBeVisible();

    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();

    await expect(authenticatedPage.getByText('Test Album')).toBeVisible();
    await authenticatedPage.getByText('Test Album').click();
    await expect(authenticatedPage).toHaveURL(/\/collection\/releases\/100$/);
  });

  test('restores the selected folder and collection after returning from release details', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage);
    await mockReleaseApi(authenticatedPage);

    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();
    await expect(authenticatedPage.getByText('Test Album')).toBeVisible();

    for (let index = 0; index < 2; index += 1) {
      await authenticatedPage.getByText('Test Album').click();
      await expect(authenticatedPage).toHaveURL(/\/collection\/releases\/100$/);
      await authenticatedPage.getByRole('link', { name: 'Back to collection' }).click();
      await expect(authenticatedPage).toHaveURL(/\/collection\/overview$/);
      await expect(authenticatedPage.getByLabel('Collection folder')).toHaveText('CR');
      await expect(authenticatedPage.getByText('Test Album')).toBeVisible();
    }
  });

  test('shows an empty state for a folder without releases', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage, { releases: [] });

    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();

    await expect(authenticatedPage.getByText('No records found')).toBeVisible();
  });

  test('keeps collection controls usable and the grid readable on mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 800 });
    await mockCollectionApi(authenticatedPage);

    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();

    const refreshButton = authenticatedPage.getByRole('button', { name: 'Refresh Releases' });
    const ratingsButton = authenticatedPage.getByRole('button', { name: 'Refresh Ratings' });
    await expect(refreshButton).toBeVisible();
    await expect(ratingsButton).toBeVisible();
    await expect(refreshButton).toHaveCSS('font-size', '12px');
    await expect(refreshButton).toHaveCSS('overflow', 'visible');

    const grid = authenticatedPage.getByTestId('collection-grid-container').locator('.MuiDataGrid-root');
    const gridScrollContainer = grid.locator('.MuiDataGrid-virtualScroller');
    await expect.poll(async () =>
      gridScrollContainer.evaluate((element) => element.scrollWidth > element.clientWidth)
    ).toBe(true);

    const gridBox = await grid.boundingBox();
    const footerBox = await grid.locator('.MuiDataGrid-footerContainer').boundingBox();
    expect(gridBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(footerBox?.width).toBeLessThanOrEqual((gridBox?.width ?? 0) + 1);
  });

  test('shows an API error when loading a collection fails', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage, {
      collectionStatus: 500,
      collectionError: 'Collection backend unavailable',
    });

    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();

    await expect(authenticatedPage.getByRole('heading', { name: 'Error' })).toBeVisible();
    await expect(authenticatedPage.locator('p').filter({ hasText: 'Collection backend unavailable' })).toBeVisible();
  });

  test('clears a folder after Discogs reports it was deleted during refresh', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage, { deletedOnRefresh: true });

    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();
    await expect(authenticatedPage.getByText('Test Album')).toBeVisible();

    const refreshButton = authenticatedPage.getByRole('button', { name: 'Refresh Releases' });
    await expect(refreshButton).toBeEnabled();
    await refreshButton.click();

    await expect(authenticatedPage.getByLabel('Collection folder')).toHaveText('Select folder');
    await expect(authenticatedPage.getByRole('heading', { name: 'Error' })).not.toBeVisible();
  });
});
