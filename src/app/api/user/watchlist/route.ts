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
        movie: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ watchlist });
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
          genres: genres || [],
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
          genres: genres || [],
        },
      });
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
