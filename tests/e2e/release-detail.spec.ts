import { mockReleaseApi } from './apiMocks';
import { test, expect } from './fixtures';

test.describe('release details', () => {
  test('opens release details in an authenticated local test session', async ({ authenticatedPage }) => {
    await mockReleaseApi(authenticatedPage);

    await authenticatedPage.goto('/collection/releases/100');

    await expect(authenticatedPage.getByRole('heading', { name: 'Test Album' })).toBeVisible();
    await expect(authenticatedPage.getByText('Discogs Release #100')).toBeVisible();
    await expect(authenticatedPage.getByRole('link', { name: 'Back to collection' })).toHaveAttribute(
      'href',
      '/collection/overview'
    );
  });

  test('refreshes release details through the API', async ({ authenticatedPage }) => {
    await mockReleaseApi(authenticatedPage);
    await authenticatedPage.goto('/collection/releases/100');
    await expect(authenticatedPage.getByRole('heading', { name: 'Test Album' })).toBeVisible();

    const refreshRequest = authenticatedPage.waitForRequest((request) => {
      const url = new URL(request.url());
      return url.pathname.endsWith('/api/discogs/releases/100') && url.searchParams.get('refresh') === 'true';
    });

    await authenticatedPage.getByRole('button', { name: 'Refresh Release' }).click();
    await refreshRequest;
  });
});
