import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/movies/search/route';
import { tmdbService } from '@/services/tmdb.service';

// Mock TMDb service
vi.mock('@core/services/tmdb.service', () => ({
  tmdbService: {
    searchMovies: vi.fn(),
  },
}));

describe('GET /api/movies/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches movies successfully', async () => {
    const mockMovies = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'The Matrix',
          poster_path: '/matrix.jpg',
          overview: 'A computer hacker learns about the true nature of reality',
          release_date: '1999-03-31',
          vote_average: 8.7,
        },
        {
          id: 2,
          title: 'The Matrix Reloaded',
          poster_path: '/matrix2.jpg',
          overview: 'Neo and the rebels continue their fight',
          release_date: '2003-05-15',
          vote_average: 7.2,
        },
      ],
      total_pages: 1,
      total_results: 2,
    };

    vi.mocked(tmdbService.searchMovies).mockResolvedValue(mockMovies);

    const url = new URL('http://localhost:3000/api/movies/search');
    url.searchParams.set('query', 'Matrix');
    url.searchParams.set('page', '1');

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockMovies);
    expect(tmdbService.searchMovies).toHaveBeenCalledWith('Matrix', 1);
  });

  it('returns error when query is missing', async () => {
    const url = new URL('http://localhost:3000/api/movies/search');
    // No query parameter

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Query parameter is required');
    expect(tmdbService.searchMovies).not.toHaveBeenCalled();
  });

  it('returns empty results when no movies found', async () => {
    const mockEmptyResult = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };

    vi.mocked(tmdbService.searchMovies).mockResolvedValue(mockEmptyResult);

    const url = new URL('http://localhost:3000/api/movies/search');
    url.searchParams.set('query', 'NonexistentMovie123');

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([]);
    expect(data.total_results).toBe(0);
  });

  it('handles page parameter', async () => {
    const mockMovies = {
      page: 2,
      results: [],
      total_pages: 5,
      total_results: 100,
    };

    vi.mocked(tmdbService.searchMovies).mockResolvedValue(mockMovies);

    const url = new URL('http://localhost:3000/api/movies/search');
    url.searchParams.set('query', 'Star Wars');
    url.searchParams.set('page', '2');

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(tmdbService.searchMovies).toHaveBeenCalledWith('Star Wars', 2);
  });

  it('defaults to page 1 when page not specified', async () => {
    const mockMovies = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    };

    vi.mocked(tmdbService.searchMovies).mockResolvedValue(mockMovies);

    const url = new URL('http://localhost:3000/api/movies/search');
    url.searchParams.set('query', 'Inception');

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    await GET(mockRequest);

    expect(tmdbService.searchMovies).toHaveBeenCalledWith('Inception', 1);
  });

  it('handles TMDb service errors', async () => {
    vi.mocked(tmdbService.searchMovies).mockRejectedValue(
      new Error('TMDb API error')
    );

    const url = new URL('http://localhost:3000/api/movies/search');
    url.searchParams.set('query', 'Movie');

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to search movies');
  });

  it('trims whitespace from query', async () => {
    const mockMovies = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    };

    vi.mocked(tmdbService.searchMovies).mockResolvedValue(mockMovies);

    const url = new URL('http://localhost:3000/api/movies/search');
    url.searchParams.set('query', '  Avatar  ');

    const mockRequest = new Request(url.toString(), {
      method: 'GET',
    });

    await GET(mockRequest);

    expect(tmdbService.searchMovies).toHaveBeenCalledWith('Avatar', 1);
  });
});