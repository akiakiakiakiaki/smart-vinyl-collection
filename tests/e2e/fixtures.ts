import { test as base, type Page } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, fixtureUse) => {
    const context = await browser.newContext();

    await context.addCookies([
      {
        name: 'discogs_access_token',
        value: 'playwright-test-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
      {
        name: 'discogs_access_secret',
        value: 'playwright-test-secret',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
      {
        name: 'discogs_username',
        value: 'playwright-test-user',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      },
    ]);

    const page = await context.newPage();
    await fixtureUse(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
