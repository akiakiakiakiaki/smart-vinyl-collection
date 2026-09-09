import { test, expect } from '@playwright/test';

test.describe('authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/collection/overview');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Login with Discogs' })).toBeVisible();
  });
});
