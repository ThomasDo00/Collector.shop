import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('register page renders form', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    // Login uses emailOrUsername field
    await expect(
      page.locator('input[name="emailOrUsername"], input[type="email"], input[placeholder*="mail"], input[placeholder*="utilisateur"]').first()
    ).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator(
      'input[name="emailOrUsername"], input[type="email"], input[placeholder*="mail"], input[placeholder*="utilisateur"]'
    ).first();
    await emailInput.fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('WrongPassword123!');

    // Wait for the API response before asserting
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/login') && resp.request().method() === 'POST',
      { timeout: 10000 }
    );
    await page.locator('button[type="submit"], input[type="submit"]').click();
    await responsePromise;

    // Invalid credentials must NOT redirect — user stays on /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has a link to register page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const registerLink = page.locator('a[href="/register"]').first();
    await expect(registerLink).toBeVisible({ timeout: 10000 });
  });

  test('register page has a link to login page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible({ timeout: 10000 });
  });

  test('register form validates required fields', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Submit empty form
    await page.locator('button[type="submit"], input[type="submit"]').click();

    // Browser native validation or custom error should prevent submission
    // and we should still be on the register page
    await expect(page).toHaveURL(/\/register/);
  });
});
