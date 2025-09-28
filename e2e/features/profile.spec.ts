import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('User Profile Features', () => {
  let helpers: TestHelpers;
  let testUser: { email: string; password: string };

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);

    // Add some test data
    await page.goto('/movies');
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="movie-card"]').nth(i).click();
      await page.click('[data-testid="mark-as-watched"]');
      await page.click(`[data-testid="rating-star-${i + 3}"]`);
      await page.goBack();
    }

    await page.goto('/profile');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test('Profile displays user information', async ({ page }) => {
    // Check user info section
    await expect(page.locator('[data-testid="user-name"]')).toContainText(testUser.name);
    await expect(page.locator('[data-testid="user-email"]')).toContainText(testUser.email);
    await expect(page.locator('[data-testid="member-since"]')).toBeVisible();
  });

  test('Profile shows viewing statistics', async ({ page }) => {
    // Check statistics section
    await expect(page.locator('[data-testid="total-movies-watched"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-tv-episodes"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-watch-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();

    // Verify movie count
    const movieCount = await page.locator('[data-testid="total-movies-watched"]').textContent();
    expect(parseInt(movieCount || '0')).toBeGreaterThanOrEqual(3);
  });

  test('Profile displays favorite genres', async ({ page }) => {
    // Check favorite genres section
    await expect(page.locator('[data-testid="favorite-genres"]')).toBeVisible();

    // Verify genre tags are displayed
    const genreTags = await page.locator('[data-testid="genre-tag"]').count();
    expect(genreTags).toBeGreaterThan(0);

    // Check genre percentages
    const firstGenre = page.locator('[data-testid="genre-tag"]').first();
    await expect(firstGenre.locator('[data-testid="genre-percentage"]')).toBeVisible();
  });

  test('Profile shows viewing history chart', async ({ page }) => {
    // Check viewing history visualization
    await expect(page.locator('[data-testid="viewing-history-chart"]')).toBeVisible();

    // Verify chart has data points
    const chartData = await page.locator('[data-testid="chart-data-point"]').count();
    expect(chartData).toBeGreaterThan(0);

    // Check time period selector
    await expect(page.locator('[data-testid="time-period-selector"]')).toBeVisible();

    // Change time period
    await page.selectOption('[data-testid="time-period-selector"]', '30');
    await page.waitForTimeout(500); // Wait for chart to update

    // Verify chart updated
    await expect(page.locator('[data-testid="viewing-history-chart"]')).toBeVisible();
  });

  test('User can edit profile information', async ({ page }) => {
    // Click edit profile button
    await page.click('[data-testid="edit-profile-button"]');

    // Check edit form is displayed
    await expect(page.locator('[data-testid="edit-profile-form"]')).toBeVisible();

    // Update name
    await page.fill('[data-testid="edit-name-input"]', 'Updated Name');

    // Update bio
    await page.fill(
      '[data-testid="edit-bio-input"]',
      'Movie enthusiast and TV show binge-watcher!',
    );

    // Save changes
    await page.click('[data-testid="save-profile-button"]');

    // Verify changes are saved
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Updated Name');
    await expect(page.locator('[data-testid="user-bio"]')).toContainText('Movie enthusiast');
  });

  test('User can change preferences', async ({ page }) => {
    // Open preferences section
    await page.click('[data-testid="preferences-tab"]');

    // Change theme preference
    await page.click('[data-testid="theme-selector"]');
    await page.click('[data-testid="theme-dark"]');

    // Change language preference
    await page.selectOption('[data-testid="language-selector"]', 'es');

    // Change notification preferences
    await page.click('[data-testid="email-notifications-toggle"]');

    // Save preferences
    await page.click('[data-testid="save-preferences-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="preferences-saved-message"]')).toBeVisible();

    // Verify theme changed
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
  });

  test('Profile shows achievement badges', async ({ page }) => {
    // Check achievements section
    const achievementsSection = page.locator('[data-testid="achievements-section"]');
    if ((await achievementsSection.count()) > 0) {
      await expect(achievementsSection).toBeVisible();

      // Check for achievement badges
      const badges = await page.locator('[data-testid="achievement-badge"]').count();

      // User should have at least "First Movie" badge
      expect(badges).toBeGreaterThan(0);

      // Click on a badge to see details
      await page.locator('[data-testid="achievement-badge"]').first().click();
      await expect(page.locator('[data-testid="achievement-details"]')).toBeVisible();
    }
  });

  test('Profile displays rating breakdown', async ({ page }) => {
    // Check rating breakdown section
    await expect(page.locator('[data-testid="rating-breakdown"]')).toBeVisible();

    // Verify rating distribution
    const ratingRows = await page.locator('[data-testid="rating-row"]').count();
    expect(ratingRows).toBe(5); // 5-star rating system

    // Check that user's ratings are displayed
    const hasRatings = await page
      .locator('[data-testid="rating-count"]')
      .evaluateAll((elements) => elements.some((el) => parseInt(el.textContent || '0') > 0));
    expect(hasRatings).toBeTruthy();
  });

  test('User can export viewing data', async ({ page }) => {
    // Click export data button
    await page.click('[data-testid="export-data-button"]');

    // Check export options modal
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();

    // Select export format
    await page.click('[data-testid="export-format-csv"]');

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-export-button"]');
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain('cinifob-export');
  });

  test('Profile shows social connections', async ({ page }) => {
    // Check social connections section
    const socialSection = page.locator('[data-testid="social-connections"]');
    if ((await socialSection.count()) > 0) {
      await expect(socialSection).toBeVisible();

      // Check for connect buttons
      await expect(page.locator('[data-testid="connect-tmdb"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-trakt"]')).toBeVisible();
    }
  });

  test('User can delete account', async ({ page }) => {
    // Scroll to danger zone
    await page.locator('[data-testid="danger-zone"]').scrollIntoViewIfNeeded();

    // Click delete account button
    await page.click('[data-testid="delete-account-button"]');

    // Check confirmation modal
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();

    // Type confirmation text
    await page.fill('[data-testid="delete-confirmation-input"]', 'DELETE');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Try to login with deleted account
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('Profile shows privacy settings', async ({ page }) => {
    // Navigate to privacy tab
    await page.click('[data-testid="privacy-tab"]');

    // Check privacy options
    await expect(page.locator('[data-testid="profile-visibility"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-visibility"]')).toBeVisible();
    await expect(page.locator('[data-testid="watchlist-visibility"]')).toBeVisible();

    // Change privacy settings
    await page.selectOption('[data-testid="profile-visibility"]', 'private');
    await page.selectOption('[data-testid="activity-visibility"]', 'friends');

    // Save settings
    await page.click('[data-testid="save-privacy-button"]');

    // Verify saved
    await expect(page.locator('[data-testid="privacy-saved-message"]')).toBeVisible();
  });
});
