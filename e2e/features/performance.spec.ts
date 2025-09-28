import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Home page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp, lcp;

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              lcp = entry.startTime;
            }
          });

          if (fcp && lcp) {
            resolve({ fcp, lcp });
          }
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        // Timeout after 5 seconds
        setTimeout(() => resolve({ fcp: null, lcp: null }), 5000);
      });
    });

    // First Contentful Paint should be under 1.8s
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800);
    }

    // Largest Contentful Paint should be under 2.5s
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
  });

  test('Images lazy load correctly', async ({ page }) => {
    await page.goto('/movies');

    // Get initial loaded images count
    const initialImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => img.complete && img.naturalHeight !== 0).length;
    });

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Get loaded images after scroll
    const afterScrollImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => img.complete && img.naturalHeight !== 0).length;
    });

    // More images should load after scrolling
    expect(afterScrollImages).toBeGreaterThan(initialImages);
  });

  test('API responses are cached correctly', async ({ page }) => {
    // First load - measure time
    const firstLoadStart = Date.now();
    await page.goto('/movies');
    await page.waitForSelector('[data-testid="movie-grid"]');
    const firstLoadTime = Date.now() - firstLoadStart;

    // Navigate away and back
    await page.goto('/dashboard');

    // Second load - should be faster due to caching
    const secondLoadStart = Date.now();
    await page.goto('/movies');
    await page.waitForSelector('[data-testid="movie-grid"]');
    const secondLoadTime = Date.now() - secondLoadStart;

    // Second load should be significantly faster
    expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.7);
  });

  test('Search debouncing works correctly', async ({ page }) => {
    await page.goto('/movies');

    // Track API calls
    let apiCallCount = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/movies/search')) {
        apiCallCount++;
      }
    });

    // Type quickly (simulating fast typing)
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.type('inception', { delay: 50 });

    // Wait for debounce
    await page.waitForTimeout(500);

    // Should make only 1 API call due to debouncing
    expect(apiCallCount).toBeLessThanOrEqual(2);
  });

  test('Bundle size is within limits', async ({ page }) => {
    const coverage = await page.coverage.startJSCoverage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const jsCoverage = await page.coverage.stopJSCoverage();

    const totalBytes = jsCoverage.reduce((total, entry) => {
      return total + entry.text.length;
    }, 0);

    // Total JS should be under 1MB for initial load
    expect(totalBytes).toBeLessThan(1024 * 1024);

    // Calculate used vs unused code
    const usedBytes = jsCoverage.reduce((total, entry) => {
      const usedLength = entry.ranges.reduce((sum, range) => {
        return sum + (range.end - range.start);
      }, 0);
      return total + usedLength;
    }, 0);

    const unusedPercentage = ((totalBytes - usedBytes) / totalBytes) * 100;

    // Unused code should be less than 50%
    expect(unusedPercentage).toBeLessThan(50);
  });

  test('Memory usage remains stable during navigation', async ({ page }) => {
    if (!page.evaluate(() => 'memory' in performance)) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory.usedJSHeapSize;
    });

    // Navigate through multiple pages
    const pages = ['/movies', '/tv', '/dashboard', '/watchlist', '/watched'];
    for (const route of pages) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory.usedJSHeapSize;
    });

    // Memory growth should be reasonable (less than 50MB)
    const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024);
    expect(memoryGrowth).toBeLessThan(50);
  });

  test('Infinite scroll performs well', async ({ page }) => {
    await page.goto('/movies');

    const scrollTimes = 5;
    const loadTimes: number[] = [];

    for (let i = 0; i < scrollTimes; i++) {
      const startTime = Date.now();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Wait for new content
      await page.waitForTimeout(500);

      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);
    }

    // Each scroll load should be under 1 second
    loadTimes.forEach((time) => {
      expect(time).toBeLessThan(1000);
    });

    // Load times should remain consistent (not degrading)
    const avgFirstHalf = loadTimes.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const avgSecondHalf = loadTimes.slice(-2).reduce((a, b) => a + b, 0) / 2;

    // Performance shouldn't degrade by more than 50%
    expect(avgSecondHalf).toBeLessThan(avgFirstHalf * 1.5);
  });

  test('Service Worker caches assets correctly', async ({ page, context }) => {
    // Check if service worker is registered
    await page.goto('/');

    const hasServiceWorker = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    if (!hasServiceWorker) {
      test.skip();
      return;
    }

    // Load page with network
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Try to navigate - should work with cached content
    await page.reload();

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    expect(title).toBeTruthy();

    // Go back online
    await context.setOffline(false);
  });

  test('Time to Interactive is acceptable', async ({ page }) => {
    await page.goto('/');

    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const navEntry = entries.find(
              (entry): entry is PerformanceNavigationTiming => entry.entryType === 'navigation',
            );
            if (navEntry) {
              resolve(navEntry.loadEventEnd);
            }
          }).observe({ entryTypes: ['navigation'] });
        } else {
          resolve(performance.timing.loadEventEnd - performance.timing.navigationStart);
        }
      });
    });

    // Time to Interactive should be under 3.8 seconds
    expect(Number(tti)).toBeLessThan(3800);
  });

  test('API rate limiting handles properly', async ({ page }) => {
    // Make rapid API calls
    const requests = Array.from({ length: 10 }, (_, i) =>
      page.evaluate(async (index) => {
        const response = await fetch(`/api/movies/search?query=test${index}`);
        return response.status;
      }, i),
    );

    const statuses = await Promise.all(requests);

    // Most requests should succeed
    const successCount = statuses.filter((status) => status === 200).length;
    expect(successCount).toBeGreaterThan(5);

    // If rate limited, should return 429
    const rateLimitedCount = statuses.filter((status) => status === 429).length;
    if (rateLimitedCount > 0) {
      // Wait and retry
      await page.waitForTimeout(1000);
      const retryResponse = await page.evaluate(async () => {
        const response = await fetch('/api/movies/search?query=retry');
        return response.status;
      });

      // Should work after waiting
      expect(retryResponse).toBe(200);
    }
  });
});
