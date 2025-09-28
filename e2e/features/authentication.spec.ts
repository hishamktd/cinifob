import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('Authentication Features', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('User can register a new account', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', `newuser${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard');

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('User can log in with valid credentials', async ({ page }) => {
    // First create a test user
    const testUser = await setupTestUser(page);
    await helpers.logout();

    // Now test login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Cleanup
    await cleanupTestData(page, testUser.email);
  });

  test('User cannot log in with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('Protected routes redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected routes
    const protectedRoutes = ['/dashboard', '/watchlist', '/watched', '/profile'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    }
  });

  test('User can log out successfully', async ({ page }) => {
    const testUser = await setupTestUser(page);

    // Logout
    await helpers.logout();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // User menu should not be visible
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();

    // Try to access protected route - should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('Password validation works correctly', async ({ page }) => {
    await page.goto('/register');

    const timestamp = Date.now();
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);

    // Test weak password
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Test password mismatch
    await page.fill('input[name="password"]', 'StrongPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    await page.click('button[type="submit"]');

    // Should show mismatch error
    await expect(page.locator('[data-testid="password-mismatch-error"]')).toBeVisible();
  });

  test('Email validation works correctly', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test User');

    // Test invalid email format
    await page.fill('input[name="email"]', 'invalidemail');
    await page.fill('input[name="password"]', 'ValidPass123!');
    await page.fill('input[name="confirmPassword"]', 'ValidPass123!');
    await page.click('button[type="submit"]');

    // Should show email validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('Session persistence works correctly', async ({ page, context }) => {
    const testUser = await setupTestUser(page);

    // Save cookies
    const cookies = await context.cookies();

    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // Should still be logged in
    await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();

    // Cleanup
    await cleanupTestData(page, testUser.email);
    await newPage.close();
  });
});
