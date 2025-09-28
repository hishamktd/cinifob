import { describe, it, expect, vi, beforeEach } from 'vitest';
import { movieService } from '@/services/movie.service.axios';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('MovieService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchMovies', () => {
    it('searches movies successfully', async () => {
      const mockResponse = {
        data: {
          page: 1,
          results: [
            { id: 1, title: 'Movie 1' },
            { id: 2, title: 'Movie 2' },
          ],
          total_pages: 1,
          total_results: 2,
        },
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await movieService.searchMovies('test', 1);

      expect(result).toEqual(mockResponse.data);
      expect(axios.get).toHaveBeenCalledWith('/api/movies/search', {
        params: { query: 'test', page: 1 },
      });
    });

    it('handles search errors', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      await expect(movieService.searchMovies('test')).rejects.toThrow('Network error');
    });
  });

  describe('getMovieDetails', () => {
    it('fetches movie details successfully', async () => {
      const mockMovie = {
        id: 123,
        title: 'Test Movie',
        overview: 'A test movie',
        release_date: '2024-01-01',
        vote_average: 8.5,
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockMovie });

      const result = await movieService.getMovieDetails(123);

      expect(result).toEqual(mockMovie);
      expect(axios.get).toHaveBeenCalledWith('/api/movies/123');
    });

    it('handles invalid movie ID', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        response: { status: 404, data: { error: 'Movie not found' } },
      });

      await expect(movieService.getMovieDetails(999999)).rejects.toThrow();
    });
  });

  describe('addToWatchlist', () => {
    it('adds movie to watchlist successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Added to watchlist',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await movieService.addToWatchlist(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/watchlist', {
        movieId: 123,
        mediaType: 'movie',
      });
    });

    it('handles duplicate watchlist entries', async () => {
      vi.mocked(axios.post).mockRejectedValue({
        response: { status: 409, data: { error: 'Already in watchlist' } },
      });

      await expect(movieService.addToWatchlist(123)).rejects.toThrow();
    });
  });

  describe('removeFromWatchlist', () => {
    it('removes movie from watchlist successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Removed from watchlist',
        },
      };

      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await movieService.removeFromWatchlist(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.delete).toHaveBeenCalledWith('/api/user/watchlist', {
        data: { movieId: 123, mediaType: 'movie' },
      });
    });
  });

  describe('markAsWatched', () => {
    it('marks movie as watched with rating', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Marked as watched',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await movieService.markAsWatched(123, 4);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/watched', {
        movieId: 123,
        mediaType: 'movie',
        rating: 4,
      });
    });

    it('marks movie as watched without rating', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Marked as watched',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await movieService.markAsWatched(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/watched', {
        movieId: 123,
        mediaType: 'movie',
        rating: undefined,
      });
    });
  });

  describe('getWatchlist', () => {
    it('fetches watchlist successfully', async () => {
      const mockWatchlist = [
        {
          id: 1,
          movieId: 123,
          movie: { title: 'Movie 1' },
          addedAt: '2024-01-01',
        },
        {
          id: 2,
          movieId: 456,
          movie: { title: 'Movie 2' },
          addedAt: '2024-01-02',
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockWatchlist });

      const result = await movieService.getWatchlist();

      expect(result).toEqual(mockWatchlist);
      expect(axios.get).toHaveBeenCalledWith('/api/user/watchlist');
    });

    it('returns empty array when no items in watchlist', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const result = await movieService.getWatchlist();

      expect(result).toEqual([]);
    });
  });

  describe('getWatchedMovies', () => {
    it('fetches watched movies successfully', async () => {
      const mockWatched = [
        {
          id: 1,
          movieId: 123,
          movie: { title: 'Movie 1' },
          watchedAt: '2024-01-01',
          rating: 4,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockWatched });

      const result = await movieService.getWatchedMovies();

      expect(result).toEqual(mockWatched);
      expect(axios.get).toHaveBeenCalledWith('/api/user/watched');
    });
  });

  describe('getMovieStatus', () => {
    it('fetches movie status for user', async () => {
      const mockStatus = {
        isInWatchlist: true,
        isWatched: false,
        rating: null,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockStatus });

      const result = await movieService.getMovieStatus(123);

      expect(result).toEqual(mockStatus);
      expect(axios.get).toHaveBeenCalledWith('/api/user/movie-status', {
        params: { movieId: 123 },
      });
    });

    it('returns default status when not found', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          isInWatchlist: false,
          isWatched: false,
          rating: null,
        },
      });

      const result = await movieService.getMovieStatus(999);

      expect(result.isInWatchlist).toBe(false);
      expect(result.isWatched).toBe(false);
      expect(result.rating).toBeNull();
    });
  });

  describe('getBrowseMovies', () => {
    it('fetches movies by category', async () => {
      const mockMovies = {
        page: 1,
        results: [
          { id: 1, title: 'Popular Movie 1' },
          { id: 2, title: 'Popular Movie 2' },
        ],
        total_pages: 10,
        total_results: 200,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockMovies });

      const result = await movieService.getBrowseMovies('popular', 1);

      expect(result).toEqual(mockMovies);
      expect(axios.get).toHaveBeenCalledWith('/api/browse', {
        params: { category: 'popular', page: 1 },
      });
    });

    it('handles invalid category', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        response: { status: 400, data: { error: 'Invalid category' } },
      });

      await expect(movieService.getBrowseMovies('invalid', 1)).rejects.toThrow();
    });
  });
});