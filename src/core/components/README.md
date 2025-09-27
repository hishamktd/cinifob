# CiniFob Core Components

This directory contains reusable UI components for the CiniFob movie app. All components follow Material UI theming, support dark/light mode, and are fully responsive.

## Components

### AppButton

A standardized button component with loading states and icon support.

```tsx
import { AppButton } from '@core/components';

// Basic usage
<AppButton>Click me</AppButton>

// With icons and loading
<AppButton
  variant="contained"
  startIcon="mdi:download"
  loading={isLoading}
>
  Download
</AppButton>
```

### AppMovieCard

Enhanced movie card component with actions, ratings, and hover effects.

```tsx
import { AppMovieCard } from '@core/components';

<AppMovieCard
  movie={movie}
  size="medium"
  showActions={true}
  showRating={true}
  userRating={4.5}
  onAddToWatchlist={() => {}}
  onMarkAsWatched={() => {}}
  onRatingChange={(rating) => {}}
/>;
```

### AppPagination

Comprehensive pagination component with item counts and responsive design.

```tsx
import { AppPagination } from '@core/components';

<AppPagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={1000}
  itemsPerPage={20}
  onPageChange={(newPage) => setPage(newPage)}
  showInfo={true}
  position="center"
/>;
```

### AppLoader

Versatile loading component with multiple display types.

```tsx
import { AppLoader, MovieCardSkeleton } from '@core/components';

// Circular loader
<AppLoader type="circular" message="Loading movies..." />

// Skeleton loader
<AppLoader type="skeleton" skeletonLines={3} />

// Specialized skeletons
<MovieCardSkeleton count={4} />
```

### AppEmptyState

Consistent empty state component with actions.

```tsx
import { AppEmptyState, NoMoviesFound } from '@core/components';

// Generic empty state
<AppEmptyState
  icon="mdi:inbox-outline"
  title="No items found"
  description="Try a different search"
  actionLabel="Reset"
  onAction={() => {}}
/>

// Predefined states
<NoMoviesFound
  searchQuery={query}
  onClearSearch={() => setQuery('')}
/>
```

### AppRating

Rating component with display and input modes.

```tsx
import { AppRating, MovieRating, UserRating } from '@core/components';

// Display rating
<MovieRating rating={4.2} count={150} />

// Interactive rating
<UserRating
  rating={userRating}
  onRatingChange={(rating) => setRating(rating)}
/>
```

### AppSearchBar

Advanced search bar with suggestions, filters, and recent searches.

```tsx
import { AppSearchBar } from '@core/components';

<AppSearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={(query) => performSearch(query)}
  placeholder="Search movies..."
  suggestions={suggestions}
  loading={loading}
  recentSearches={recentSearches}
  filterOptions={[{ label: 'Action', value: 'action', icon: 'mdi:sword' }]}
/>;
```

## Component Props

### Size Variants

Most components support size variants: `small`, `medium`, `large`

### Theme Integration

All components automatically adapt to light/dark themes and use Material UI's theming system.

### Responsive Design

Components are mobile-first and include responsive breakpoints.

### Accessibility

Components include proper ARIA labels, keyboard navigation, and screen reader support.

## Usage in Pages

Import multiple components efficiently:

```tsx
import {
  AppMovieCard,
  AppPagination,
  AppSearchBar,
  AppLoader,
  AppEmptyState,
  MainLayout,
} from '@core/components';
```
