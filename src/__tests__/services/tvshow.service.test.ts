import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tvShowService } from '@/services/tvshow.service';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('TVShowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchTVShows', () => {
    it('searches TV shows successfully', async () => {
      const mockResponse = {
        data: {
          page: 1,
          results: [
            { id: 1, name: 'Breaking Bad' },
            { id: 2, name: 'Better Call Saul' },
          ],
          total_pages: 1,
          total_results: 2,
        },
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await tvShowService.searchTVShows('breaking', 1);

      expect(result).toEqual(mockResponse.data);
      expect(axios.get).toHaveBeenCalledWith('/api/tv/search', {
        params: { query: 'breaking', page: 1 },
      });
    });
  });

  describe('getTVShowDetails', () => {
    it('fetches TV show details successfully', async () => {
      const mockShow = {
        id: 123,
        name: 'Test Show',
        overview: 'A test TV show',
        first_air_date: '2024-01-01',
        vote_average: 9.0,
        poster_path: '/test.jpg',
        number_of_seasons: 5,
        number_of_episodes: 62,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockShow });

      const result = await tvShowService.getTVShowDetails(123);

      expect(result).toEqual(mockShow);
      expect(axios.get).toHaveBeenCalledWith('/api/tv/123');
    });
  });

  describe('addToWatchlist', () => {
    it('adds TV show to watchlist', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Added to watchlist',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await tvShowService.addToWatchlist(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/tv/watchlist', {
        tvShowId: 123,
      });
    });
  });

  describe('removeFromWatchlist', () => {
    it('removes TV show from watchlist', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Removed from watchlist',
        },
      };

      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await tvShowService.removeFromWatchlist(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.delete).toHaveBeenCalledWith('/api/user/tv/watchlist', {
        data: { tvShowId: 123 },
      });
    });
  });

  describe('markAsWatching', () => {
    it('marks TV show as watching', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Marked as watching',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await tvShowService.markAsWatching(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/tv/watching', {
        tvShowId: 123,
      });
    });
  });

  describe('markAsCompleted', () => {
    it('marks TV show as completed', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Marked as completed',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await tvShowService.markAsCompleted(123, 5);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/tv/completed', {
        tvShowId: 123,
        rating: 5,
      });
    });
  });

  describe('getSeasonDetails', () => {
    it('fetches season details', async () => {
      const mockSeason = {
        id: 456,
        season_number: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, episode_number: 1, name: 'Pilot' },
          { id: 2, episode_number: 2, name: 'Episode 2' },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockSeason });

      const result = await tvShowService.getSeasonDetails(123, 1);

      expect(result).toEqual(mockSeason);
      expect(axios.get).toHaveBeenCalledWith('/api/tv/123/season/1');
    });
  });

  describe('markEpisodeAsWatched', () => {
    it('marks episode as watched', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Episode marked as watched',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await tvShowService.markEpisodeAsWatched(123, 1, 1);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/api/user/episodes/watched', {
        tvShowId: 123,
        seasonNumber: 1,
        episodeNumber: 1,
      });
    });
  });

  describe('getWatchingShows', () => {
    it('fetches shows being watched', async () => {
      const mockShows = [
        {
          id: 1,
          tvShowId: 123,
          tvShow: { name: 'Show 1' },
          progress: 50,
        },
        {
          id: 2,
          tvShowId: 456,
          tvShow: { name: 'Show 2' },
          progress: 30,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockShows });

      const result = await tvShowService.getWatchingShows();

      expect(result).toEqual(mockShows);
      expect(axios.get).toHaveBeenCalledWith('/api/user/tv/watching');
    });
  });

  describe('getCompletedShows', () => {
    it('fetches completed shows', async () => {
      const mockShows = [
        {
          id: 1,
          tvShowId: 123,
          tvShow: { name: 'Completed Show 1' },
          rating: 5,
          completedAt: '2024-01-01',
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockShows });

      const result = await tvShowService.getCompletedShows();

      expect(result).toEqual(mockShows);
      expect(axios.get).toHaveBeenCalledWith('/api/user/tv/completed');
    });
  });

  describe('getTVShowStatus', () => {
    it('fetches TV show status for user', async () => {
      const mockStatus = {
        isInWatchlist: true,
        isWatching: false,
        isCompleted: false,
        watchedEpisodes: [
          { season: 1, episode: 1 },
          { season: 1, episode: 2 },
        ],
        rating: null,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockStatus });

      const result = await tvShowService.getTVShowStatus(123);

      expect(result).toEqual(mockStatus);
      expect(axios.get).toHaveBeenCalledWith('/api/user/tv/status', {
        params: { tvShowId: 123 },
      });
    });
  });

  describe('getEpisodeStatus', () => {
    it('fetches episode watch status', async () => {
      const mockStatus = {
        episodes: [
          { season: 1, episode: 1, watched: true },
          { season: 1, episode: 2, watched: true },
          { season: 1, episode: 3, watched: false },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockStatus });

      const result = await tvShowService.getEpisodeStatus(123, 1);

      expect(result).toEqual(mockStatus);
      expect(axios.get).toHaveBeenCalledWith('/api/user/episodes/status', {
        params: { tvShowId: 123, seasonNumber: 1 },
      });
    });
  });

  describe('updateProgress', () => {
    it('updates watching progress', async () => {
      const mockResponse = {
        data: {
          success: true,
          progress: 75,
        },
      };

      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await tvShowService.updateProgress(123, 75);

      expect(result).toEqual(mockResponse.data);
      expect(axios.put).toHaveBeenCalledWith('/api/user/tv/progress', {
        tvShowId: 123,
        progress: 75,
      });
    });
  });

  describe('getBrowseTVShows', () => {
    it('fetches TV shows by category', async () => {
      const mockShows = {
        page: 1,
        results: [
          { id: 1, name: 'Popular Show 1' },
          { id: 2, name: 'Popular Show 2' },
        ],
        total_pages: 10,
        total_results: 200,
      };

      vi.mocked(axios.get).mockResolvedValue({ data: mockShows });

      const result = await tvShowService.getBrowseTVShows('popular', 1);

      expect(result).toEqual(mockShows);
      expect(axios.get).toHaveBeenCalledWith('/api/tv/browse', {
        params: { category: 'popular', page: 1 },
      });
    });
  });
});
