import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('TV Show Features', () => {
  let helpers: TestHelpers;
  let testUser: { email: string; password: string };

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test('User can browse popular TV shows', async ({ page }) => {
    await page.goto('/tv');

    // Wait for TV shows to load
    await page.waitForSelector('[data-testid="tv-grid"]');

    // Check that TV shows are displayed
    const tvCards = await page.locator('[data-testid="tv-card"]').count();
    expect(tvCards).toBeGreaterThan(0);

    // Check that each TV card has required elements
    const firstShow = page.locator('[data-testid="tv-card"]').first();
    await expect(firstShow.locator('img')).toBeVisible();
    await expect(firstShow.locator('[data-testid="tv-title"]')).toBeVisible();
    await expect(firstShow.locator('[data-testid="tv-rating"]')).toBeVisible();
  });

  test('User can search for TV shows', async ({ page }) => {
    await page.goto('/tv');

    // Search for a specific TV show
    await page.fill('[data-testid="search-input"]', 'Breaking Bad');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]');

    // Verify search results
    const results = await page.locator('[data-testid="tv-title"]').allTextContents();
    const hasRelevantResult = results.some(
      (title) => title.toLowerCase().includes('breaking') || title.toLowerCase().includes('bad'),
    );
    expect(hasRelevantResult).toBeTruthy();
  });

  test('User can view TV show details', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Wait for TV show details page
    await page.waitForSelector('[data-testid="tv-details"]');

    // Check that all TV show details are displayed
    await expect(page.locator('[data-testid="tv-poster"]')).toBeVisible();
    await expect(page.locator('[data-testid="tv-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="tv-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="tv-first-air-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="tv-seasons"]')).toBeVisible();
    await expect(page.locator('[data-testid="tv-genres"]')).toBeVisible();
  });

  test('User can view season and episode information', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Click on seasons tab
    await page.click('[data-testid="seasons-tab"]');

    // Verify seasons are displayed
    const seasons = await page.locator('[data-testid="season-item"]').count();
    expect(seasons).toBeGreaterThan(0);

    // Click on first season
    await page.locator('[data-testid="season-item"]').first().click();

    // Verify episodes are displayed
    await page.waitForSelector('[data-testid="episode-list"]');
    const episodes = await page.locator('[data-testid="episode-item"]').count();
    expect(episodes).toBeGreaterThan(0);

    // Check episode details
    const firstEpisode = page.locator('[data-testid="episode-item"]').first();
    await expect(firstEpisode.locator('[data-testid="episode-number"]')).toBeVisible();
    await expect(firstEpisode.locator('[data-testid="episode-title"]')).toBeVisible();
    await expect(firstEpisode.locator('[data-testid="episode-air-date"]')).toBeVisible();
  });

  test('User can track episode progress', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Go to episodes
    await page.click('[data-testid="seasons-tab"]');
    await page.locator('[data-testid="season-item"]').first().click();

    // Mark first episode as watched
    const firstEpisode = page.locator('[data-testid="episode-item"]').first();
    await firstEpisode.locator('[data-testid="mark-episode-watched"]').click();

    // Verify episode is marked as watched
    await expect(firstEpisode.locator('[data-testid="episode-watched-check"]')).toBeVisible();

    // Verify progress bar updates
    await expect(page.locator('[data-testid="season-progress"]')).toBeVisible();
    const progressText = await page.locator('[data-testid="season-progress"]').textContent();
    expect(progressText).toContain('1');
  });

  test('User can mark entire season as watched', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Go to seasons
    await page.click('[data-testid="seasons-tab"]');

    // Mark entire first season as watched
    await page.locator('[data-testid="mark-season-watched"]').first().click();

    // Confirm action
    await page.click('[data-testid="confirm-mark-season"]');

    // Verify all episodes in season are marked as watched
    await page.locator('[data-testid="season-item"]').first().click();
    const watchedEpisodes = await page.locator('[data-testid="episode-watched-check"]').count();
    const totalEpisodes = await page.locator('[data-testid="episode-item"]').count();
    expect(watchedEpisodes).toBe(totalEpisodes);
  });

  test('User can add TV show to watchlist', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Add to watchlist
    await page.click('[data-testid="add-to-watchlist"]');

    // Verify button changes
    await expect(page.locator('[data-testid="remove-from-watchlist"]')).toBeVisible();

    // Navigate to watchlist page
    await page.goto('/watchlist');

    // Switch to TV shows tab
    await page.click('[data-testid="watchlist-tv-tab"]');

    // Verify TV show appears in watchlist
    await expect(page.locator('[data-testid="tv-card"]').first()).toBeVisible();
  });

  test('User can rate a TV show', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Rate the show (5 stars)
    await page.click('[data-testid="rating-star-5"]');

    // Verify rating is saved
    await expect(page.locator('[data-testid="user-rating"]')).toHaveText('5');

    // Add a review
    await page.fill(
      '[data-testid="review-input"]',
      'Amazing show with great character development!',
    );
    await page.click('[data-testid="save-review"]');

    // Verify review is saved
    await expect(page.locator('[data-testid="user-review"]')).toContainText('Amazing show');
  });

  test('User can filter TV shows by genre', async ({ page }) => {
    await page.goto('/tv');

    // Open filter menu
    await page.click('[data-testid="filter-button"]');

    // Select a genre (e.g., Drama)
    await page.click('[data-testid="genre-drama"]');

    // Apply filters
    await page.click('[data-testid="apply-filters"]');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="tv-grid"]');

    // Verify that shows are filtered
    const tvCards = await page.locator('[data-testid="tv-card"]').count();
    expect(tvCards).toBeGreaterThan(0);

    // Check that filtered label is shown
    await expect(page.locator('[data-testid="active-filter-drama"]')).toBeVisible();
  });

  test('User can view currently airing shows', async ({ page }) => {
    await page.goto('/tv');

    // Click on "Currently Airing" filter
    await page.click('[data-testid="currently-airing-filter"]');

    // Wait for results
    await page.waitForSelector('[data-testid="tv-grid"]');

    // Verify shows are displayed
    const tvCards = await page.locator('[data-testid="tv-card"]').count();
    expect(tvCards).toBeGreaterThan(0);

    // Verify status badge on cards
    await expect(page.locator('[data-testid="status-airing"]').first()).toBeVisible();
  });

  test('User can view TV show cast and crew', async ({ page }) => {
    await page.goto('/tv');

    // Click on first TV show
    await page.locator('[data-testid="tv-card"]').first().click();

    // Navigate to cast tab
    await page.click('[data-testid="cast-tab"]');

    // Verify cast members are displayed
    const castMembers = await page.locator('[data-testid="cast-member"]').count();
    expect(castMembers).toBeGreaterThan(0);

    // Check for show creators
    await expect(page.locator('[data-testid="show-creators"]')).toBeVisible();
  });

  test('User can track progress across multiple seasons', async ({ page }) => {
    await page.goto('/tv');

    // Click on a TV show with multiple seasons
    await page.locator('[data-testid="tv-card"]').first().click();

    // Go to seasons tab
    await page.click('[data-testid="seasons-tab"]');

    // Mark episodes from different seasons
    // Season 1, Episode 1
    await page.locator('[data-testid="season-item"]').nth(0).click();
    await page.locator('[data-testid="mark-episode-watched"]').first().click();

    // Go back to seasons list
    await page.click('[data-testid="back-to-seasons"]');

    // Season 2, Episode 1 (if exists)
    const season2 = page.locator('[data-testid="season-item"]').nth(1);
    if ((await season2.count()) > 0) {
      await season2.click();
      await page.locator('[data-testid="mark-episode-watched"]').first().click();
    }

    // Check overall show progress
    await expect(page.locator('[data-testid="overall-progress"]')).toBeVisible();
  });

  test('User can view upcoming episodes', async ({ page }) => {
    await page.goto('/tv');

    // Click on a currently airing show
    await page.click('[data-testid="currently-airing-filter"]');
    await page.locator('[data-testid="tv-card"]').first().click();

    // Check for next episode information
    const nextEpisode = page.locator('[data-testid="next-episode"]');
    if ((await nextEpisode.count()) > 0) {
      await expect(nextEpisode).toBeVisible();
      await expect(nextEpisode.locator('[data-testid="next-episode-date"]')).toBeVisible();
    }
  });
});
