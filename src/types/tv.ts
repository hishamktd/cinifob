// TV Show Types
export interface TVShow {
  id: number;
  tmdbId: number;
  name: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  firstAirDate?: Date | string | null;
  lastAirDate?: Date | string | null;
  voteAverage?: number | null;
  voteCount?: number | null;
  popularity?: number | null;
  status?: string | null;
  type?: string | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  episodeRunTime?: number[] | null;
  genres?: string[] | { id: number; name: string }[] | null;
  originCountry?: string[] | null;
  originalLanguage?: string | null;
  originalName?: string | null;
  homepage?: string | null;
  inProduction?: boolean | null;
  tagline?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  networks?: { id: number; name: string; logoPath?: string }[] | null;
  createdBy?: { id: number; name: string; profilePath?: string }[] | null;
}

export interface Season {
  id: number;
  tvShowId: number;
  tmdbId: number;
  seasonNumber: number;
  name?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  airDate?: Date | string | null;
  episodeCount?: number | null;
  voteAverage?: number | null;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  seasonId: number;
  tmdbId: number;
  episodeNumber: number;
  name?: string | null;
  overview?: string | null;
  stillPath?: string | null;
  airDate?: Date | string | null;
  runtime?: number | null;
  voteAverage?: number | null;
  voteCount?: number | null;
  guestStars?: string[] | null;
  crew?: string[] | null;
  productionCode?: string | null;
}

export type TVShowStatus =
  | 'WATCHLIST'
  | 'WATCHING'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'DROPPED'
  | 'PLAN_TO_WATCH';
export type EpisodeStatus = 'WATCHED' | 'PLANNED' | 'SKIPPED';

export interface UserTVShow {
  id: number;
  userId: string;
  tvShowId: number;
  status: TVShowStatus;
  rating?: number | null;
  startDate?: Date | string | null;
  completedDate?: Date | string | null;
  currentSeason?: number | null;
  currentEpisode?: number | null;
  comment?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tvShow?: TVShow;
  episodesWatched?: number;
  totalEpisodes?: number;
}

export interface UserEpisode {
  id: number;
  userId: string;
  episodeId: number;
  status: EpisodeStatus;
  watchedDate?: Date | string | null;
  rating?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  episode?: Episode;
}

// Combined content type for unified handling
export interface ContentItem {
  id: number;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string; // For movies
  name?: string; // For TV shows
  overview?: string | undefined;
  posterPath?: string | null | undefined;
  backdropPath?: string | null | undefined;
  date?: string | undefined; // releaseDate for movies, firstAirDate for TV
  voteAverage?: number | null;
  voteCount?: number | null;
  popularity?: number | null;
  runtime?: number | null; // For movies
  episodeRunTime?: number[] | null; // For TV shows
  genres?: string[] | { id: number; name: string }[] | null;
  genreIds?: number[];
  _createdAt?: string | Date; // For sorting by date added
  numberOfSeasons?: number | null; // For TV shows
  numberOfEpisodes?: number | null; // For TV shows
  status?: string | null; // For TV shows
}

// TV Show search parameters
export interface TVSearchParams {
  query?: string;
  type?: 'popular' | 'on_the_air' | 'airing_today' | 'top_rated';
  genre?: string;
  page?: number;
  sortBy?: string;
  year?: number;
  network?: string;
  status?: string;
}

// TV Show filters
export interface TVFilters {
  genres?: number[];
  year?: number;
  status?: 'Returning Series' | 'Ended' | 'Canceled' | 'In Production';
  networks?: number[];
  sortBy?:
    | 'popularity.desc'
    | 'popularity.asc'
    | 'vote_average.desc'
    | 'vote_average.asc'
    | 'first_air_date.desc'
    | 'first_air_date.asc';
}
