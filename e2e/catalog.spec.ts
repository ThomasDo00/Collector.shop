import { test, expect } from '@playwright/test';

test.describe('Catalog browsing', () => {
  test('homepage loads and shows content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Collector/i);
    await expect(page.locator('header')).toBeVisible();
  });

  test('catalog page loads and shows products grid', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    // Wait for the page to finish loading lazy chunks
    await page.waitForLoadState('networkidle');
    // Products grid or empty state should be visible
    const grid = page.locator('[class*="grid"], [class*="products"], [class*="catalog"]').first();
    await expect(grid).toBeVisible({ timeout: 10000 });
  });

  test('can search in the catalog', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[type="search"], input[placeholder*="Rechercher"], input[placeholder*="rechercher"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('Jordan');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/search|q=Jordan/i);
  });

  test('can navigate to catalog from navigation link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const catalogLink = page.locator('a[href="/catalog"]').first();
    await expect(catalogLink).toBeVisible({ timeout: 10000 });
    await catalogLink.click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('logo navigates to home', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    // Logo is typically a link wrapping an image or text in the header
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible({ timeout: 10000 });
    await logoLink.click();
    await expect(page).toHaveURL('/');
  });

  test('product detail page loads when visiting a product URL', async ({ page }) => {
    // Navigate to catalog first to find a product, or go directly with a known path
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const productLink = page.locator('a[href^="/product/"]').first();
    const hasProduct = await productLink.count() > 0;

    if (hasProduct) {
      await productLink.click();
      await expect(page).toHaveURL(/\/product\//);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    } else {
      // No products available in this env — just verify the catalog loaded
      await expect(page.locator('header')).toBeVisible();
    }
  });
});
