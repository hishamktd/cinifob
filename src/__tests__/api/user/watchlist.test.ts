import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/user/watchlist/route';
import { MovieStatus } from '@core/enums/movie.enum';

// Mock the modules
vi.mock('@core/lib/prisma', () => ({
  prisma: {
    userMovie: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    movie: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
    },
    genre: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    movieGenre: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Import the mocked modules
import { prisma } from '@core/lib/prisma';
import { getServerSession } from 'next-auth';

describe('/api/user/watchlist', () => {
  const mockSession = {
    user: { id: '123', email: 'test@example.com' },
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
          userId: 123,
          movieId: 'movie1',
          status: MovieStatus.WATCHLIST,
          movie: {
            id: 'movie1',
            tmdbId: 123,
            title: 'Test Movie 1',
            posterPath: '/poster1.jpg',
            genres: [],
            videos: [],
            cast: [],
            crew: [],
          },
        },
        {
          id: '2',
          userId: 123,
          movieId: 'movie2',
          status: MovieStatus.WATCHLIST,
          movie: {
            id: 'movie2',
            tmdbId: 456,
            title: 'Test Movie 2',
            posterPath: '/poster2.jpg',
            genres: [],
            videos: [],
            cast: [],
            crew: [],
          },
        },
      ];

      vi.mocked(prisma.userMovie.findMany).mockResolvedValue(mockWatchlist);

      const request = new Request('http://localhost:3000/api/user/watchlist');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.watchlist).toHaveLength(2);
      expect(prisma.userMovie.findMany).toHaveBeenCalledWith({
        where: {
          userId: 123,
          status: MovieStatus.WATCHLIST,
        },
        include: {
          movie: {
            include: {
              genres: {
                include: {
                  genre: true,
                },
              },
              videos: true,
              cast: {
                orderBy: { order: 'asc' },
                take: 5,
              },
              crew: {
                where: { job: 'Director' },
                take: 2,
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
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
      expect(data.watchlist).toEqual([]);
    });
  });

  describe('POST', () => {
    it('adds movie to watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
        id: 123,
        email: 'test@example.com',
        name: 'Test',
      });

      const mockMovie = {
        id: 'movie123',
        tmdbId: 123,
        title: 'Test Movie',
        posterPath: '/poster.jpg',
      };

      vi.mocked(prisma.movie.upsert).mockResolvedValue(mockMovie);
      vi.mocked(prisma.userMovie.create).mockResolvedValue({
        id: 'usermovie1',
        userId: 123,
        movieId: 'movie123',
        status: MovieStatus.WATCHLIST,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        movie: mockMovie,
      });

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId: 123,
          title: 'Test Movie',
          posterPath: '/poster.jpg',
          releaseDate: '2024-01-01',
          voteAverage: 8.5,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userMovie).toBeDefined();
      expect(prisma.movie.upsert).toHaveBeenCalled();
      expect(prisma.userMovie.create).toHaveBeenCalled();
    });

    it('returns error if movie already in watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.userMovie.findUnique).mockResolvedValue({
        id: 'existing',
        userId: 123,
        movieId: 'movie123',
        status: MovieStatus.WATCHLIST,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request('http://localhost:3000/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId: 123,
          title: 'Test Movie',
        }),
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
          // Missing tmdbId
          title: 'Test Movie',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: tmdbId and title');
      expect(prisma.userMovie.create).not.toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('removes movie from watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.movie.findUnique).mockResolvedValue({
        id: 'movie123',
        tmdbId: 123,
        title: 'Test Movie',
      });
      vi.mocked(prisma.userMovie.delete).mockResolvedValue({
        id: 'usermovie1',
        userId: 123,
        movieId: 'movie123',
        status: MovieStatus.WATCHLIST,
        rating: null,
        watchedDate: null,
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request('http://localhost:3000/api/user/watchlist?tmdbId=123', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.userMovie.delete).toHaveBeenCalled();
    });

    it('returns error if movie not in watchlist', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.movie.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/user/watchlist?tmdbId=123', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Movie not found');
      expect(prisma.userMovie.delete).not.toHaveBeenCalled();
    });

    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/user/watchlist?tmdbId=123', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(prisma.userMovie.delete).not.toHaveBeenCalled();
    });
  });
});
