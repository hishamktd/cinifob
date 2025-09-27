export enum StorageKey {
  // Auth
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  USER_DATA = 'user_data',

  // Theme
  THEME_MODE = 'theme_mode',
  THEME_COLOR = 'theme_color',

  // Preferences
  LANGUAGE = 'language',
  TIMEZONE = 'timezone',
  DATE_FORMAT = 'date_format',

  // Movie
  RECENT_SEARCHES = 'recent_searches',
  FAVORITE_GENRES = 'favorite_genres',
  VIEW_MODE = 'view_mode',

  // Cache
  CACHE_TIMESTAMP = 'cache_timestamp',
  CACHED_MOVIES = 'cached_movies',
}

export enum CacheDuration {
  MINUTE = 60 * 1000,
  FIVE_MINUTES = 5 * 60 * 1000,
  HOUR = 60 * 60 * 1000,
  DAY = 24 * 60 * 60 * 1000,
  WEEK = 7 * 24 * 60 * 60 * 1000,
}
