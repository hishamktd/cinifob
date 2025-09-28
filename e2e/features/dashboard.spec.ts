import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('Dashboard Features', () => {
  let helpers: TestHelpers;
  let testUser: any;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);

    // Add some test data (watched movies/shows)
    await page.goto('/movies');
    await page.locator('[data-testid="movie-card"]').first().click();
    await page.click('[data-testid="mark-as-watched"]');
    await page.click('[data-testid="rating-star-4"]');

    await page.goto('/dashboard');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test('Dashboard displays user statistics', async ({ page }) => {
    // Check main statistics cards
    await expect(page.locator('[data-testid="total-watched-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-movies-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-tv-shows-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-watch-time-card"]')).toBeVisible();

    // Verify statistics have values
    const moviesCount = await page.locator('[data-testid="movies-count"]').textContent();
    expect(parseInt(moviesCount || '0')).toBeGreaterThanOrEqual(1);
  });

  test('Dashboard shows recent activity', async ({ page }) => {
    // Check recent activity section
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();

    // Verify activity items
    const activityItems = await page.locator('[data-testid="activity-item"]').count();
    expect(activityItems).toBeGreaterThan(0);

    // Check activity item details
    const firstActivity = page.locator('[data-testid="activity-item"]').first();
    await expect(firstActivity.locator('[data-testid="activity-title"]')).toBeVisible();
    await expect(firstActivity.locator('[data-testid="activity-timestamp"]')).toBeVisible();
    await expect(firstActivity.locator('[data-testid="activity-type"]')).toBeVisible();
  });

  test('Dashboard displays watchlist preview', async ({ page }) => {
    // Add item to watchlist first
    await page.goto('/movies');
    await page.locator('[data-testid="movie-card"]').nth(1).click();
    await page.click('[data-testid="add-to-watchlist"]');

    await page.goto('/dashboard');

    // Check watchlist preview section
    await expect(page.locator('[data-testid="watchlist-preview"]')).toBeVisible();

    // Verify watchlist items
    const watchlistItems = await page.locator('[data-testid="watchlist-preview-item"]').count();
    expect(watchlistItems).toBeGreaterThan(0);

    // Click "View All" to navigate to full watchlist
    await page.click('[data-testid="view-all-watchlist"]');
    await expect(page).toHaveURL('/watchlist');
  });

  test('Dashboard shows genre distribution chart', async ({ page }) => {
    // Check genre distribution visualization
    await expect(page.locator('[data-testid="genre-chart"]')).toBeVisible();

    // Verify chart has data
    const chartElements = await page.locator('[data-testid="chart-segment"]').count();
    expect(chartElements).toBeGreaterThan(0);

    // Check chart legend
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('Dashboard displays rating distribution', async ({ page }) => {
    // Check rating distribution
    await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible();

    // Verify rating bars
    const ratingBars = await page.locator('[data-testid="rating-bar"]').count();
    expect(ratingBars).toBe(5); // 1-5 star ratings

    // Check that at least one rating has data
    const hasRating = await page
      .locator('[data-testid="rating-count"]')
      .evaluateAll((elements) => elements.some((el) => parseInt(el.textContent || '0') > 0));
    expect(hasRating).toBeTruthy();
  });

  test('Dashboard shows upcoming releases from watchlist', async ({ page }) => {
    // Check upcoming releases section
    const upcomingSection = page.locator('[data-testid="upcoming-releases"]');
    if ((await upcomingSection.count()) > 0) {
      await expect(upcomingSection).toBeVisible();

      // Check for release items
      const upcomingItems = await page.locator('[data-testid="upcoming-item"]').count();
      if (upcomingItems > 0) {
        const firstItem = page.locator('[data-testid="upcoming-item"]').first();
        await expect(firstItem.locator('[data-testid="release-date"]')).toBeVisible();
      }
    }
  });

  test('Dashboard quick actions work correctly', async ({ page }) => {
    // Test quick action buttons
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();

    // Browse Movies quick action
    await page.click('[data-testid="quick-browse-movies"]');
    await expect(page).toHaveURL('/movies');
    await page.goBack();

    // Browse TV Shows quick action
    await page.click('[data-testid="quick-browse-tv"]');
    await expect(page).toHaveURL('/tv');
    await page.goBack();

    // Search quick action
    await page.click('[data-testid="quick-search"]');
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Dashboard shows personalized recommendations', async ({ page }) => {
    // Check recommendations section
    const recommendationsSection = page.locator('[data-testid="recommendations"]');
    if ((await recommendationsSection.count()) > 0) {
      await expect(recommendationsSection).toBeVisible();

      // Verify recommendation items
      const recommendations = await page.locator('[data-testid="recommendation-card"]').count();
      if (recommendations > 0) {
        // Click on a recommendation
        await page.locator('[data-testid="recommendation-card"]').first().click();
        // Should navigate to movie/tv details
        await expect(page.url()).toMatch(/\/(movies|tv)\/\d+/);
      }
    }
  });

  test('Dashboard data refreshes correctly', async ({ page }) => {
    // Get initial movie count
    const initialCount = await page.locator('[data-testid="movies-count"]').textContent();

    // Watch another movie
    await page.goto('/movies');
    await page.locator('[data-testid="movie-card"]').nth(2).click();
    await page.click('[data-testid="mark-as-watched"]');

    // Return to dashboard
    await page.goto('/dashboard');

    // Verify count updated
    const newCount = await page.locator('[data-testid="movies-count"]').textContent();
    expect(parseInt(newCount || '0')).toBeGreaterThan(parseInt(initialCount || '0'));
  });

  test('Dashboard handles empty states correctly', async ({ page }) => {
    // Create a new user with no data
    await helpers.logout();
    const emptyUser = await setupTestUser(page);

    await page.goto('/dashboard');

    // Check for empty state messages
    await expect(page.locator('[data-testid="no-activity-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-watchlist-message"]')).toBeVisible();

    // Check that statistics show zeros
    const moviesCount = await page.locator('[data-testid="movies-count"]').textContent();
    expect(moviesCount).toBe('0');

    await cleanupTestData(page, emptyUser.email);
  });
});
