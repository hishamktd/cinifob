# CiniFob Test Documentation

## Overview

This document outlines the comprehensive testing strategy for the CiniFob application. All tests must pass before code can be pushed to the repository.

## Test Coverage

### 1. E2E Tests (439 tests across 5 browsers)

- **Authentication**: Registration, login, logout, session management
- **Movies**: Browse, search, details, watchlist, ratings
- **TV Shows**: Browse, search, episodes, season tracking
- **Dashboard**: Statistics, activity, recommendations
- **Profile**: User settings, preferences, data export
- **Watchlist**: Add/remove, sorting, filtering, bulk operations
- **Search**: Global search, filters, autocomplete, history
- **API**: All endpoints, error handling, rate limiting
- **Performance**: Load times, caching, memory usage, bundle size
- **Accessibility**: WCAG compliance, keyboard navigation, screen readers

### 2. Unit Tests

- Components: UI components with Material-UI
- Utilities: Helper functions and data transformations
- Hooks: Custom React hooks
- Services: API service layers

### 3. Integration Tests

- Database operations with Prisma
- Authentication flows with NextAuth
- API route handlers
- State management with Redux

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test                 # Watch mode
npm run test -- --run        # Single run
npm run test:ui              # UI mode
npm run test:coverage        # With coverage

# Run E2E tests
npm run test:e2e             # All E2E tests
npm run test:e2e:ui          # UI mode
npm run test:e2e:debug       # Debug mode

# Run specific test files
npx playwright test e2e/features/movies.spec.ts
npx vitest src/__tests__/components/AppButton.test.tsx

# Run tests by browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Pre-Push Validation

Tests automatically run before pushing via git hooks:

```bash
# The following tests run automatically on git push:
1. TypeScript type checking
2. Unit tests
3. E2E tests
4. Build validation
```

To bypass (only in emergencies):

```bash
git push --no-verify
```

## Test Configuration

### Playwright (E2E)

- **Config**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Features**:
  - Screenshots on failure
  - Video recording on retry
  - Trace collection
  - Parallel execution
  - Auto-retry on failure

### Vitest (Unit)

- **Config**: `vitest.config.ts`
- **Coverage Thresholds**:
  - Branches: 70%
  - Functions: 70%
  - Lines: 70%
  - Statements: 70%

### GitHub Actions CI

- **Workflow**: `.github/workflows/test.yml`
- **Jobs**:
  - Unit tests
  - E2E tests
  - API tests
  - Build validation
  - Lighthouse performance
  - Security audit

## Test Data Management

### Test Users

- Automatically created for each test session
- Cleaned up after tests complete
- Isolated from production data

### Database

- Uses separate test database in CI
- Automatic seeding before tests
- Rollback after test completion

## Performance Benchmarks

### Core Web Vitals

- **FCP**: < 2 seconds
- **LCP**: < 4 seconds
- **CLS**: < 0.1
- **TTI**: < 5 seconds

### Lighthouse Scores

- **Performance**: > 75
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90
- **PWA**: > 50

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

- Color contrast ratios
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels and roles

## Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers, setupTestUser, cleanupTestData } from '../utils/test-helpers';

test.describe('Feature Name', () => {
  let helpers: TestHelpers;
  let testUser: any;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    testUser = await setupTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testUser.email);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Unit Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component Name', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
```

## Debugging Tests

### E2E Debugging

```bash
# Run with UI for visual debugging
npm run test:e2e:ui

# Run in debug mode with browser tools
npm run test:e2e:debug

# Run with trace viewer
npx playwright test --trace on
npx playwright show-trace
```

### Unit Test Debugging

```bash
# Run with UI
npm run test:ui

# Run specific test with console output
npx vitest src/__tests__/specific.test.ts --reporter=verbose
```

## CI/CD Integration

### Branch Protection Rules

- All tests must pass
- Code coverage must meet thresholds
- No security vulnerabilities
- Build must succeed

### Test Reports

- Available in GitHub Actions artifacts
- Playwright HTML report
- Coverage reports
- Lighthouse performance reports

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Cleanup**: Always clean up test data
3. **Meaningful Names**: Use descriptive test names
4. **Avoid Flakiness**: Use proper waits and assertions
5. **Test Real Scenarios**: Focus on user journeys
6. **Performance**: Keep tests fast and efficient
7. **Maintenance**: Update tests with feature changes

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in config
   - Check for network issues
   - Verify selectors are correct

2. **Flaky tests**
   - Add proper wait conditions
   - Use data-testid attributes
   - Avoid hardcoded delays

3. **Database conflicts**
   - Ensure proper cleanup
   - Use unique test data
   - Check migration status

4. **Browser issues**
   - Update Playwright browsers: `npx playwright install`
   - Install system dependencies: `sudo npx playwright install-deps`

## Support

For test-related issues:

1. Check this documentation
2. Review test output logs
3. Check GitHub Actions logs
4. Create an issue with test details

## Test Metrics

Current test statistics:

- **Total Tests**: 439
- **Browsers**: 5 (Chrome, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- **Test Categories**: 10 (Auth, Movies, TV, Dashboard, Profile, Watchlist, Search, API, Performance, Accessibility)
- **Average Runtime**: ~15 minutes (full suite)
- **Coverage Target**: 70% minimum
