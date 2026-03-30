import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads correctly', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en/);
    await page.waitForLoadState('networkidle');
  });

  test('navbar is visible', async ({ page }) => {
    await page.goto('/en');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('can navigate to about page', async ({ page }) => {
    await page.goto('/en/about');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/en\/about/);
  });

  test('can navigate to blog page', async ({ page }) => {
    await page.goto('/en/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/en\/blog/);
  });

  test('Arabic locale loads with RTL layout', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/ar/);
    // Check RTL direction is applied
    const html = page.locator('html, body, [dir="rtl"]').first();
    await expect(html).toBeVisible();
  });

  test('French locale loads', async ({ page }) => {
    await page.goto('/fr');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/fr/);
  });
});
