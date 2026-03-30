import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog listing page loads', async ({ page }) => {
    await page.goto('/en/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/en\/blog/);
    // Blog should render without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('blog listing renders in French', async ({ page }) => {
    await page.goto('/fr/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/fr\/blog/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('blog listing renders in Arabic (RTL)', async ({ page }) => {
    await page.goto('/ar/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/ar\/blog/);
    await expect(page.locator('body')).toBeVisible();
  });
});
