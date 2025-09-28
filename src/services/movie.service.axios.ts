import axios from 'axios';

class MovieService {
  private baseUrl = '/api';

  async searchMovies(query: string, page = 1) {
    const response = await axios.get(`${this.baseUrl}/movies/search`, {
      params: { query, page },
    });
    return response.data;
  }

  async getMovieDetails(movieId: number) {
    const response = await axios.get(`${this.baseUrl}/movies/${movieId}`);
    return response.data;
  }

  async addToWatchlist(movieId: number) {
    const response = await axios.post(`${this.baseUrl}/user/watchlist`, {
      movieId,
      mediaType: 'movie',
    });
    return response.data;
  }

  async removeFromWatchlist(movieId: number) {
    const response = await axios.delete(`${this.baseUrl}/user/watchlist`, {
      data: { movieId, mediaType: 'movie' },
    });
    return response.data;
  }

  async markAsWatched(movieId: number, rating?: number) {
    const response = await axios.post(`${this.baseUrl}/user/watched`, {
      movieId,
      mediaType: 'movie',
      rating,
    });
    return response.data;
  }

  async getWatchlist() {
    const response = await axios.get(`${this.baseUrl}/user/watchlist`);
    return response.data;
  }

  async getWatchedMovies() {
    const response = await axios.get(`${this.baseUrl}/user/watched`);
    return response.data;
  }

  async getMovieStatus(movieId: number) {
    const response = await axios.get(`${this.baseUrl}/user/movie-status`, {
      params: { movieId },
    });
    return response.data;
  }

  async getBrowseMovies(category: string, page = 1) {
    const response = await axios.get(`${this.baseUrl}/browse`, {
      params: { category, page },
    });
    return response.data;
  }
}

export const movieService = new MovieService();
