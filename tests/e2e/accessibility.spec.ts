import AxeBuilder from '@axe-core/playwright';
import { mockCollectionApi, mockReleaseApi } from './apiMocks';
import { test, expect } from './fixtures';

test.describe('accessibility', () => {
  test('login page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('collection page has no critical accessibility violations', async ({ authenticatedPage }) => {
    await mockCollectionApi(authenticatedPage);
    await authenticatedPage.goto('/collection/overview');
    await authenticatedPage.getByLabel('Collection folder').click();
    await authenticatedPage.getByRole('option', { name: 'CR' }).click();
    await expect(authenticatedPage.getByText('Test Album')).toBeVisible();
    await expect(authenticatedPage.getByRole('button', { name: 'Refresh Releases' })).toBeEnabled();

    const results = await new AxeBuilder({ page: authenticatedPage }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('release detail page has no critical accessibility violations', async ({ authenticatedPage }) => {
    await mockReleaseApi(authenticatedPage);
    await authenticatedPage.goto('/collection/releases/100');
    await expect(authenticatedPage.getByRole('heading', { name: 'Test Album' })).toBeVisible();

    const results = await new AxeBuilder({ page: authenticatedPage }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('login button receives keyboard focus', async ({ page }) => {
    await page.goto('/login');

    const colorModeButton = page.getByRole('button', { name: 'Switch to dark mode' });
    await expect(colorModeButton).toBeVisible();
    await colorModeButton.focus();
    await expect(colorModeButton).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(page.getByRole('button', { name: 'Login with Discogs' })).toBeFocused();
  });

  test('release navigation can receive keyboard focus', async ({ authenticatedPage }) => {
    await mockReleaseApi(authenticatedPage);
    await authenticatedPage.goto('/collection/releases/100');
    const backLink = authenticatedPage.getByRole('link', { name: 'Back to collection' });

    await backLink.focus();

    await expect(backLink).toBeFocused();
  });
});
