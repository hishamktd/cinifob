import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tmdbService } from '@/services/tmdb.service';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: false,
    json: async () => ({ error: 'Not mocked' })
  } as Response)
);

describe('TMDbService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    process.env.TMDB_API_TOKEN = 'test-token';
  });

  describe('searchMovies', () => {
    it('searches movies successfully', async () => {
      const mockResponse = {
        page: 1,
        results: [
          { id: 1, title: 'Movie 1' },
          { id: 2, title: 'Movie 2' }
        ],
        total_pages: 1,
        total_results: 2
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.searchMovies('test');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search/movie'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });

    it('handles empty search results', async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.searchMovies('nonexistent');

      expect(result.results).toEqual([]);
      expect(result.total_results).toBe(0);
    });

    it('handles API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ status_message: 'Invalid API key' })
      } as Response);

      await expect(tmdbService.searchMovies('test')).rejects.toThrow();
    });
  });

  describe('getMovieDetails', () => {
    it('fetches movie details successfully', async () => {
      const mockMovie = {
        id: 123,
        title: 'Test Movie',
        overview: 'Test overview',
        release_date: '2024-01-01'
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovie
      } as Response);

      const result = await tmdbService.getMovieDetails(123);

      expect(result).toEqual(mockMovie);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('movie/123'),
        expect.any(Object)
      );
    });
  });

  describe('getPopularMovies', () => {
    it('fetches popular movies', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Popular Movie' }],
        total_pages: 10,
        total_results: 200
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.getPopularMovies();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('movie/popular'),
        expect.any(Object)
      );
    });
  });

  describe('getTrendingMovies', () => {
    it('fetches trending movies for day', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Trending Movie' }],
        total_pages: 5,
        total_results: 100
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.getTrendingMovies('day');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('trending/movie/day'),
        expect.any(Object)
      );
    });

    it('fetches trending movies for week', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Weekly Trending' }],
        total_pages: 5,
        total_results: 100
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.getTrendingMovies('week');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('trending/movie/week'),
        expect.any(Object)
      );
    });
  });

  describe('getMovieCredits', () => {
    it('fetches movie cast and crew', async () => {
      const mockCredits = {
        id: 123,
        cast: [
          { id: 1, name: 'Actor 1', character: 'Character 1' },
          { id: 2, name: 'Actor 2', character: 'Character 2' }
        ],
        crew: [
          { id: 3, name: 'Director', job: 'Director' }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredits
      } as Response);

      const result = await tmdbService.getMovieCredits(123);

      expect(result).toEqual(mockCredits);
      expect(result.cast).toHaveLength(2);
      expect(result.crew).toHaveLength(1);
    });
  });

  describe('getSimilarMovies', () => {
    it('fetches similar movies', async () => {
      const mockResponse = {
        page: 1,
        results: [
          { id: 456, title: 'Similar Movie 1' },
          { id: 789, title: 'Similar Movie 2' }
        ],
        total_pages: 1,
        total_results: 2
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.getSimilarMovies(123);

      expect(result.results).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('movie/123/similar'),
        expect.any(Object)
      );
    });
  });

  describe('getMovieVideos', () => {
    it('fetches movie videos/trailers', async () => {
      const mockVideos = {
        id: 123,
        results: [
          {
            id: 'video1',
            key: 'abc123',
            name: 'Official Trailer',
            type: 'Trailer',
            site: 'YouTube'
          }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideos
      } as Response);

      const result = await tmdbService.getMovieVideos(123);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].type).toBe('Trailer');
    });
  });

  describe('getGenres', () => {
    it('fetches movie genres', async () => {
      const mockGenres = {
        genres: [
          { id: 28, name: 'Action' },
          { id: 12, name: 'Adventure' },
          { id: 16, name: 'Animation' }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGenres
      } as Response);

      const result = await tmdbService.getGenres();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Action');
    });
  });

  describe('searchTVShows', () => {
    it('searches TV shows successfully', async () => {
      const mockResponse = {
        page: 1,
        results: [
          { id: 1, name: 'TV Show 1' },
          { id: 2, name: 'TV Show 2' }
        ],
        total_pages: 1,
        total_results: 2
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await tmdbService.searchTVShows('test');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search/tv'),
        expect.any(Object)
      );
    });
  });

  describe('getTVShowDetails', () => {
    it('fetches TV show details', async () => {
      const mockTVShow = {
        id: 456,
        name: 'Test TV Show',
        overview: 'Test overview',
        first_air_date: '2024-01-01',
        number_of_seasons: 3,
        number_of_episodes: 30
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTVShow
      } as Response);

      const result = await tmdbService.getTVShowDetails(456);

      expect(result).toEqual(mockTVShow);
      expect(result.number_of_seasons).toBe(3);
    });
  });

  describe('getSeasonDetails', () => {
    it('fetches TV show season details', async () => {
      const mockSeason = {
        id: 789,
        season_number: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, episode_number: 1, name: 'Episode 1' },
          { id: 2, episode_number: 2, name: 'Episode 2' }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeason
      } as Response);

      const result = await tmdbService.getSeasonDetails(456, 1);

      expect(result).toEqual(mockSeason);
      expect(result.episodes).toHaveLength(2);
    });
  });

  describe('rate limiting', () => {
    it('handles rate limiting with retry', async () => {
      // First call fails with rate limit
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '1' })
      } as Response);

      // Second call succeeds
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      const result = await tmdbService.searchMovies('test');

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ results: [] });
    });
  });
});