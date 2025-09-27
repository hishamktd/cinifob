import { NextResponse } from 'next/server';

import { prisma } from '@core/lib/prisma';
import { tmdbService } from '@/lib/tmdb';

export async function GET(request: Request, { params }: { params: Promise<{ tmdbId: string }> }) {
  try {
    const { tmdbId: tmdbIdParam } = await params;
    const tmdbId = parseInt(tmdbIdParam);

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    // Check cache first
    const cachedMovie = await prisma.movie.findUnique({
      where: { tmdbId },
    });

    // If cached and recent (less than 24 hours old), return it
    if (cachedMovie && cachedMovie.cachedAt) {
      const cacheAge = Date.now() - cachedMovie.cachedAt.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (cacheAge < oneDayInMs) {
        return NextResponse.json({
          movie: {
            ...cachedMovie,
            genres: cachedMovie.genres as number[],
          },
        });
      }
    }

    // Fetch from TMDb
    const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);

    // Update cache
    const updatedMovie = await prisma.movie.upsert({
      where: { tmdbId },
      update: {
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        genres: tmdbMovie.genres?.map((g) => g.id) || [],
        runtime: tmdbMovie.runtime,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        cachedAt: new Date(),
      },
      create: {
        tmdbId,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview || null,
        posterPath: tmdbMovie.poster_path || null,
        backdropPath: tmdbMovie.backdrop_path || null,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        genres: tmdbMovie.genres?.map((g) => g.id) || [],
        runtime: tmdbMovie.runtime || null,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
      },
    });

    return NextResponse.json({
      movie: {
        ...updatedMovie,
        genres: tmdbMovie.genres || [],
      },
    });
  } catch (error) {
    console.error('Movie detail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
  }
}
