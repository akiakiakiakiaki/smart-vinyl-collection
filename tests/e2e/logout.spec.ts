import { test, expect } from './fixtures';

test.describe('logout', () => {
  test('expires the local session and protects the collection afterward', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/api/discogs/auth/logout');

    await expect(authenticatedPage).toHaveURL(/\/logout$/);
    await expect(authenticatedPage.getByText('You are logged out')).toBeVisible();

    await authenticatedPage.goto('/collection/overview');

    await expect(authenticatedPage).toHaveURL(/\/login$/);
  });
});
