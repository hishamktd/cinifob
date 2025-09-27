/**
 * Application route constants
 * Centralized location for all application routes
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Movie routes
  MOVIES: '/movies',
  MOVIE_DETAILS: (tmdbId: number | string) => `/movies/${tmdbId}`,
  BROWSE: '/browse',
  TV: '/tv',

  // User routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  WATCHLIST: '/watchlist',
  WATCHED: '/watched',

  // Error routes
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',

  // API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth/callback/credentials',
      LOGOUT: '/api/auth/signout',
      REGISTER: '/api/auth/register',
      SESSION: '/api/auth/session',
    },
    MOVIES: {
      SEARCH: '/api/movies/search',
      DETAILS: (tmdbId: number | string) => `/api/movies/${tmdbId}`,
      SEED: '/api/movies/seed',
    },
    USER: {
      WATCHLIST: '/api/user/watchlist',
      WATCHED: '/api/user/watched',
      MOVIE_STATUS: '/api/user/movie-status',
    },
    GENRES: {
      SEED: '/api/genres/seed',
      SYNC: '/api/genres/sync',
    },
  },
} as const;

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.WATCHLIST,
  ROUTES.WATCHED,
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.MOVIES,
  ROUTES.BROWSE,
  ROUTES.TV,
] as const;

/**
 * Navigation menu items
 */
export const NAV_ITEMS = [
  { label: 'Movies', path: ROUTES.MOVIES, icon: 'mdi:movie' },
  { label: 'Browse', path: ROUTES.BROWSE, icon: 'mdi:magnify' },
  { label: 'TV Shows', path: ROUTES.TV, icon: 'mdi:television' },
  { label: 'Watchlist', path: ROUTES.WATCHLIST, icon: 'mdi:bookmark', protected: true },
  { label: 'Watched', path: ROUTES.WATCHED, icon: 'mdi:check-circle', protected: true },
  { label: 'Profile', path: ROUTES.PROFILE, icon: 'mdi:account', protected: true },
] as const;

/**
 * Helper function to check if a route is protected
 */
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
};

/**
 * Helper function to get route label
 */
export const getRouteLabel = (path: string): string => {
  const item = NAV_ITEMS.find((item) => item.path === path);
  return item?.label || '';
};
