import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@core/lib/prisma';

// GET - Get user's TV show statuses (for multiple shows)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tmdbIds = searchParams.get('tmdbIds');

    if (!tmdbIds) {
      // Return all user TV show statuses
      const allStatuses = await prisma.userTVShow.findMany({
        where: {
          userId: parseInt(session.user.id),
        },
        include: {
          tvShow: true,
        },
      });

      // Transform to a map for easier lookup
      const statusMap = allStatuses.reduce(
        (acc, item) => {
          acc[item.tvShow.tmdbId] = item;
          return acc;
        },
        {} as Record<number, (typeof allStatuses)[0]>,
      );

      return NextResponse.json(statusMap);
    }

    // Parse the tmdbIds
    const ids = tmdbIds
      .split(',')
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json({});
    }

    // Find TV shows by tmdbIds
    const tvShows = await prisma.tVShow.findMany({
      where: {
        tmdbId: {
          in: ids,
        },
      },
    });

    // Get user statuses for these TV shows
    const userTVShows = await prisma.userTVShow.findMany({
      where: {
        userId: parseInt(session.user.id),
        tvShowId: {
          in: tvShows.map((show) => show.id),
        },
      },
      include: {
        tvShow: true,
      },
    });

    // Create a map of tmdbId to status
    const statusMap = userTVShows.reduce(
      (acc, item) => {
        acc[item.tvShow.tmdbId] = {
          status: item.status,
          rating: item.rating,
          // Remove non-existent properties from UserTVShow model
          startedAt: item.startedAt,
          completedAt: item.completedAt,
        };
        return acc;
      },
      {} as Record<
        number,
        {
          status: string;
          rating: number | null;
          startedAt: Date | null;
          completedAt: Date | null;
        }
      >,
    );

    return NextResponse.json(statusMap);
  } catch (error) {
    console.error('Error fetching TV show statuses:', error);
    return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 });
  }
}
