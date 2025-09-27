export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: Date;
  genres: string[];
  runtime?: number;
  voteAverage?: number;
  voteCount?: number;
  cachedAt: Date;
  createdAt: Date;
}

export interface UserMovie {
  id: number;
  userId: number;
  movieId: number;
  status: 'watchlist' | 'watched';
  watchedAt?: Date;
  rating?: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  movie?: Movie;
}

export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date: string;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  vote_average: number;
  vote_count: number;
}

export interface TMDbSearchResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}