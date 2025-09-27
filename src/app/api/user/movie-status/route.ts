import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@core/lib/prisma';
import { MovieStatus } from '@core/enums';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get all user movie statuses with just the tmdbId
    const userMovies = await prisma.userMovie.findMany({
      where: { userId },
      select: {
        movie: {
          select: {
            tmdbId: true,
          },
        },
        status: true,
      },
    });

    // Organize IDs by status
    const watchlistIds: number[] = [];
    const watchedIds: number[] = [];

    userMovies.forEach((um) => {
      if (um.movie?.tmdbId) {
        if (um.status === MovieStatus.WATCHLIST) {
          watchlistIds.push(um.movie.tmdbId);
        } else if (um.status === MovieStatus.WATCHED) {
          watchedIds.push(um.movie.tmdbId);
        }
      }
    });

    return NextResponse.json({
      watchlist: watchlistIds,
      watched: watchedIds,
    });
  } catch (error) {
    console.error('Error fetching movie status:', error);
    return NextResponse.json({ error: 'Failed to fetch movie status' }, { status: 500 });
  }
}
