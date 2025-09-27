import { NextResponse } from 'next/server';

import { prisma } from '@core/lib/prisma';
import { tmdbService } from '@/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type') || 'search';

    let tmdbResponse;

    switch (type) {
      case 'popular':
        tmdbResponse = await tmdbService.getPopularMovies(page);
        break;
      case 'trending':
        tmdbResponse = await tmdbService.getTrendingMovies(page);
        break;
      case 'upcoming':
        tmdbResponse = await tmdbService.getUpcomingMovies(page);
        break;
      case 'now_playing':
        tmdbResponse = await tmdbService.getNowPlayingMovies(page);
        break;
      case 'search':
      default:
        if (!query) {
          tmdbResponse = await tmdbService.getPopularMovies(page);
        } else {
          tmdbResponse = await tmdbService.searchMovies({ query, page });
        }
    }

    // Cache movies in the database
    const moviesToCache = tmdbResponse.results.slice(0, 10); // Cache first 10 results
    for (const movie of moviesToCache) {
      await prisma.movie.upsert({
        where: { tmdbId: movie.id },
        update: {
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date ? new Date(movie.release_date) : null,
          genres: JSON.stringify(movie.genre_ids || []),
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
          cachedAt: new Date(),
        },
        create: {
          tmdbId: movie.id,
          title: movie.title,
          overview: movie.overview || null,
          posterPath: movie.poster_path || null,
          backdropPath: movie.backdrop_path || null,
          releaseDate: movie.release_date ? new Date(movie.release_date) : null,
          genres: JSON.stringify(movie.genre_ids || []),
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
        },
      });
    }

    // Transform the response to match our Movie type
    const movies = tmdbResponse.results.map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      genres: movie.genre_ids || [],
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
    }));

    return NextResponse.json({
      movies,
      page: tmdbResponse.page,
      totalPages: tmdbResponse.total_pages,
      totalResults: tmdbResponse.total_results,
    });
  } catch (error) {
    console.error('Movie search error:', error);

    // Return mock data when TMDb API is unavailable
    const mockMovies = [
      {
        tmdbId: 1,
        title: 'Sample Movie 1',
        overview: 'This is a sample movie for testing purposes when TMDb API is unavailable.',
        posterPath: '/sample1.jpg',
        releaseDate: '2024-01-01',
        voteAverage: 8.5,
        runtime: 120,
        genres: [28, 12],
      },
      {
        tmdbId: 2,
        title: 'Sample Movie 2',
        overview: 'Another sample movie for testing.',
        posterPath: '/sample2.jpg',
        releaseDate: '2024-02-01',
        voteAverage: 7.5,
        runtime: 110,
        genres: [18, 35],
      },
      {
        tmdbId: 3,
        title: 'Test Movie 3',
        overview: 'A third test movie to demonstrate the application functionality.',
        posterPath: '/sample3.jpg',
        releaseDate: '2024-03-01',
        voteAverage: 9.0,
        runtime: 150,
        genres: [878, 28],
      },
    ];

    return NextResponse.json({
      movies: mockMovies,
      page: 1,
      totalPages: 1,
      totalResults: mockMovies.length,
    });
  }
}