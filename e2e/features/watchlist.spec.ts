import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('Watchlist Features - Comprehensive', () => {
  let helpers: TestHelpers;
  let testUser: { email: string; password: string };

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test.describe('Adding to Watchlist', () => {
    test('Add movie to watchlist from browse page', async ({ page }) => {
      await page.goto('/movies');

      // Hover over movie card to reveal quick actions
      const firstMovie = page.locator('[data-testid="movie-card"]').first();
      await firstMovie.hover();

      // Click quick add to watchlist button
      await firstMovie.locator('[data-testid="quick-add-watchlist"]').click();

      // Verify toast notification
      await expect(page.locator('[data-testid="toast-success"]')).toContainText(
        'Added to watchlist',
      );

      // Verify button changed state
      await expect(firstMovie.locator('[data-testid="in-watchlist-indicator"]')).toBeVisible();
    });

    test('Add multiple movies to watchlist', async ({ page }) => {
      await page.goto('/movies');

      // Add 5 movies to watchlist
      for (let i = 0; i < 5; i++) {
        const movie = page.locator('[data-testid="movie-card"]').nth(i);
        await movie.hover();
        await movie.locator('[data-testid="quick-add-watchlist"]').click();
        await page.waitForTimeout(200); // Avoid rapid clicking
      }

      // Navigate to watchlist
      await page.goto('/watchlist');

      // Verify all 5 movies are present
      const movieCount = await page.locator('[data-testid="movie-card"]').count();
      expect(movieCount).toBe(5);
    });

    test('Add TV show with season selection to watchlist', async ({ page }) => {
      await page.goto('/tv');

      // Click on a TV show
      await page.locator('[data-testid="tv-card"]').first().click();

      // Click advanced add to watchlist
      await page.click('[data-testid="add-to-watchlist-advanced"]');

      // Select specific seasons in modal
      await expect(page.locator('[data-testid="season-selection-modal"]')).toBeVisible();
      await page.click('[data-testid="season-checkbox-1"]');
      await page.click('[data-testid="season-checkbox-2"]');

      // Add note
      await page.fill('[data-testid="watchlist-note"]', 'Recommended by friend');

      // Set priority
      await page.selectOption('[data-testid="watchlist-priority"]', 'high');

      // Confirm
      await page.click('[data-testid="confirm-add-watchlist"]');

      // Verify in watchlist with correct metadata
      await page.goto('/watchlist');
      await page.click('[data-testid="watchlist-tv-tab"]');

      const tvShow = page.locator('[data-testid="tv-card"]').first();
      await expect(tvShow).toBeVisible();
      await expect(tvShow.locator('[data-testid="priority-badge-high"]')).toBeVisible();
      await expect(tvShow.locator('[data-testid="seasons-badge"]')).toContainText('2 seasons');
    });

    test('Prevent duplicate additions to watchlist', async ({ page }) => {
      await page.goto('/movies');

      // Add movie to watchlist
      const movie = page.locator('[data-testid="movie-card"]').first();
      const movieTitle = await movie.locator('[data-testid="movie-title"]').textContent();
      await movie.click();
      await page.click('[data-testid="add-to-watchlist"]');

      // Try to add same movie again
      await page.click('[data-testid="add-to-watchlist"]');

      // Should show already in watchlist message
      await expect(page.locator('[data-testid="toast-info"]')).toContainText(
        'Already in watchlist',
      );

      // Navigate to watchlist
      await page.goto('/watchlist');

      // Should only have one instance
      const titles = await page.locator('[data-testid="movie-title"]').allTextContents();
      const matchingTitles = titles.filter((t) => t === movieTitle);
      expect(matchingTitles.length).toBe(1);
    });
  });

  test.describe('Watchlist Management', () => {
    test.beforeEach(async ({ page }) => {
      // Add test data to watchlist
      await page.goto('/movies');
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="movie-card"]').nth(i).click();
        await page.click('[data-testid="add-to-watchlist"]');
        await page.goBack();
      }

      await page.goto('/tv');
      for (let i = 0; i < 2; i++) {
        await page.locator('[data-testid="tv-card"]').nth(i).click();
        await page.click('[data-testid="add-to-watchlist"]');
        await page.goBack();
      }

      await page.goto('/watchlist');
    });

    test('Filter watchlist by content type', async ({ page }) => {
      // Default should show all
      let totalCount = await page.locator('[data-testid*="-card"]').count();
      expect(totalCount).toBe(5);

      // Filter movies only
      await page.click('[data-testid="watchlist-movies-tab"]');
      let movieCount = await page.locator('[data-testid="movie-card"]').count();
      expect(movieCount).toBe(3);

      // Filter TV shows only
      await page.click('[data-testid="watchlist-tv-tab"]');
      let tvCount = await page.locator('[data-testid="tv-card"]').count();
      expect(tvCount).toBe(2);
    });

    test('Sort watchlist items', async ({ page }) => {
      // Sort by date added (newest first)
      await page.selectOption('[data-testid="sort-watchlist"]', 'date_added_desc');

      const dates = await page.locator('[data-testid="date-added"]').allTextContents();
      const timestamps = dates.map((d) => new Date(d).getTime());

      // Verify descending order
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }

      // Sort alphabetically
      await page.selectOption('[data-testid="sort-watchlist"]', 'title_asc');

      const titles = await page.locator('[data-testid*="title"]').allTextContents();
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);

      // Sort by priority
      await page.selectOption('[data-testid="sort-watchlist"]', 'priority_desc');

      // High priority items should appear first
      const firstItem = page.locator('[data-testid*="-card"]').first();
      const priorityBadge = firstItem.locator('[data-testid*="priority-badge"]');
      if ((await priorityBadge.count()) > 0) {
        await expect(priorityBadge).toBeVisible();
      }
    });

    test('Search within watchlist', async ({ page }) => {
      // Search for specific content
      const firstTitle = await page.locator('[data-testid*="title"]').first().textContent();
      const searchTerm = firstTitle?.substring(0, 3) || 'test';

      await page.fill('[data-testid="watchlist-search"]', searchTerm);
      await page.waitForTimeout(300); // Debounce

      // Verify filtered results
      const visibleCards = await page.locator('[data-testid*="-card"]:visible').count();
      expect(visibleCards).toBeGreaterThan(0);
      expect(visibleCards).toBeLessThan(5);

      // Clear search
      await page.click('[data-testid="clear-search"]');

      // All items should be visible again
      const allCards = await page.locator('[data-testid*="-card"]').count();
      expect(allCards).toBe(5);
    });

    test('Bulk selection and removal', async ({ page }) => {
      // Enable selection mode
      await page.click('[data-testid="enable-selection-mode"]');

      // Select multiple items
      await page.click('[data-testid="select-item-0"]');
      await page.click('[data-testid="select-item-1"]');
      await page.click('[data-testid="select-item-2"]');

      // Verify selection count
      await expect(page.locator('[data-testid="selection-count"]')).toContainText('3 selected');

      // Bulk remove
      await page.click('[data-testid="bulk-remove"]');
      await page.click('[data-testid="confirm-bulk-remove"]');

      // Verify items removed
      await page.waitForTimeout(500);
      const remainingCount = await page.locator('[data-testid*="-card"]').count();
      expect(remainingCount).toBe(2);
    });

    test('Edit watchlist item details', async ({ page }) => {
      // Click edit on first item
      const firstItem = page.locator('[data-testid*="-card"]').first();
      await firstItem.hover();
      await firstItem.locator('[data-testid="edit-item"]').click();

      // Edit modal should open
      await expect(page.locator('[data-testid="edit-watchlist-modal"]')).toBeVisible();

      // Update priority
      await page.selectOption('[data-testid="edit-priority"]', 'urgent');

      // Update note
      await page.fill('[data-testid="edit-note"]', 'Watch this weekend!');

      // Add tags
      await page.fill('[data-testid="add-tag"]', 'must-watch');
      await page.keyboard.press('Enter');
      await page.fill('[data-testid="add-tag"]', 'award-winner');
      await page.keyboard.press('Enter');

      // Save changes
      await page.click('[data-testid="save-watchlist-edit"]');

      // Verify updates
      await expect(firstItem.locator('[data-testid="priority-badge-urgent"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="item-note"]')).toContainText(
        'Watch this weekend',
      );
      await expect(firstItem.locator('[data-testid="tag-must-watch"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="tag-award-winner"]')).toBeVisible();
    });

    test('Group watchlist by categories', async ({ page }) => {
      // Enable grouping
      await page.click('[data-testid="group-by-dropdown"]');
      await page.click('[data-testid="group-by-priority"]');

      // Verify groups are created
      await expect(page.locator('[data-testid="group-header-high"]')).toBeVisible();
      await expect(page.locator('[data-testid="group-header-normal"]')).toBeVisible();

      // Collapse a group
      await page.click('[data-testid="collapse-group-normal"]');

      // Items in that group should be hidden
      const normalGroupItems = await page
        .locator('[data-testid="group-normal"] [data-testid*="-card"]')
        .count();
      expect(normalGroupItems).toBe(0);

      // Expand group
      await page.click('[data-testid="expand-group-normal"]');

      // Items should be visible again
      const expandedItems = await page
        .locator('[data-testid="group-normal"] [data-testid*="-card"]')
        .count();
      expect(expandedItems).toBeGreaterThan(0);
    });
  });

  test.describe('Watchlist Synchronization', () => {
    test('Watchlist syncs across different pages', async ({ page, context }) => {
      await page.goto('/movies');

      // Add movie to watchlist
      const movieTitle = await page.locator('[data-testid="movie-title"]').first().textContent();
      await page.locator('[data-testid="movie-card"]').first().click();
      await page.click('[data-testid="add-to-watchlist"]');

      // Open new tab
      const newPage = await context.newPage();
      await newPage.goto('/watchlist');

      // Movie should appear in watchlist immediately
      await expect(newPage.locator('[data-testid="movie-title"]').first()).toContainText(
        movieTitle || '',
      );

      // Remove from watchlist in new tab
      await newPage.locator('[data-testid="movie-card"]').first().hover();
      await newPage.click('[data-testid="remove-from-watchlist"]');

      // Go back to original page
      await page.reload();

      // Button should reflect removal
      await expect(page.locator('[data-testid="add-to-watchlist"]')).toBeVisible();

      await newPage.close();
    });

    test('Watchlist persists after logout/login', async ({ page }) => {
      // Add items to watchlist
      await page.goto('/movies');
      const movieTitle = await page.locator('[data-testid="movie-title"]').first().textContent();
      await page.locator('[data-testid="movie-card"]').first().click();
      await page.click('[data-testid="add-to-watchlist"]');

      // Logout
      await helpers.logout();

      // Login again
      await helpers.login(testUser.email, testUser.password);

      // Navigate to watchlist
      await page.goto('/watchlist');

      // Items should still be there
      await expect(page.locator('[data-testid="movie-title"]').first()).toContainText(
        movieTitle || '',
      );
    });
  });

  test.describe('Watchlist Export/Import', () => {
    test('Export watchlist to different formats', async ({ page }) => {
      // Add items to watchlist first
      await page.goto('/movies');
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="movie-card"]').nth(i).click();
        await page.click('[data-testid="add-to-watchlist"]');
        await page.goBack();
      }

      await page.goto('/watchlist');

      // Test CSV export
      await page.click('[data-testid="export-watchlist"]');
      await page.click('[data-testid="export-csv"]');

      const csvDownload = page.waitForEvent('download');
      await page.click('[data-testid="confirm-export"]');
      const csv = await csvDownload;
      expect(csv.suggestedFilename()).toContain('.csv');

      // Test JSON export
      await page.click('[data-testid="export-watchlist"]');
      await page.click('[data-testid="export-json"]');

      const jsonDownload = page.waitForEvent('download');
      await page.click('[data-testid="confirm-export"]');
      const json = await jsonDownload;
      expect(json.suggestedFilename()).toContain('.json');
    });

    test('Import watchlist from file', async ({ page }) => {
      await page.goto('/watchlist');

      // Create test import file
      const importData = JSON.stringify([
        { title: 'Test Movie 1', type: 'movie', tmdbId: 123 },
        { title: 'Test Movie 2', type: 'movie', tmdbId: 456 },
      ]);

      // Click import button
      await page.click('[data-testid="import-watchlist"]');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'watchlist.json',
        mimeType: 'application/json',
        buffer: Buffer.from(importData),
      });

      // Preview import
      await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-count"]')).toContainText('2 items');

      // Confirm import
      await page.click('[data-testid="confirm-import"]');

      // Verify items added
      await page.waitForTimeout(1000);
      const itemCount = await page.locator('[data-testid="movie-card"]').count();
      expect(itemCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Watchlist Notifications', () => {
    test('Show notification for upcoming releases in watchlist', async ({ page }) => {
      // Navigate to watchlist
      await page.goto('/watchlist');

      // Check for upcoming releases section
      const upcomingSection = page.locator('[data-testid="upcoming-releases-watchlist"]');
      if ((await upcomingSection.count()) > 0) {
        await expect(upcomingSection).toBeVisible();

        // Verify countdown timer
        const countdown = page.locator('[data-testid="release-countdown"]').first();
        if ((await countdown.count()) > 0) {
          const countdownText = await countdown.textContent();
          expect(countdownText).toMatch(/\d+ days?/);
        }
      }
    });

    test('Mark items as watched from watchlist', async ({ page }) => {
      // Add movie to watchlist
      await page.goto('/movies');
      await page.locator('[data-testid="movie-card"]').first().click();
      const movieTitle = await page.locator('[data-testid="movie-title"]').textContent();
      await page.click('[data-testid="add-to-watchlist"]');

      // Go to watchlist
      await page.goto('/watchlist');

      // Mark as watched directly from watchlist
      const movieCard = page.locator('[data-testid="movie-card"]').first();
      await movieCard.hover();
      await movieCard.locator('[data-testid="mark-watched-from-watchlist"]').click();

      // Confirm with rating
      await expect(page.locator('[data-testid="quick-rate-modal"]')).toBeVisible();
      await page.click('[data-testid="quick-rate-4"]');
      await page.click('[data-testid="confirm-watched"]');

      // Item should be removed from watchlist
      await page.waitForTimeout(500);
      const remainingTitles = await page.locator('[data-testid="movie-title"]').allTextContents();
      expect(remainingTitles).not.toContain(movieTitle);

      // Verify in watched list
      await page.goto('/watched');
      await expect(page.locator('[data-testid="movie-title"]').first()).toContainText(
        movieTitle || '',
      );
    });
  });
});
