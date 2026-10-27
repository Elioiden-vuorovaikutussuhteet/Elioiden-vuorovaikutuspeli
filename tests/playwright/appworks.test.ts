import { test, expect } from '@playwright/test';

test('Playwright can open the game', async ({ page }) => {
  // This will navigate to http://localhost:5173
  await page.goto('/');
});