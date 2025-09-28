import { NextResponse } from 'next/server';
import { tmdbService } from '@/lib/tmdb';
import { prisma } from '@core/lib/prisma';
import { TMDbMovie } from '@/types';

// Helper to store movie in database
async function storeMovie(tmdbMovie: TMDbMovie) {
  try {
    const movie = await prisma.movie.upsert({
      where: { tmdbId: tmdbMovie.id },
      update: {
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime || null,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        popularity: tmdbMovie.popularity,
        cachedAt: new Date(),
      },
      create: {
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview || null,
        posterPath: tmdbMovie.poster_path || null,
        backdropPath: tmdbMovie.backdrop_path || null,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime || null,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        popularity: tmdbMovie.popularity,
      },
    });

    // Handle genres
    if (tmdbMovie.genres && Array.isArray(tmdbMovie.genres)) {
      for (const genre of tmdbMovie.genres) {
        try {
          // Ensure genre exists
          await prisma.genre.upsert({
            where: { id: genre.id },
            update: { name: genre.name },
            create: { id: genre.id, name: genre.name },
          });

          // Create relation
          await prisma.movieGenre.upsert({
            where: {
              movieId_genreId: {
                movieId: movie.id,
                genreId: genre.id,
              },
            },
            update: {},
            create: {
              movieId: movie.id,
              genreId: genre.id,
            },
          });
        } catch {
          console.log(`Genre ${genre.name} relation error`);
        }
      }
    }

    return movie;
  } catch (error) {
    console.error(`Failed to store movie ${tmdbMovie.id}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const pages = parseInt(searchParams.get('pages') || '1');

    console.log(`🎬 Starting movie seed: ${type}, ${pages} pages`);

    const results = {
      seeded: 0,
      failed: 0,
      movies: [] as Array<{ id: number; tmdbId: number; title: string }>,
    };

    // Fetch movies from TMDb
    for (let page = 1; page <= pages; page++) {
      try {
        let movies;

        switch (type) {
          case 'popular':
            movies = await tmdbService.getPopularMovies(page);
            break;
          case 'trending':
            movies = await tmdbService.getTrendingMovies(page);
            break;
          case 'upcoming':
            movies = await tmdbService.getUpcomingMovies(page);
            break;
          case 'now_playing':
            movies = await tmdbService.getNowPlayingMovies(page);
            break;
          default:
            movies = await tmdbService.getPopularMovies(page);
        }

        if (!movies.results) continue;

        // Process each movie
        for (const basicMovie of movies.results) {
          try {
            // Fetch full movie details
            const fullMovie = await tmdbService.getMovieDetails(basicMovie.id);

            // Store in database
            const stored = await storeMovie(fullMovie);

            if (stored) {
              results.seeded++;
              results.movies.push({
                id: stored.id,
                tmdbId: stored.tmdbId,
                title: stored.title,
              });
              console.log(`✅ Seeded: ${stored.title}`);
            } else {
              results.failed++;
            }

            // Add delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 250));
          } catch (error) {
            console.error(`Failed to process movie ${basicMovie.id}:`, error);
            results.failed++;
          }
        }

        console.log(`Completed page ${page}/${pages}`);
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error);
      }
    }

    console.log(`🎉 Seed complete: ${results.seeded} movies added, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Movie seed error:', error);
    return NextResponse.json({ error: 'Failed to seed movies' }, { status: 500 });
  }
}
