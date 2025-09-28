class TMDbService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiToken = process.env.TMDB_API_TOKEN || '';

  private async fetchFromTMDb(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    return response.json();
  }

  async searchMovies(query: string, page = 1) {
    return this.fetchFromTMDb('/search/movie', {
      query,
      page: String(page),
    });
  }

  async getMovieDetails(movieId: number) {
    return this.fetchFromTMDb(`/movie/${movieId}`);
  }

  async getPopularMovies(page = 1) {
    return this.fetchFromTMDb('/movie/popular', {
      page: String(page),
    });
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page = 1) {
    return this.fetchFromTMDb(`/trending/movie/${timeWindow}`, {
      page: String(page),
    });
  }

  async getMovieCredits(movieId: number) {
    return this.fetchFromTMDb(`/movie/${movieId}/credits`);
  }

  async getSimilarMovies(movieId: number, page = 1) {
    return this.fetchFromTMDb(`/movie/${movieId}/similar`, {
      page: String(page),
    });
  }

  async getMovieVideos(movieId: number) {
    return this.fetchFromTMDb(`/movie/${movieId}/videos`);
  }

  async getGenres() {
    const response = await this.fetchFromTMDb('/genre/movie/list');
    return response.genres;
  }

  async searchTVShows(query: string, page = 1) {
    return this.fetchFromTMDb('/search/tv', {
      query,
      page: String(page),
    });
  }

  async getTVShowDetails(tvId: number) {
    return this.fetchFromTMDb(`/tv/${tvId}`);
  }

  async getSeasonDetails(tvId: number, seasonNumber: number) {
    return this.fetchFromTMDb(`/tv/${tvId}/season/${seasonNumber}`);
  }
}

export const tmdbService = new TMDbService();