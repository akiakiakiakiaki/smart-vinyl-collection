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

  test('uses a readable responsive heading hierarchy on mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 800 });
    await mockReleaseApi(authenticatedPage);
    await authenticatedPage.goto('/collection/releases/100');

    await expect(authenticatedPage.locator('h1')).toHaveText('Test Album');
    await expect(authenticatedPage.getByRole('paragraph').filter({ hasText: 'Test Artist' })).toHaveAttribute(
      'class',
      /MuiTypography-subtitle1/
    );
    await expect(authenticatedPage.locator('h2').filter({ hasText: 'Test Artist' })).toHaveCount(0);

    const tableContainer = authenticatedPage.getByTestId('tracklist-scroll-container');
    await expect.poll(async () =>
      tableContainer.evaluate((element) => element.scrollWidth > element.clientWidth)
    ).toBe(true);
    await expect(tableContainer).toHaveCSS('background-color', /rgb/);
  });
});
