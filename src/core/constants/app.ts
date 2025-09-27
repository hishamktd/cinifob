export const APP_CONFIG = {
  NAME: 'CiniFob',
  DESCRIPTION: 'Track your movies, manage your watchlist, and discover new films',
  VERSION: '1.0.0',
  AUTHOR: 'CiniFob Team',
  DEFAULT_LOCALE: 'en-US',
  DEFAULT_TIMEZONE: 'UTC',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BROWSE: '/browse',
  MOVIES: '/movies',
  MOVIE_DETAIL: '/movies/:id',
  TV: '/tv',
  TV_DETAIL: '/tv/:id',
  WATCHLIST: '/watchlist',
  WATCHED: '/watched',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  SESSION: '/api/auth/session',

  // Movies
  MOVIES: '/api/movies',
  MOVIE_DETAIL: '/api/movies/:id',
  MOVIE_SEARCH: '/api/movies/search',

  // User Movies
  WATCHLIST: '/api/user/watchlist',
  WATCHED: '/api/user/watched',
  RATING: '/api/user/movies/:id/rating',

  // Stats
  STATS: '/api/user/stats',
  ACTIVITY: '/api/user/activity',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const MOVIE_STATUS = {
  WATCHLIST: 'watchlist',
  WATCHED: 'watched',
} as const;

export const RATING = {
  MIN: 1,
  MAX: 5,
  STEP: 0.5,
} as const;

export const CACHE_DURATION = {
  TMDB_DATA: 24 * 60 * 60 * 1000, // 24 hours
  USER_SESSION: 7 * 24 * 60 * 60 * 1000, // 7 days
  API_CACHE: 5 * 60 * 1000, // 5 minutes
} as const;

export const TMDB_CONFIG = {
  BASE_URL: process.env.TMDB_API_URL || 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  POSTER_SIZES: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'] as const,
  BACKDROP_SIZES: ['w300', 'w780', 'w1280', 'original'] as const,
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
export type MovieStatus = (typeof MOVIE_STATUS)[keyof typeof MOVIE_STATUS];
export type PosterSize = (typeof TMDB_CONFIG.POSTER_SIZES)[number];
export type BackdropSize = (typeof TMDB_CONFIG.BACKDROP_SIZES)[number];
