import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { prisma } from '@core/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    movieId: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { movieId } = await params;
    const body = await request.json();
    const { watchedAt } = body;

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    if (!watchedAt) {
      return NextResponse.json({ error: 'Watched date is required' }, { status: 400 });
    }

    // Update the watched date
    const updated = await prisma.userMovie.update({
      where: {
        id: parseInt(movieId),
        userId: parseInt(session.user.id),
      },
      data: {
        watchedAt: new Date(watchedAt),
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
  } catch (error) {
    console.error('Update watched date error:', error);
    return NextResponse.json({ error: 'Failed to update watched date' }, { status: 500 });
  }
}
