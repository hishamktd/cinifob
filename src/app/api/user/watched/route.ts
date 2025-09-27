import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { prisma } from '@core/lib/prisma';
import { MovieStatus } from '@core/enums';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    return NextResponse.json({ watched });
  } catch (error) {
    console.error('Watched movies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watched movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('POST /api/user/watched - Request body:', body);

    const { tmdbId, title, posterPath, overview, releaseDate, voteAverage, runtime, genres, rating, comment } = body;

    if (!tmdbId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: tmdbId and title' },
        { status: 400 }
      );
    }

    // First, ensure the movie exists in our database
    const movie = await prisma.movie.upsert({
      where: { tmdbId },
      update: {
        title,
        posterPath: posterPath || null,
        overview: overview || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        voteAverage: voteAverage || null,
        runtime: runtime || null,
        genres: genres ? JSON.stringify(genres) : '[]',
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
        genres: genres ? JSON.stringify(genres) : '[]',
      },
    });

    console.log('Movie upserted:', movie);

    // Check if already exists
    const existing = await prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId: parseInt(session.user.id),
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
          watchedAt: new Date(),
          rating: rating || existing.rating,
          comment: comment || existing.comment,
        },
        include: {
          movie: true,
        },
      });

      return NextResponse.json({ userMovie: updated });
    }

    // Mark as watched
    const userMovie = await prisma.userMovie.create({
      data: {
        userId: parseInt(session.user.id),
        movieId: movie.id,
        status: MovieStatus.WATCHED,
        watchedAt: new Date(),
        rating,
        comment,
      },
      include: {
        movie: true,
      },
    });

    return NextResponse.json({ userMovie });
  } catch (error) {
    console.error('Mark as watched error:', error);
    return NextResponse.json(
      { error: 'Failed to mark as watched' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdbId');

    if (!tmdbId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: 'Failed to remove from watched' },
      { status: 500 }
    );
  }
}