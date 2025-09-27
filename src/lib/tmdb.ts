import { TMDB_CONFIG } from '@core/constants';
import { TMDbMovie, TMDbSearchResponse } from '@/types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.warn('TMDB_API_KEY is not set. Movie features will not work.');
}

interface TMDbOptions {
  page?: number;
  query?: string;
  genre?: string;
  year?: number;
}

class TMDbService {
  private baseUrl = TMDB_CONFIG.BASE_URL;
  private apiKey = TMDB_API_KEY || '';

  private async fetchFromTMDb<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3 seconds

      response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);
    } catch (error: unknown) {
      console.error('TMDb fetch error:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('TMDb API request timeout');
        }
        throw new Error(`Failed to connect to TMDb API: ${error.message}`);
      }
    }

    if (!response || !response.ok) {
      throw new Error(`TMDb API error: ${response?.status}`);
    }

    return response.json();
  }

  async searchMovies(options: TMDbOptions): Promise<TMDbSearchResponse> {
    const params: Record<string, string> = {
      page: (options.page || 1).toString(),
    };

    if (options.query) {
      params.query = options.query;
    }

    if (options.year) {
      params.year = options.year.toString();
    }

    return this.fetchFromTMDb<TMDbSearchResponse>('/search/movie', params);
  }

  async getPopularMovies(page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>('/movie/popular', {
      page: page.toString(),
    });
  }

  async getTrendingMovies(page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>('/trending/movie/week', {
      page: page.toString(),
    });
  }

  async getMovieDetails(movieId: number): Promise<TMDbMovie> {
    // Fetch movie details with additional information (videos, credits)
    const params = {
      append_to_response: 'videos,credits,recommendations,similar',
    };
    return this.fetchFromTMDb<TMDbMovie>(`/movie/${movieId}`, params);
  }

  async getMoviesByGenre(genreId: string, page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>('/discover/movie', {
      page: page.toString(),
      with_genres: genreId,
    });
  }

  async getUpcomingMovies(page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>('/movie/upcoming', {
      page: page.toString(),
    });
  }

  async getNowPlayingMovies(page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>('/movie/now_playing', {
      page: page.toString(),
    });
  }

  async getTopRatedMovies(page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>('/movie/top_rated', {
      page: page.toString(),
    });
  }

  async getMovieRecommendations(movieId: number, page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>(`/movie/${movieId}/recommendations`, {
      page: page.toString(),
    });
  }

  async getSimilarMovies(movieId: number, page = 1): Promise<TMDbSearchResponse> {
    return this.fetchFromTMDb<TMDbSearchResponse>(`/movie/${movieId}/similar`, {
      page: page.toString(),
    });
  }

  async getMovieVideos(movieId: number) {
    return this.fetchFromTMDb(`/movie/${movieId}/videos`);
  }

  async getMovieCredits(movieId: number) {
    return this.fetchFromTMDb(`/movie/${movieId}/credits`);
  }

  async discoverMovies(
    options: {
      sortBy?: string;
      year?: number;
      withGenres?: string;
      page?: number;
    } = {},
  ): Promise<TMDbSearchResponse> {
    const params: Record<string, string> = {
      page: (options.page || 1).toString(),
      sort_by: options.sortBy || 'popularity.desc',
    };

    if (options.year) params.year = options.year.toString();
    if (options.withGenres) params.with_genres = options.withGenres;

    return this.fetchFromTMDb<TMDbSearchResponse>('/discover/movie', params);
  }

  async getGenres(): Promise<Array<{ id: number; name: string }>> {
    const response = await this.fetchFromTMDb<{ genres: Array<{ id: number; name: string }> }>(
      '/genre/movie/list',
    );
    return response.genres || [];
  }
}

export const tmdbService = new TMDbService();
