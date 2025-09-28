import { HttpMethod } from '@core/enums';
import { Movie, UserMovie } from '@/types';

class MovieService {
  private baseUrl = '/api';

  async getMovieDetails(tmdbId: number): Promise<{ movie: Movie }> {
    const response = await fetch(`${this.baseUrl}/movies/${tmdbId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }
    return response.json();
  }

  async addToWatchlist(movie: Partial<Movie>) {
    // If we don't have runtime, fetch full movie details
    let movieData = movie;
    if (!movie.runtime && movie.tmdbId) {
      try {
        const { movie: fullMovie } = await this.getMovieDetails(movie.tmdbId);
        movieData = { ...movie, ...fullMovie };
      } catch (error) {
        console.error('Failed to fetch movie details for runtime:', error);
        // Continue with the data we have
      }
    }

    const response = await fetch(`${this.baseUrl}/user/watchlist`, {
      method: HttpMethod.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        posterPath: movieData.posterPath,
        overview: movieData.overview,
        releaseDate: movieData.releaseDate,
        voteAverage: movieData.voteAverage,
        runtime: movieData.runtime,
        genres: movieData.genres,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to watchlist');
    }

    return response.json();
  }

  async removeFromWatchlist(tmdbId: number) {
    const response = await fetch(`${this.baseUrl}/user/watchlist?tmdbId=${tmdbId}`, {
      method: HttpMethod.DELETE,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from watchlist');
    }

    return response.json();
  }

  async markAsWatched(
    movie: Partial<Movie>,
    rating?: number,
    comment?: string,
    watchedDate?: Date,
  ) {
    // If we don't have runtime, fetch full movie details
    let movieData = movie;
    if (!movie.runtime && movie.tmdbId) {
      try {
        const { movie: fullMovie } = await this.getMovieDetails(movie.tmdbId);
        movieData = { ...movie, ...fullMovie };
      } catch (error) {
        console.error('Failed to fetch movie details for runtime:', error);
        // Continue with the data we have
      }
    }

    const response = await fetch(`${this.baseUrl}/user/watched`, {
      method: HttpMethod.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        posterPath: movieData.posterPath,
        overview: movieData.overview,
        releaseDate: movieData.releaseDate,
        voteAverage: movieData.voteAverage,
        runtime: movieData.runtime,
        genres: movieData.genres,
        rating,
        comment,
        watchedAt: watchedDate || new Date(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark as watched');
    }

    return response.json();
  }

  async removeFromWatched(tmdbId: number) {
    const response = await fetch(`${this.baseUrl}/user/watched?tmdbId=${tmdbId}`, {
      method: HttpMethod.DELETE,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from watched');
    }

    return response.json();
  }

  async getWatchlist(): Promise<{ watchlist: UserMovie[] }> {
    const response = await fetch(`${this.baseUrl}/user/watchlist`);

    if (!response.ok) {
      throw new Error('Failed to fetch watchlist');
    }

    return response.json();
  }

  async getWatchedMovies(): Promise<{ watched: UserMovie[] }> {
    const response = await fetch(`${this.baseUrl}/user/watched`);

    if (!response.ok) {
      throw new Error('Failed to fetch watched movies');
    }

    return response.json();
  }

  async searchMovies(params: { query?: string; page?: number; type?: string }): Promise<{
    movies: Partial<Movie>[];
    page: number;
    totalPages: number;
    totalResults: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.type) searchParams.append('type', params.type);

    const response = await fetch(`${this.baseUrl}/movies/search?${searchParams}`);

    if (!response.ok) {
      throw new Error('Failed to search movies');
    }

    return response.json();
  }

  async getPopularMovies(page = 1) {
    const response = await fetch(`${this.baseUrl}/movies/search?type=popular&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    return response.json();
  }

  async getTrendingMovies(timeWindow = 'week', page = 1) {
    const response = await fetch(
      `${this.baseUrl}/movies/search?type=trending&page=${page}&timeWindow=${timeWindow}`,
    );
    if (!response.ok) throw new Error('Failed to fetch trending movies');
    return response.json();
  }

  async getUpcomingMovies(page = 1) {
    const response = await fetch(`${this.baseUrl}/movies/search?type=upcoming&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch upcoming movies');
    return response.json();
  }

  async getNowPlayingMovies(page = 1) {
    const response = await fetch(`${this.baseUrl}/movies/search?type=now_playing&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch now playing movies');
    return response.json();
  }
}

export const movieService = new MovieService();
