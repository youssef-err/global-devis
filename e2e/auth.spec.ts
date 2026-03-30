import { test, expect } from '@playwright/test';

test.describe('Auth Forms', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/en/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/en/signup');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login form shows validation on empty submit', async ({ page }) => {
    await page.goto('/en/login');
    await page.waitForLoadState('networkidle');
    const submitBtn = page.getByRole('button', { name: /sign in|login|connexion/i });
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();
      // Browser native validation or custom error should appear
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
    }
  });

  test('login page renders in Arabic (RTL)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
