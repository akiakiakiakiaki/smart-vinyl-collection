import { test, expect } from '@playwright/test';

test.describe('authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/collection/overview');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Login with Discogs' })).toBeVisible();
  });

  test('uses German when the browser prefers German', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'de-DE' });
    const page = await context.newPage();

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Willkommen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sammlungen öffnen' })).toBeVisible();
    await context.close();
  });

  test('uses Spanish when the browser prefers Spanish', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es-MX' });
    const page = await context.newPage();

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explorar tus colecciones' })).toBeVisible();
    await context.close();
  });
});
