import { Movie, UserMovie } from '@/types';

class MovieService {
  private baseUrl = '/api';

  async addToWatchlist(movie: Partial<Movie>) {
    const response = await fetch(`${this.baseUrl}/user/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        overview: movie.overview,
        releaseDate: movie.releaseDate,
        voteAverage: movie.voteAverage,
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
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from watchlist');
    }

    return response.json();
  }

  async markAsWatched(movie: Partial<Movie>, rating?: number) {
    const response = await fetch(`${this.baseUrl}/user/watched`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        overview: movie.overview,
        releaseDate: movie.releaseDate,
        voteAverage: movie.voteAverage,
        rating,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark as watched');
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

  async searchMovies(params: {
    query?: string;
    page?: number;
    type?: string;
  }): Promise<{
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

  async getMovieDetails(tmdbId: number): Promise<Movie> {
    const response = await fetch(`${this.baseUrl}/movies/${tmdbId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }

    return response.json();
  }
}

export const movieService = new MovieService();