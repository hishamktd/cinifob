import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test('Home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('Movies page has no accessibility violations', async ({ page }) => {
    await page.goto('/movies');
    await page.waitForSelector('[data-testid="movie-grid"]');
    await checkA11y(page);
  });

  test('All images have alt text', async ({ page }) => {
    await page.goto('/movies');
    await page.waitForSelector('[data-testid="movie-grid"]');

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => !img.alt || img.alt.trim() === '').length;
    });

    expect(imagesWithoutAlt).toBe(0);
  });

  test('All form inputs have labels', async ({ page }) => {
    await page.goto('/login');

    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.filter((input) => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');

        if (ariaLabel || ariaLabelledBy) return false;

        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) return false;
        }

        // Check if input is wrapped in label
        const parentLabel = input.closest('label');
        if (parentLabel) return false;

        return true;
      }).length;
    });

    expect(inputsWithoutLabels).toBe(0);
  });

  test('Focus order is logical', async ({ page }) => {
    await page.goto('/');

    // Get all focusable elements
    const focusableElements = await page.evaluate(() => {
      const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const elements = Array.from(document.querySelectorAll(selector));
      return elements.map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 30),
        tabIndex: el.getAttribute('tabindex'),
      }));
    });

    // Verify tab order makes sense (no random high tabindex values)
    const hasInvalidTabIndex = focusableElements.some(
      (el) => el.tabIndex && parseInt(el.tabIndex) > 0 && parseInt(el.tabIndex) !== 1,
    );

    expect(hasInvalidTabIndex).toBe(false);
  });

  test('Color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/');

    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });

  test('Keyboard navigation works for main navigation', async ({ page }) => {
    await page.goto('/');

    // Focus on first navigation link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip to main nav

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        hasOutline: styles.outline !== 'none' && styles.outline !== '',
        hasBorder: styles.border !== 'none' && styles.border !== '',
        hasBoxShadow: styles.boxShadow !== 'none' && styles.boxShadow !== '',
      };
    });

    // Should have visible focus indicator
    expect(
      focusedElement?.hasOutline || focusedElement?.hasBorder || focusedElement?.hasBoxShadow,
    ).toBeTruthy();

    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    // Should navigate to new page
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).not.toBe('/');
  });

  test('ARIA roles are used correctly', async ({ page }) => {
    await page.goto('/');

    const ariaIssues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check for main landmark
      const main = document.querySelector('main, [role="main"]');
      if (!main) issues.push('No main landmark found');

      // Check for navigation landmark
      const nav = document.querySelector('nav, [role="navigation"]');
      if (!nav) issues.push('No navigation landmark found');

      // Check buttons have correct roles
      const divButtons = document.querySelectorAll('div[onclick], span[onclick]');
      divButtons.forEach((el) => {
        if (!el.getAttribute('role') && !el.getAttribute('tabindex')) {
          issues.push('Clickable element without proper role or tabindex');
        }
      });

      return issues;
    });

    expect(ariaIssues).toHaveLength(0);
  });

  test('Screen reader announces page changes', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA live regions
    const hasLiveRegion = await page.evaluate(() => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
      return liveRegions.length > 0;
    });

    expect(hasLiveRegion).toBeTruthy();
  });

  test('Modal dialogs are accessible', async ({ page }) => {
    await page.goto('/movies');

    // Trigger a modal (e.g., search modal)
    await page.keyboard.press('Control+k'); // Assuming Ctrl+K opens search

    // Check modal has proper attributes
    const modalAttributes = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"], .modal');
      if (!modal) return null;

      return {
        hasRole: modal.getAttribute('role') === 'dialog',
        hasAriaModal: modal.getAttribute('aria-modal') === 'true',
        hasAriaLabel: !!modal.getAttribute('aria-label') || !!modal.getAttribute('aria-labelledby'),
        focusTrapped: true, // Would need more complex check
      };
    });

    if (modalAttributes) {
      expect(modalAttributes.hasRole || modalAttributes.hasAriaModal).toBeTruthy();
      expect(modalAttributes.hasAriaLabel).toBeTruthy();
    }

    // Close modal with Escape
    await page.keyboard.press('Escape');

    // Modal should be closed
    const modalClosed = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"], .modal');
      return !modal || (modal as HTMLElement).style.display === 'none';
    });

    expect(modalClosed).toBeTruthy();
  });

  test('Skip navigation link is present', async ({ page }) => {
    await page.goto('/');

    // Look for skip link
    const skipLink = await page.evaluate(() => {
      const link = document.querySelector('a[href="#main"], a[href="#content"]');
      if (!link) {
        // Check for visually hidden skip link
        const allLinks = Array.from(document.querySelectorAll('a'));
        return allLinks.some((link) => link.textContent?.toLowerCase().includes('skip'));
      }
      return true;
    });

    expect(skipLink).toBeTruthy();
  });

  test('Error messages are accessible', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form to trigger errors
    await page.click('button[type="submit"]');

    // Check error messages have proper ARIA
    await page.waitForTimeout(500);

    const errorAccessibility = await page.evaluate(() => {
      const errors = Array.from(document.querySelectorAll('[data-testid*="error"]'));
      return errors.every((error) => {
        const hasRole = error.getAttribute('role') === 'alert';
        const hasAriaLive =
          error.getAttribute('aria-live') === 'polite' ||
          error.getAttribute('aria-live') === 'assertive';
        const isAssociated = error.getAttribute('aria-describedby') || error.getAttribute('id');
        return hasRole || hasAriaLive || isAssociated;
      });
    });

    expect(errorAccessibility).toBeTruthy();
  });

  test('Tables are properly structured', async ({ page }) => {
    await page.goto('/dashboard');

    const tableIssues = await page.evaluate(() => {
      const issues: string[] = [];
      const tables = document.querySelectorAll('table');

      tables.forEach((table) => {
        // Check for caption or aria-label
        if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
          issues.push('Table without caption or aria-label');
        }

        // Check for headers
        const headers = table.querySelectorAll('th');
        if (headers.length === 0) {
          issues.push('Table without header cells');
        }

        // Check scope attributes on headers
        headers.forEach((header) => {
          if (!header.getAttribute('scope')) {
            issues.push('Header cell without scope attribute');
          }
        });
      });

      return issues;
    });

    // Tables should be properly structured
    expect(tableIssues.length).toBe(0);
  });

  test('Video content has captions', async ({ page }) => {
    await page.goto('/movies');

    // Navigate to a movie with trailer
    await page.locator('[data-testid="movie-card"]').first().click();

    // Check if video player exists
    const hasVideo = await page
      .locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]')
      .count();

    if (hasVideo > 0) {
      const videoAccessibility = await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        const issues: string[] = [];

        videos.forEach((video) => {
          // Check for track elements
          const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
          if (tracks.length === 0) {
            // Check for aria-label indicating captions are available
            if (!video.getAttribute('aria-label')?.toLowerCase().includes('caption')) {
              issues.push('Video without captions track');
            }
          }
        });

        return issues;
      });

      expect(videoAccessibility).toHaveLength(0);
    }
  });

  test('Touch targets are large enough', async ({ page }) => {
    await page.goto('/');

    const smallTouchTargets = await page.evaluate(() => {
      const minimumSize = 44; // WCAG recommends 44x44 pixels
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));

      return buttons.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width < minimumSize || rect.height < minimumSize;
      }).length;
    });

    // Most touch targets should meet size requirements
    expect(smallTouchTargets).toBeLessThan(5);
  });

  test('Language is properly declared', async ({ page }) => {
    await page.goto('/');

    const htmlLang = await page.evaluate(() => {
      return document.documentElement.lang;
    });

    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
  });
});
