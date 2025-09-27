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

    const watchlist = await prisma.userMovie.findMany({
      where: {
        userId: parseInt(session.user.id),
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
              where: {
                job: 'Director',
              },
              take: 2,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the response to include genre names
    const transformedWatchlist = watchlist.map((item) => ({
      ...item,
      movie: item.movie
        ? {
            ...item.movie,
            genres: item.movie.genres.map((mg) => mg.genre),
            budget: item.movie.budget ? item.movie.budget.toString() : null,
            revenue: item.movie.revenue ? item.movie.revenue.toString() : null,
          }
        : null,
    }));

    return NextResponse.json({ watchlist: transformedWatchlist });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/user/watchlist - Request body:', body);

    const { tmdbId, title, posterPath, overview, releaseDate, voteAverage, runtime, genres } = body;

    if (!tmdbId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: tmdbId and title' },
        { status: 400 },
      );
    }

    // First, ensure the movie exists in our database
    let movie;
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
      console.log('Movie upserted successfully:', movie);
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

    // Check if already in watchlist
    const existing = await prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id,
        },
      },
    });

    if (existing) {
      if (existing.status === MovieStatus.WATCHLIST) {
        return NextResponse.json({ error: 'Movie already in watchlist' }, { status: 400 });
      }

      // Update status to watchlist
      const updated = await prisma.userMovie.update({
        where: {
          id: existing.id,
        },
        data: {
          status: MovieStatus.WATCHLIST,
        },
        include: {
          movie: true,
        },
      });

      return NextResponse.json({ userMovie: updated });
    }

    // Add to watchlist
    const userMovie = await prisma.userMovie.create({
      data: {
        userId,
        movieId: movie.id,
        status: MovieStatus.WATCHLIST,
      },
      include: {
        movie: true,
      },
    });

    return NextResponse.json({ userMovie });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
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
    console.error('Remove from watchlist error:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}
