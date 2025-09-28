import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/');
  }

  async searchContent(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.press('[data-testid="search-input"]', 'Enter');
    await this.page.waitForSelector('[data-testid="search-results"]');
  }

  async navigateToMovie(movieId: string) {
    await this.page.goto(`/movies/${movieId}`);
    await this.page.waitForSelector('[data-testid="movie-details"]');
  }

  async navigateToTVShow(showId: string) {
    await this.page.goto(`/tv/${showId}`);
    await this.page.waitForSelector('[data-testid="tv-details"]');
  }

  async addToWatchlist() {
    await this.page.click('[data-testid="add-to-watchlist"]');
    await expect(this.page.locator('[data-testid="remove-from-watchlist"]')).toBeVisible();
  }

  async markAsWatched() {
    await this.page.click('[data-testid="mark-as-watched"]');
    await expect(this.page.locator('[data-testid="mark-as-unwatched"]')).toBeVisible();
  }

  async rateContent(rating: number) {
    await this.page.click(`[data-testid="rating-star-${rating}"]`);
    await expect(this.page.locator('[data-testid="rating-success"]')).toBeVisible();
  }

  async waitForAPIResponse(endpoint: string) {
    return this.page.waitForResponse(
      (response) => response.url().includes(endpoint) && response.status() === 200,
    );
  }

  async checkAccessibility() {
    // Check for basic accessibility issues
    const violations = await this.page.evaluate(() => {
      const issues = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images without alt text`);
      }

      // Check for buttons without accessible text
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button) => {
        if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
          issues.push('Button without accessible text');
        }
      });

      return issues;
    });

    return violations;
  }
}

export async function setupTestUser(page: Page) {
  // Create a test user for the session
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
  };

  await page.goto('/register');
  await page.fill('input[name="name"]', testUser.name);
  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="password"]', testUser.password);
  await page.fill('input[name="confirmPassword"]', testUser.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');

  return testUser;
}

export async function cleanupTestData(page: Page, userEmail: string) {
  // This would typically call an API endpoint to clean up test data
  // For now, we'll just log out
  const helpers = new TestHelpers(page);
  await helpers.logout();
}
