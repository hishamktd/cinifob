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

    // Don't cache movies during search - only when added to watchlist/watched

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

    // Try to fetch from cache if TMDb API is unavailable
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('query');

      // If there's a search query, filter cached movies
      const whereClause = query
        ? {
            OR: [{ title: { contains: query } }, { overview: { contains: query } }],
          }
        : {};

      const cachedMovies = await prisma.movie.findMany({
        where: whereClause,
        take: 20,
        orderBy: { cachedAt: 'desc' },
      });

      if (cachedMovies.length > 0) {
        const movies = cachedMovies.map((movie) => ({
          tmdbId: movie.tmdbId,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          releaseDate: movie.releaseDate?.toISOString().split('T')[0],
          genres: movie.genres as number[],
          voteAverage: movie.voteAverage,
          voteCount: movie.voteCount,
        }));

        return NextResponse.json({
          movies,
          page: 1,
          totalPages: 1,
          totalResults: movies.length,
          cached: true,
          message: 'TMDb API is unavailable. Showing cached movies.',
        });
      }
    } catch (cacheError) {
      console.error('Cache fetch error:', cacheError);
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch movies. TMDb API is currently unavailable.',
        movies: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
      },
      { status: 503 },
    );
  }
}
