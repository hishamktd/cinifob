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

  private async fetchFromTMDb<T>(
    endpoint: string,
    params?: Record<string, string>,
    retries = 3,
  ): Promise<T> {
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

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          // Add keep-alive to reuse connections
          keepalive: true,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // If it's a 429 (rate limit), wait before retrying
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * attempt;
            console.warn(
              `TMDb rate limit hit. Waiting ${waitTime}ms before retry ${attempt}/${retries}`,
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }

          // For other errors, throw immediately
          const errorBody = await response.text();
          throw new Error(`TMDb API error ${response.status}: ${errorBody || response.statusText}`);
        }

        // Success - return the data
        return await response.json();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Log the error with attempt info
        console.error(`TMDb fetch attempt ${attempt}/${retries} failed:`, {
          endpoint,
          error: lastError.message,
          errorName: lastError.name,
        });

        // Don't retry on specific errors
        if (lastError.name === 'AbortError') {
          throw new Error(`TMDb API request timeout after ${attempt} attempts`);
        }

        // If ECONNRESET or network error, wait before retrying
        if (
          lastError.message.includes('ECONNRESET') ||
          lastError.message.includes('ETIMEDOUT') ||
          lastError.message.includes('fetch failed') ||
          lastError.message.includes('network')
        ) {
          if (attempt < retries) {
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
            // Only log on final retry attempt
            if (attempt === retries - 1) {
              console.log(`TMDb API network error, final retry attempt...`);
            }
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }
        }

        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw new Error(
            `Failed to fetch from TMDb after ${retries} attempts: ${lastError.message}`,
          );
        }
      }
    }

    // Should never reach here, but just in case
    throw lastError || new Error('Unknown error occurred while fetching from TMDb');
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
