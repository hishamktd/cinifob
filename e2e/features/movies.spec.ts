import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('Movie Features', () => {
  let helpers: TestHelpers;
  let testUser: { email: string; password: string };

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test('User can browse popular movies', async ({ page }) => {
    await page.goto('/movies');

    // Wait for movies to load
    await page.waitForSelector('[data-testid="movie-grid"]');

    // Check that movies are displayed
    const movieCards = await page.locator('[data-testid="movie-card"]').count();
    expect(movieCards).toBeGreaterThan(0);

    // Check that each movie card has required elements
    const firstMovie = page.locator('[data-testid="movie-card"]').first();
    await expect(firstMovie.locator('img')).toBeVisible();
    await expect(firstMovie.locator('[data-testid="movie-title"]')).toBeVisible();
    await expect(firstMovie.locator('[data-testid="movie-rating"]')).toBeVisible();
  });

  test('User can search for movies', async ({ page }) => {
    await page.goto('/movies');

    // Search for a specific movie
    await page.fill('[data-testid="search-input"]', 'Inception');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]');

    // Verify search results contain the search term
    const results = await page.locator('[data-testid="movie-title"]').allTextContents();
    const hasRelevantResult = results.some((title) => title.toLowerCase().includes('inception'));
    expect(hasRelevantResult).toBeTruthy();
  });

  test('User can view movie details', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // Wait for movie details page
    await page.waitForSelector('[data-testid="movie-details"]');

    // Check that all movie details are displayed
    await expect(page.locator('[data-testid="movie-poster"]')).toBeVisible();
    await expect(page.locator('[data-testid="movie-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="movie-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="movie-release-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="movie-runtime"]')).toBeVisible();
    await expect(page.locator('[data-testid="movie-genres"]')).toBeVisible();
  });

  test('User can add movie to watchlist', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // Add to watchlist
    await page.click('[data-testid="add-to-watchlist"]');

    // Verify button changes to remove from watchlist
    await expect(page.locator('[data-testid="remove-from-watchlist"]')).toBeVisible();

    // Navigate to watchlist page
    await page.goto('/watchlist');

    // Verify movie appears in watchlist
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible();
  });

  test('User can remove movie from watchlist', async ({ page }) => {
    // First add a movie to watchlist
    await page.goto('/movies');
    await page.locator('[data-testid="movie-card"]').first().click();
    await page.click('[data-testid="add-to-watchlist"]');

    // Remove from watchlist
    await page.click('[data-testid="remove-from-watchlist"]');

    // Verify button changes back
    await expect(page.locator('[data-testid="add-to-watchlist"]')).toBeVisible();

    // Navigate to watchlist page
    await page.goto('/watchlist');

    // Verify watchlist is empty or movie is not there
    const movieCount = await page.locator('[data-testid="movie-card"]').count();
    expect(movieCount).toBe(0);
  });

  test('User can mark movie as watched', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // Mark as watched
    await page.click('[data-testid="mark-as-watched"]');

    // Verify button changes
    await expect(page.locator('[data-testid="mark-as-unwatched"]')).toBeVisible();

    // Navigate to watched page
    await page.goto('/watched');

    // Verify movie appears in watched list
    await expect(page.locator('[data-testid="movie-card"]').first()).toBeVisible();
  });

  test('User can rate a movie', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // First mark as watched (usually required for rating)
    await page.click('[data-testid="mark-as-watched"]');

    // Rate the movie (4 stars)
    await page.click('[data-testid="rating-star-4"]');

    // Verify rating is saved
    await expect(page.locator('[data-testid="user-rating"]')).toHaveText('4');

    // Add a review comment
    await page.fill('[data-testid="review-input"]', 'Great movie with amazing visuals!');
    await page.click('[data-testid="save-review"]');

    // Verify review is saved
    await expect(page.locator('[data-testid="user-review"]')).toContainText('Great movie');
  });

  test('User can filter movies by genre', async ({ page }) => {
    await page.goto('/movies');

    // Open filter menu
    await page.click('[data-testid="filter-button"]');

    // Select a genre (e.g., Action)
    await page.click('[data-testid="genre-action"]');

    // Apply filters
    await page.click('[data-testid="apply-filters"]');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="movie-grid"]');

    // Verify that movies are filtered
    const movieCards = await page.locator('[data-testid="movie-card"]').count();
    expect(movieCards).toBeGreaterThan(0);

    // Check that filtered label is shown
    await expect(page.locator('[data-testid="active-filter-action"]')).toBeVisible();
  });

  test('User can sort movies', async ({ page }) => {
    await page.goto('/movies');

    // Open sort menu
    await page.click('[data-testid="sort-button"]');

    // Sort by release date (newest first)
    await page.click('[data-testid="sort-release-date-desc"]');

    // Wait for sorted results
    await page.waitForSelector('[data-testid="movie-grid"]');

    // Get release dates of first two movies
    const dates = await page
      .locator('[data-testid="movie-release-date"]')
      .evaluateAll((elements) =>
        elements.slice(0, 2).map((el) => new Date(el.textContent || '').getTime()),
      );

    // Verify descending order
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
  });

  test('User can view movie cast and crew', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // Scroll to cast section
    await page.locator('[data-testid="cast-section"]').scrollIntoViewIfNeeded();

    // Verify cast members are displayed
    const castMembers = await page.locator('[data-testid="cast-member"]').count();
    expect(castMembers).toBeGreaterThan(0);

    // Click on a cast member
    await page.locator('[data-testid="cast-member"]').first().click();

    // Should navigate to person details or show modal
    await expect(page.locator('[data-testid="person-details"]')).toBeVisible();
  });

  test('User can watch movie trailers', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // Click on watch trailer button
    await page.click('[data-testid="watch-trailer"]');

    // Verify trailer player opens
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();

    // Close trailer
    await page.click('[data-testid="close-video"]');

    // Verify trailer player is closed
    await expect(page.locator('[data-testid="video-player"]')).not.toBeVisible();
  });

  test('User can view similar movies', async ({ page }) => {
    await page.goto('/movies');

    // Click on first movie
    await page.locator('[data-testid="movie-card"]').first().click();

    // Scroll to similar movies section
    await page.locator('[data-testid="similar-movies"]').scrollIntoViewIfNeeded();

    // Verify similar movies are displayed
    const similarMovies = await page.locator('[data-testid="similar-movie-card"]').count();
    expect(similarMovies).toBeGreaterThan(0);

    // Click on a similar movie
    await page.locator('[data-testid="similar-movie-card"]').first().click();

    // Should navigate to that movie's details page
    await page.waitForSelector('[data-testid="movie-details"]');
  });
});
