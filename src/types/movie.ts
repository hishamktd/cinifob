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
  budget?: number | string;
  revenue?: number | string;
  tagline?: string;
  homepage?: string;
  imdbId?: string;
  originalLanguage?: string;
  originalTitle?: string;
  popularity?: number;
  productionCompanies?: string[];
  productionCountries?: string[];
  spokenLanguages?: string[];
  status?: string;
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
  budget?: number;
  revenue?: number;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string | null;
    origin_country?: string | null;
  }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{
    iso_639_1: string;
    name: string;
    english_name?: string;
  }>;
  status?: string;
  videos?: TMDbVideos;
  credits?: TMDbCredits;
  recommendations?: TMDbSearchResponse;
  similar?: TMDbSearchResponse;
}

export interface TMDbSearchResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDbVideos {
  results: Array<{
    id: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
  }>;
}

export interface TMDbCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path?: string;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path?: string;
  }>;
}

export interface TMDbGenre {
  id: number;
  name: string;
}
