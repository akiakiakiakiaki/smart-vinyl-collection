import { mockCollectionApi } from './apiMocks';
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

  test('shows an empty state for a folder without releases', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage, { releases: [] });

    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();

    await expect(authenticatedPage.getByText('No records found')).toBeVisible();
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
