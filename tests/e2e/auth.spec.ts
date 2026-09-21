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

  test('uses the browser dark preference by default', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();

    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');
    await context.close();
  });

  test('switches repeatedly between light and dark mode', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();

    await page.goto('/');

    const darkModeButton = page.getByRole('button', { name: 'Switch to dark mode' });
    await expect(darkModeButton).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-light', '');

    await darkModeButton.click();
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');

    const lightModeButton = page.getByRole('button', { name: 'Switch to light mode' });
    await lightModeButton.click();
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-light', '');

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');
    await context.close();
  });

  test('persists the selected color mode after a reload', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();

    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

    await page.reload();

    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');
    await context.close();
  });

  test('follows system color preference changes while in system mode', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();

    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();

    await page.emulateMedia({ colorScheme: 'dark' });

    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');
    await context.close();
  });

  test('can be operated with the keyboard', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();

    await page.goto('/');
    const darkModeButton = page.getByRole('button', { name: 'Switch to dark mode' });
    await darkModeButton.focus();
    await expect(darkModeButton).toBeFocused();
    await page.keyboard.press('Enter');

    const lightModeButton = page.getByRole('button', { name: 'Switch to light mode' });
    await expect(lightModeButton).toBeVisible();
    await expect(lightModeButton).toBeFocused();
    await context.close();
  });
});
