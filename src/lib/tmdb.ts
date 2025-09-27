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
    return this.fetchFromTMDb<TMDbMovie>(`/movie/${movieId}`);
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
}

export const tmdbService = new TMDbService();
