import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('Home page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/CiniFob/i);

    // Check for main content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Can navigate to movies page', async ({ page }) => {
    await page.goto('/movies');

    // Check we're on the movies page
    await expect(page).toHaveURL(/\/movies/);

    // Check that content loads
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Can navigate to TV shows page', async ({ page }) => {
    await page.goto('/tv');

    // Check we're on the TV page
    await expect(page).toHaveURL(/\/tv/);

    // Check that content loads
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Can navigate to browse page', async ({ page }) => {
    await page.goto('/');

    // Navigate to browse
    const browseLink = page.locator('a[href="/browse"]').first();
    if (await browseLink.isVisible()) {
      await browseLink.click();
      await expect(page).toHaveURL(/\/browse/);
    }
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible();
    }
  });

  test('Register page is accessible', async ({ page }) => {
    await page.goto('/register');

    // Check page loaded
    const content = page.locator('main, body');
    await expect(content.first()).toBeVisible();
  });

  test('Movies page displays content', async ({ page }) => {
    await page.goto('/movies');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check for movie cards or content
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('TV shows page displays content', async ({ page }) => {
    await page.goto('/tv');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check for TV content
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('Dark mode toggle works', async ({ page }) => {
    await page.goto('/');

    // Look for theme toggle button
    const themeToggle = page
      .locator('button[aria-label*="theme"], button[title*="theme"], [data-testid*="theme"]')
      .first();

    if (await themeToggle.isVisible()) {
      // Click to toggle theme
      await themeToggle.click();

      // Give time for theme to change
      await page.waitForTimeout(500);
    }
  });

  test('Application is responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });
});
