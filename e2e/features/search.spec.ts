import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('Search Features - Comprehensive', () => {
  let helpers: TestHelpers;
  let testUser: any;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test.describe('Global Search', () => {
    test('Global search with keyboard shortcut', async ({ page }) => {
      await page.goto('/');

      // Open search with keyboard shortcut
      await page.keyboard.press('Control+k');

      // Search modal should open
      await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();

      // Type search query
      await page.fill('[data-testid="global-search-input"]', 'star wars');

      // Wait for results
      await page.waitForSelector('[data-testid="search-results-dropdown"]');

      // Results should be categorized
      await expect(page.locator('[data-testid="movies-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="tv-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="people-section"]')).toBeVisible();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Should navigate to selected item
      await expect(page.url()).toMatch(/\/(movies|tv|person)\/\d+/);
    });

    test('Search with filters', async ({ page }) => {
      await page.goto('/browse');

      // Open advanced search
      await page.click('[data-testid="advanced-search-button"]');

      // Set filters
      await page.selectOption('[data-testid="search-type"]', 'movie');
      await page.selectOption('[data-testid="search-year"]', '2023');
      await page.selectOption('[data-testid="search-genre"]', 'action');
      await page.selectOption('[data-testid="search-language"]', 'en');

      // Enter search query
      await page.fill('[data-testid="search-query"]', 'action');

      // Apply search
      await page.click('[data-testid="apply-search"]');

      // Wait for results
      await page.waitForSelector('[data-testid="filtered-results"]');

      // Verify filters are applied
      await expect(page.locator('[data-testid="active-filter-movie"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-filter-2023"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-filter-action"]')).toBeVisible();

      // Results should match filters
      const results = await page.locator('[data-testid="search-result-item"]').count();
      expect(results).toBeGreaterThan(0);

      // Each result should be a movie from 2023
      const firstResult = page.locator('[data-testid="search-result-item"]').first();
      await expect(firstResult.locator('[data-testid="result-type"]')).toContainText('Movie');
      await expect(firstResult.locator('[data-testid="result-year"]')).toContainText('2023');
    });

    test('Search history and suggestions', async ({ page }) => {
      // Perform initial searches to build history
      await page.goto('/');

      // Search 1
      await page.keyboard.press('Control+k');
      await page.fill('[data-testid="global-search-input"]', 'inception');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Search 2
      await page.keyboard.press('Control+k');
      await page.fill('[data-testid="global-search-input"]', 'dark knight');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Open search again
      await page.keyboard.press('Control+k');

      // Should show recent searches
      await expect(page.locator('[data-testid="recent-searches"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-search-item"]')).toHaveCount(2);

      // Click on recent search
      await page.click('[data-testid="recent-search-inception"]');

      // Should perform search
      await expect(page.locator('[data-testid="global-search-input"]')).toHaveValue('inception');

      // Clear search history
      await page.click('[data-testid="clear-search-history"]');

      // Confirm clearing
      await page.click('[data-testid="confirm-clear-history"]');

      // Recent searches should be empty
      await expect(page.locator('[data-testid="no-recent-searches"]')).toBeVisible();
    });

    test('Search autocomplete and suggestions', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Control+k');

      // Type slowly to trigger autocomplete
      await page.type('[data-testid="global-search-input"]', 'bat', { delay: 100 });

      // Wait for suggestions
      await page.waitForSelector('[data-testid="search-suggestions"]');

      // Should show suggestions
      const suggestions = await page.locator('[data-testid="suggestion-item"]').count();
      expect(suggestions).toBeGreaterThan(0);

      // Suggestions should contain search term
      const firstSuggestion = await page
        .locator('[data-testid="suggestion-item"]')
        .first()
        .textContent();
      expect(firstSuggestion?.toLowerCase()).toContain('bat');

      // Select suggestion with Tab
      await page.keyboard.press('Tab');

      // Input should be filled with suggestion
      const inputValue = await page.locator('[data-testid="global-search-input"]').inputValue();
      expect(inputValue.length).toBeGreaterThan(3);
    });

    test('Search with special characters and edge cases', async ({ page }) => {
      await page.goto('/');

      const testCases = [
        { query: 'The Matrix: Reloaded', expected: 'Matrix' },
        { query: 'Spider-Man', expected: 'Spider' },
        { query: '2001: A Space Odyssey', expected: '2001' },
        { query: 'Amélie', expected: 'Amélie' },
        { query: '12 Angry Men', expected: '12' },
        { query: '', expected: null }, // Empty search
        { query: '   ', expected: null }, // Whitespace only
        { query: 'a', expected: null }, // Single character
      ];

      for (const testCase of testCases) {
        await page.keyboard.press('Control+k');
        await page.fill('[data-testid="global-search-input"]', testCase.query);

        if (testCase.expected) {
          await page.waitForSelector('[data-testid="search-results-dropdown"]', { timeout: 5000 });
          const hasResults = await page.locator('[data-testid="search-result-item"]').count();
          expect(hasResults).toBeGreaterThan(0);

          if (testCase.expected) {
            const resultText = await page
              .locator('[data-testid="search-result-item"]')
              .first()
              .textContent();
            expect(resultText?.toLowerCase()).toContain(testCase.expected.toLowerCase());
          }
        } else {
          // Should show appropriate message for invalid search
          if (testCase.query.trim().length === 0) {
            await expect(page.locator('[data-testid="search-placeholder"]')).toBeVisible();
          } else if (testCase.query.trim().length === 1) {
            await expect(page.locator('[data-testid="min-length-message"]')).toBeVisible();
          }
        }

        // Close search modal
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('Content-Specific Search', () => {
    test('Movie search with advanced filters', async ({ page }) => {
      await page.goto('/movies');

      // Open filter panel
      await page.click('[data-testid="filter-panel-button"]');

      // Set multiple filters
      await page.selectOption('[data-testid="year-from"]', '2020');
      await page.selectOption('[data-testid="year-to"]', '2024');
      await page.click('[data-testid="genre-action"]');
      await page.click('[data-testid="genre-sci-fi"]');
      await page.selectOption('[data-testid="rating-min"]', '7');
      await page.selectOption('[data-testid="sort-by"]', 'rating.desc');

      // Apply filters
      await page.click('[data-testid="apply-filters"]');

      // Wait for filtered results
      await page.waitForSelector('[data-testid="movie-grid"]');

      // Verify filters are active
      const activeFilters = await page.locator('[data-testid="active-filter"]').count();
      expect(activeFilters).toBeGreaterThan(0);

      // Check first result meets criteria
      const firstMovie = page.locator('[data-testid="movie-card"]').first();
      const rating = await firstMovie.locator('[data-testid="movie-rating"]').textContent();
      expect(parseFloat(rating || '0')).toBeGreaterThanOrEqual(7);

      // Save filter preset
      await page.click('[data-testid="save-filter-preset"]');
      await page.fill('[data-testid="preset-name"]', 'Recent Sci-Fi Action');
      await page.click('[data-testid="confirm-save-preset"]');

      // Verify preset saved
      await expect(page.locator('[data-testid="preset-saved-message"]')).toBeVisible();
    });

    test('TV show search with season/episode filters', async ({ page }) => {
      await page.goto('/tv');

      // Search for long-running shows
      await page.fill('[data-testid="tv-search"]', 'series');

      // Filter by number of seasons
      await page.click('[data-testid="filter-panel-button"]');
      await page.selectOption('[data-testid="min-seasons"]', '5');
      await page.selectOption('[data-testid="status"]', 'returning');
      await page.click('[data-testid="apply-filters"]');

      // Wait for results
      await page.waitForSelector('[data-testid="tv-grid"]');

      // Each result should have 5+ seasons
      const firstShow = page.locator('[data-testid="tv-card"]').first();
      await firstShow.click();

      await page.waitForSelector('[data-testid="tv-details"]');
      const seasonsCount = await page.locator('[data-testid="seasons-count"]').textContent();
      expect(parseInt(seasonsCount?.match(/\d+/)?.[0] || '0')).toBeGreaterThanOrEqual(5);
    });

    test('Person search with filmography', async ({ page }) => {
      await page.goto('/');

      // Search for a person
      await page.keyboard.press('Control+k');
      await page.selectOption('[data-testid="search-category"]', 'person');
      await page.fill('[data-testid="global-search-input"]', 'Christopher Nolan');

      // Wait for results
      await page.waitForSelector('[data-testid="person-results"]');

      // Click on person result
      await page.click('[data-testid="person-result-item"]');

      // Should navigate to person page
      await expect(page.url()).toContain('/person/');

      // Check filmography is displayed
      await expect(page.locator('[data-testid="filmography-section"]')).toBeVisible();

      // Filter filmography
      await page.click('[data-testid="filter-director"]');
      const directorCredits = await page.locator('[data-testid="credit-item"]').count();
      expect(directorCredits).toBeGreaterThan(0);

      // Search within filmography
      await page.fill('[data-testid="filmography-search"]', 'Dark Knight');
      await page.waitForTimeout(300); // Debounce

      const filteredCredits = await page.locator('[data-testid="credit-item"]:visible').count();
      expect(filteredCredits).toBeLessThan(directorCredits);
    });
  });

  test.describe('Search Performance', () => {
    test('Search debouncing prevents excessive API calls', async ({ page }) => {
      let apiCalls = 0;

      // Monitor API calls
      page.on('request', (request) => {
        if (request.url().includes('/api/search')) {
          apiCalls++;
        }
      });

      await page.goto('/');
      await page.keyboard.press('Control+k');

      // Type quickly
      await page.type('[data-testid="global-search-input"]', 'fast typing test', { delay: 20 });

      // Wait for debounce
      await page.waitForTimeout(600);

      // Should make minimal API calls due to debouncing
      expect(apiCalls).toBeLessThanOrEqual(3);
    });

    test('Search results pagination', async ({ page }) => {
      await page.goto('/browse');

      // Search for common term to get many results
      await page.fill('[data-testid="search-input"]', 'the');
      await page.keyboard.press('Enter');

      // Wait for initial results
      await page.waitForSelector('[data-testid="search-results"]');

      // Check pagination exists
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

      // Get first page results
      const firstPageTitles = await page.locator('[data-testid="result-title"]').allTextContents();

      // Go to page 2
      await page.click('[data-testid="page-2"]');

      // Wait for new results
      await page.waitForTimeout(500);

      // Get second page results
      const secondPageTitles = await page.locator('[data-testid="result-title"]').allTextContents();

      // Results should be different
      expect(firstPageTitles).not.toEqual(secondPageTitles);

      // Test infinite scroll option
      await page.click('[data-testid="view-mode-infinite"]');

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Wait for more results to load
      await page.waitForTimeout(1000);

      // Should have more results than initial load
      const allResults = await page.locator('[data-testid="result-title"]').count();
      expect(allResults).toBeGreaterThan(20);
    });

    test('Search caching and offline functionality', async ({ page, context }) => {
      // First search online
      await page.goto('/');
      await page.keyboard.press('Control+k');
      await page.fill('[data-testid="global-search-input"]', 'inception');
      await page.keyboard.press('Enter');

      // Wait for results to cache
      await page.waitForSelector('[data-testid="search-results"]');
      const onlineResultCount = await page.locator('[data-testid="search-result-item"]').count();

      // Go offline
      await context.setOffline(true);

      // Try same search offline
      await page.keyboard.press('Control+k');
      await page.fill('[data-testid="global-search-input"]', 'inception');
      await page.keyboard.press('Enter');

      // Should show cached results
      const offlineResultCount = await page.locator('[data-testid="search-result-item"]').count();
      expect(offlineResultCount).toBe(onlineResultCount);

      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

      // Go back online
      await context.setOffline(false);
    });
  });

  test.describe('Search Accessibility', () => {
    test('Search is keyboard accessible', async ({ page }) => {
      await page.goto('/');

      // Tab to search button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Activate with Enter
      await page.keyboard.press('Enter');

      // Search modal should open
      await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();

      // Focus should be on input
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('INPUT');

      // Type search
      await page.keyboard.type('test');

      // Navigate results with Tab
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Should navigate to result
      await expect(page.url()).not.toBe('/');
    });

    test('Search announces results to screen readers', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Control+k');

      // Check for ARIA live region
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeAttached();

      // Perform search
      await page.fill('[data-testid="global-search-input"]', 'star');
      await page.waitForSelector('[data-testid="search-results-dropdown"]');

      // Live region should announce result count
      const announcement = await liveRegion.textContent();
      expect(announcement).toMatch(/\d+ results? found/);
    });
  });
});
