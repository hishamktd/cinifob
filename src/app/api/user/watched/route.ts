import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { prisma } from '@core/lib/prisma';
import { MovieStatus } from '@core/enums';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watched = await prisma.userMovie.findMany({
      where: {
        userId: parseInt(session.user.id),
        status: MovieStatus.WATCHED,
      },
      include: {
        movie: true,
      },
      orderBy: {
        watchedAt: 'desc',
      },
    });

    // Transform BigInt fields to strings for JSON serialization
    const transformedWatched = watched.map((item) => ({
      ...item,
      movie: item.movie
        ? {
            ...item.movie,
            budget: item.movie.budget ? item.movie.budget.toString() : null,
            revenue: item.movie.revenue ? item.movie.revenue.toString() : null,
          }
        : null,
    }));

    return NextResponse.json({ watched: transformedWatched });
  } catch (error) {
    console.error('Watched movies fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch watched movies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/user/watched - Request body:', body);

    const {
      tmdbId,
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage,
      runtime,
      genres,
      rating,
      comment,
      watchedAt,
    } = body;

    if (!tmdbId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: tmdbId and title' },
        { status: 400 },
      );
    }

    // First, ensure the movie exists in our database
    let movie: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      movie = await prisma.movie.upsert({
        where: { tmdbId },
        update: {
          title,
          posterPath: posterPath || null,
          overview: overview || null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          voteAverage: voteAverage || null,
          runtime: runtime || null,
          cachedAt: new Date(),
        },
        create: {
          tmdbId,
          title,
          posterPath: posterPath || null,
          overview: overview || null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          voteAverage: voteAverage || null,
          runtime: runtime || null,
        },
      });
      console.log('Movie upserted successfully:', movie);

      // Handle genres separately if provided
      if (genres && Array.isArray(genres) && genres.length > 0) {
        // Ensure genres exist in the database
        const genrePromises = genres.map(async (genreName: string) => {
          // First try to find the genre by name
          let genre = await prisma.genre.findFirst({
            where: { name: genreName },
          });

          // If not found, create it with a generated ID
          if (!genre) {
            // Generate a unique ID for custom genres (negative to avoid conflicts with TMDb IDs)
            const existingCustomGenres = await prisma.genre.findMany({
              where: { id: { lt: 0 } },
              orderBy: { id: 'asc' },
              take: 1,
            });
            const newId = existingCustomGenres.length > 0 ? existingCustomGenres[0].id - 1 : -1;

            genre = await prisma.genre.create({
              data: {
                id: newId,
                name: genreName,
              },
            });
          }

          // Create MovieGenre relation
          await prisma.movieGenre
            .upsert({
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
            })
            .catch(() => null); // Ignore duplicate errors
        });

        await Promise.all(genrePromises);
      }
    } catch (movieError) {
      console.error('Failed to upsert movie:', movieError);
      // If movie creation fails, try to find existing movie
      movie = await prisma.movie.findUnique({
        where: { tmdbId },
      });

      if (!movie) {
        return NextResponse.json(
          { error: 'Failed to create or find movie in database' },
          { status: 500 },
        );
      }
    }

    // Ensure the user exists in the database
    const userId = parseInt(session.user.id);
    try {
      await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
    } catch {
      // Create the user if they don't exist
      await prisma.user.create({
        data: {
          id: userId,
          email: session.user.email || `user_${userId}@example.com`,
          name: session.user.name || `User ${userId}`,
          password: '', // Empty password for session-based users
        },
      });
    }

    // Check if already exists
    const existing = await prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id,
        },
      },
    });

    if (existing) {
      // Update status to watched
      const updated = await prisma.userMovie.update({
        where: {
          id: existing.id,
        },
        data: {
          status: MovieStatus.WATCHED,
          watchedAt: watchedAt ? new Date(watchedAt) : new Date(),
          rating: rating || existing.rating,
          comment: comment || existing.comment,
        },
        include: {
          movie: true,
        },
      });

      // Transform BigInt fields to strings
      const transformedUserMovie = {
        ...updated,
        movie: updated.movie
          ? {
              ...updated.movie,
              budget: updated.movie.budget ? updated.movie.budget.toString() : null,
              revenue: updated.movie.revenue ? updated.movie.revenue.toString() : null,
            }
          : null,
      };

      return NextResponse.json({ userMovie: transformedUserMovie });
    }

    // Mark as watched
    const userMovie = await prisma.userMovie.create({
      data: {
        userId,
        movieId: movie.id,
        status: MovieStatus.WATCHED,
        watchedAt: watchedAt ? new Date(watchedAt) : new Date(),
        rating,
        comment,
      },
      include: {
        movie: true,
      },
    });

    // Transform BigInt fields to strings
    const transformedUserMovie = {
      ...userMovie,
      movie: userMovie.movie
        ? {
            ...userMovie.movie,
            budget: userMovie.movie.budget ? userMovie.movie.budget.toString() : null,
            revenue: userMovie.movie.revenue ? userMovie.movie.revenue.toString() : null,
          }
        : null,
    };

    return NextResponse.json({ userMovie: transformedUserMovie });
  } catch (error) {
    console.error('Mark as watched error:', error);
    return NextResponse.json({ error: 'Failed to mark as watched' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdbId');

    if (!tmdbId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    const movie = await prisma.movie.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    await prisma.userMovie.delete({
      where: {
        userId_movieId: {
          userId: parseInt(session.user.id),
          movieId: movie.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from watched error:', error);
    return NextResponse.json({ error: 'Failed to remove from watched' }, { status: 500 });
  }
}
