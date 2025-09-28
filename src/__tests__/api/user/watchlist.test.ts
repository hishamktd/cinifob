import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/user/watchlist/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userMovie: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn()
    },
    movie: {
      upsert: vi.fn()
    }
  }
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

describe('/api/user/watchlist', () => {
  const mockSession = {
    user: { id: 'user123', email: 'test@example.com' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns user watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const mockWatchlist = [
        {
          id: '1',
          userId: 'user123',
          movieId: 'movie1',
          isWatchlist: true,
          isWatched: false,
          movie: {
            id: 'movie1',
            tmdbId: 123,
            title: 'Test Movie 1',
            posterPath: '/poster1.jpg'
          }
        },
        {
          id: '2',
          userId: 'user123',
          movieId: 'movie2',
          isWatchlist: true,
          isWatched: false,
          movie: {
            id: 'movie2',
            tmdbId: 456,
            title: 'Test Movie 2',
            posterPath: '/poster2.jpg'
          }
        }
      ];

      vi.mocked(prisma.userMovie.findMany).mockResolvedValue(mockWatchlist);

      const request = new Request('http://localhost:3000/api/user/watchlist');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWatchlist);
      expect(prisma.userMovie.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          isWatchlist: true
        },
        include: {
          movie: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/user/watchlist');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(prisma.userMovie.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when watchlist is empty', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findMany).mockResolvedValue([]);

      const request = new Request('http://localhost:3000/api/user/watchlist');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('POST', () => {
    it('adds movie to watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findFirst).mockResolvedValue(null);

      const mockMovie = {
        id: 'movie123',
        tmdbId: 123,
        title: 'Test Movie',
        posterPath: '/poster.jpg'
      };

      vi.mocked(prisma.movie.upsert).mockResolvedValue(mockMovie);
      vi.mocked(prisma.userMovie.create).mockResolvedValue({
        id: 'usermovie1',
        userId: 'user123',
        movieId: 'movie123',
        isWatchlist: true,
        isWatched: false,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: 123,
          title: 'Test Movie',
          posterPath: '/poster.jpg',
          releaseDate: '2024-01-01',
          voteAverage: 8.5
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Added to watchlist');
      expect(prisma.movie.upsert).toHaveBeenCalled();
      expect(prisma.userMovie.create).toHaveBeenCalled();
    });

    it('returns error if movie already in watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findFirst).mockResolvedValue({
        id: 'existing',
        userId: 'user123',
        movieId: 'movie123',
        isWatchlist: true,
        isWatched: false,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: 123,
          title: 'Test Movie'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Movie already in watchlist');
      expect(prisma.userMovie.create).not.toHaveBeenCalled();
    });

    it('validates required fields', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing movieId
          title: 'Test Movie'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(prisma.userMovie.create).not.toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('removes movie from watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findFirst).mockResolvedValue({
        id: 'usermovie1',
        userId: 'user123',
        movieId: 'movie123',
        isWatchlist: true,
        isWatched: false,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      vi.mocked(prisma.userMovie.delete).mockResolvedValue({
        id: 'usermovie1',
        userId: 'user123',
        movieId: 'movie123',
        isWatchlist: false,
        isWatched: false,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: 123 })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Removed from watchlist');
      expect(prisma.userMovie.delete).toHaveBeenCalled();
    });

    it('returns error if movie not in watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findFirst).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: 123 })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Movie not found in watchlist');
      expect(prisma.userMovie.delete).not.toHaveBeenCalled();
    });

    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: 123 })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(prisma.userMovie.delete).not.toHaveBeenCalled();
    });
  });
});