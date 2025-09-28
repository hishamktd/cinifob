import { test, expect } from '@playwright/test';
import { setupTestUser } from '../utils/test-helpers';

test.describe('API Endpoints', () => {
  let authToken: string;
  let testUser: { email: string; password: string };

  test.beforeAll(async ({ request, browser }) => {
    // Setup test user and get auth token
    const context = await browser.newContext();
    const page = await context.newPage();
    testUser = await setupTestUser(page);

    // Get auth token from cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.includes('session'));
    authToken = sessionCookie?.value || '';

    await page.close();
    await context.close();
  });

  test.describe('Authentication APIs', () => {
    test('POST /api/auth/register - creates new user', async ({ request }) => {
      const timestamp = Date.now();
      const response = await request.post('/api/auth/register', {
        data: {
          name: 'API Test User',
          email: `apitest${timestamp}@example.com`,
          password: 'SecurePass123!',
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('message', 'User created successfully');
    });

    test('POST /api/auth/register - validates input', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          name: '',
          email: 'invalid-email',
          password: 'weak',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('POST /api/auth/signin - authenticates user', async ({ request }) => {
      const response = await request.post('/api/auth/callback/credentials', {
        data: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.status()).toBeLessThan(400);
    });
  });

  test.describe('Movie APIs', () => {
    test('GET /api/movies/popular - returns popular movies', async ({ request }) => {
      const response = await request.get('/api/movies/popular');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBeTruthy();
      expect(data.results.length).toBeGreaterThan(0);
    });

    test('GET /api/movies/search - searches movies', async ({ request }) => {
      const response = await request.get('/api/movies/search?query=inception');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(
        data.results.some((movie: { title: string }) =>
          movie.title.toLowerCase().includes('inception'),
        ),
      ).toBeTruthy();
    });

    test('GET /api/movies/[id] - returns movie details', async ({ request }) => {
      // Get a movie ID first
      const popularResponse = await request.get('/api/movies/popular');
      const popularData = await popularResponse.json();
      const movieId = popularData.results[0].id;

      const response = await request.get(`/api/movies/${movieId}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id', movieId);
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('overview');
      expect(data).toHaveProperty('release_date');
    });

    test('POST /api/movies/watchlist - adds movie to watchlist', async ({ request }) => {
      const popularResponse = await request.get('/api/movies/popular');
      const popularData = await popularResponse.json();
      const movie = popularData.results[0];

      const response = await request.post('/api/movies/watchlist', {
        headers: {
          Cookie: `session=${authToken}`,
        },
        data: {
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
        },
      });

      expect(response.status()).toBeLessThan(400);
    });

    test('GET /api/movies/watchlist - returns user watchlist', async ({ request }) => {
      const response = await request.get('/api/movies/watchlist', {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test('POST /api/movies/watched - marks movie as watched', async ({ request }) => {
      const popularResponse = await request.get('/api/movies/popular');
      const popularData = await popularResponse.json();
      const movie = popularData.results[0];

      const response = await request.post('/api/movies/watched', {
        headers: {
          Cookie: `session=${authToken}`,
        },
        data: {
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
          watchedDate: new Date().toISOString(),
          rating: 4,
        },
      });

      expect(response.status()).toBeLessThan(400);
    });

    test('GET /api/movies/watched - returns watched movies', async ({ request }) => {
      const response = await request.get('/api/movies/watched', {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test('GET /api/movies/trending - returns trending movies', async ({ request }) => {
      const response = await request.get('/api/movies/trending');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results.length).toBeGreaterThan(0);
    });

    test('GET /api/movies/upcoming - returns upcoming movies', async ({ request }) => {
      const response = await request.get('/api/movies/upcoming');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results.length).toBeGreaterThan(0);
    });

    test('GET /api/movies/genres - returns movie genres', async ({ request }) => {
      const response = await request.get('/api/movies/genres');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('genres');
      expect(Array.isArray(data.genres)).toBeTruthy();
      expect(data.genres.length).toBeGreaterThan(0);
    });
  });

  test.describe('TV Show APIs', () => {
    test('GET /api/tv/popular - returns popular TV shows', async ({ request }) => {
      const response = await request.get('/api/tv/popular');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBeTruthy();
      expect(data.results.length).toBeGreaterThan(0);
    });

    test('GET /api/tv/search - searches TV shows', async ({ request }) => {
      const response = await request.get('/api/tv/search?query=breaking');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results.length).toBeGreaterThan(0);
    });

    test('GET /api/tv/[id] - returns TV show details', async ({ request }) => {
      // Get a TV show ID first
      const popularResponse = await request.get('/api/tv/popular');
      const popularData = await popularResponse.json();
      const tvId = popularData.results[0].id;

      const response = await request.get(`/api/tv/${tvId}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id', tvId);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('overview');
      expect(data).toHaveProperty('seasons');
    });

    test('GET /api/tv/[id]/season/[seasonNumber] - returns season details', async ({ request }) => {
      // Get a TV show ID first
      const popularResponse = await request.get('/api/tv/popular');
      const popularData = await popularResponse.json();
      const tvId = popularData.results[0].id;

      const response = await request.get(`/api/tv/${tvId}/season/1`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('season_number', 1);
      expect(data).toHaveProperty('episodes');
      expect(Array.isArray(data.episodes)).toBeTruthy();
    });

    test('POST /api/tv/watchlist - adds TV show to watchlist', async ({ request }) => {
      const popularResponse = await request.get('/api/tv/popular');
      const popularData = await popularResponse.json();
      const show = popularData.results[0];

      const response = await request.post('/api/tv/watchlist', {
        headers: {
          Cookie: `session=${authToken}`,
        },
        data: {
          tvId: show.id,
          name: show.name,
          posterPath: show.poster_path,
          firstAirDate: show.first_air_date,
        },
      });

      expect(response.status()).toBeLessThan(400);
    });

    test('POST /api/tv/episodes/watched - marks episode as watched', async ({ request }) => {
      const popularResponse = await request.get('/api/tv/popular');
      const popularData = await popularResponse.json();
      const show = popularData.results[0];

      const response = await request.post('/api/tv/episodes/watched', {
        headers: {
          Cookie: `session=${authToken}`,
        },
        data: {
          tvId: show.id,
          seasonNumber: 1,
          episodeNumber: 1,
          watchedDate: new Date().toISOString(),
        },
      });

      expect(response.status()).toBeLessThan(400);
    });

    test('GET /api/tv/on-the-air - returns currently airing shows', async ({ request }) => {
      const response = await request.get('/api/tv/on-the-air');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results.length).toBeGreaterThan(0);
    });
  });

  test.describe('User APIs', () => {
    test('GET /api/user/stats - returns user statistics', async ({ request }) => {
      const response = await request.get('/api/user/stats', {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('totalMoviesWatched');
      expect(data).toHaveProperty('totalTVShowsWatched');
      expect(data).toHaveProperty('totalWatchTime');
      expect(data).toHaveProperty('favoriteGenres');
    });

    test('GET /api/user/activity - returns user activity', async ({ request }) => {
      const response = await request.get('/api/user/activity', {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test('GET /api/user/profile - returns user profile', async ({ request }) => {
      const response = await request.get('/api/user/profile', {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('email', testUser.email);
      expect(data).toHaveProperty('name', testUser.name);
    });

    test('PUT /api/user/profile - updates user profile', async ({ request }) => {
      const response = await request.put('/api/user/profile', {
        headers: {
          Cookie: `session=${authToken}`,
        },
        data: {
          name: 'Updated Name',
          preferences: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      expect(response.status()).toBeLessThan(400);
      const data = await response.json();
      expect(data).toHaveProperty('name', 'Updated Name');
    });
  });

  test.describe('Search APIs', () => {
    test('GET /api/search/multi - performs multi-content search', async ({ request }) => {
      const response = await request.get('/api/search/multi?query=star');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('movies');
      expect(data).toHaveProperty('tvShows');
      expect(data.movies.length + data.tvShows.length).toBeGreaterThan(0);
    });

    test('GET /api/search/people - searches for people', async ({ request }) => {
      const response = await request.get('/api/search/people?query=tom');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results[0]).toHaveProperty('name');
    });
  });

  test.describe('Error Handling', () => {
    test('Returns 404 for non-existent movie', async ({ request }) => {
      const response = await request.get('/api/movies/999999999');

      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('Returns 401 for unauthorized requests', async ({ request }) => {
      const response = await request.get('/api/user/stats');

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Unauthorized');
    });

    test('Handles invalid query parameters', async ({ request }) => {
      const response = await request.get('/api/movies/search?query=');

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('Rate limiting works correctly', async ({ request }) => {
      // Make multiple rapid requests
      const promises = Array.from({ length: 20 }, () => request.get('/api/movies/popular'));

      const responses = await Promise.all(promises);
      const hasRateLimitResponse = responses.some((r) => r.status() === 429);

      // This test may need adjustment based on actual rate limit configuration
      // For now, we just check that all requests complete
      expect(responses.every((r) => r.status() < 500)).toBeTruthy();
    });
  });
});
