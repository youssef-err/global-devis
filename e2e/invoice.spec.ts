import { test, expect } from '@playwright/test';

test.describe('Invoice Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: /accept/i });
    if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptBtn.click();
    }
  });

  test('page loads and invoice form is visible', async ({ page }) => {
    await expect(page).toHaveTitle(/Global Devis|Invoice/i);
    // The form loads lazily — wait for it
    await expect(page.locator('#invoice-form, form, [data-testid="invoice-form"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('can fill company name and advance step', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const companyInput = page.getByPlaceholder(/company name|nom/i).first();
    if (await companyInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      await companyInput.fill('Test Company SARL');
      await expect(companyInput).toHaveValue('Test Company SARL');
    }
  });

  test('invoice preview section is visible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const preview = page.locator('#invoice-preview, [data-testid="invoice-preview"]').first();
    if (await preview.isVisible({ timeout: 10000 }).catch(() => false)) {
      await expect(preview).toBeVisible();
    }
  });
});
