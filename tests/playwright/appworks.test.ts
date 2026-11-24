import { test, expect } from '@playwright/test';

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  await page.route('**/api/configs', (route) =>
    route.fulfill({ json: {} })
  );
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('app loads without errors', async ({ page }) => {
  await page.goto('/');
  // keep an assertion that waits for your app UI to mount
});