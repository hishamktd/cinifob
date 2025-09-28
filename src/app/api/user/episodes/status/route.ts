import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@core/lib/prisma';

// GET - Get user's episode statuses for a TV show or season
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tvShowTmdbId = searchParams.get('tvShowId');
    const seasonNumber = searchParams.get('seasonNumber');

    if (!tvShowTmdbId) {
      return NextResponse.json({ error: 'TV show ID is required' }, { status: 400 });
    }

    // Find the TV show
    const tvShow = await prisma.tVShow.findFirst({
      where: { tmdbId: parseInt(tvShowTmdbId) },
      include: {
        seasons: {
          include: {
            episodes: true,
          },
        },
      },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    // Build query for user episodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      userId: session.user.id,
      episode: {
        season: {
          tvShowId: tvShow.id,
        },
      },
    };

    // If season number is specified, filter by season
    if (seasonNumber) {
      whereClause.episode.season.seasonNumber = parseInt(seasonNumber);
    }

    // Get user's episode statuses
    const userEpisodes = await prisma.userEpisode.findMany({
      where: whereClause,
      include: {
        episode: {
          include: {
            season: true,
          },
        },
      },
    });

    // Create a map of episode tmdbId to status
    const statusMap = userEpisodes.reduce(
      (acc, item) => {
        acc[item.episode.tmdbId] = {
          status: item.status,
          watchedDate: item.watchedDate,
          rating: item.rating,
        };
        return acc;
      },
      {} as Record<
        number,
        {
          status: string;
          watchedDate: Date | null;
          rating: number | null;
        }
      >,
    );

    return NextResponse.json(statusMap);
  } catch (error) {
    console.error('Error fetching episode statuses:', error);
    return NextResponse.json({ error: 'Failed to fetch episode statuses' }, { status: 500 });
  }
}

// POST - Update episode status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { episodeTmdbId, status, rating } = data;

    if (!episodeTmdbId || !status) {
      return NextResponse.json({ error: 'Episode ID and status are required' }, { status: 400 });
    }

    // Find the episode
    const episode = await prisma.episode.findFirst({
      where: { tmdbId: episodeTmdbId },
      include: {
        season: {
          include: {
            tvShow: true,
          },
        },
      },
    });

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Check if user already has a status for this episode
    const existingStatus = await prisma.userEpisode.findFirst({
      where: {
        userId: session.user.id,
        episodeId: episode.id,
      },
    });

    let userEpisode;
    if (existingStatus) {
      // Update existing status
      userEpisode = await prisma.userEpisode.update({
        where: { id: existingStatus.id },
        data: {
          status,
          watchedDate: status === 'WATCHED' ? new Date() : null,
          rating,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new status
      userEpisode = await prisma.userEpisode.create({
        data: {
          userId: session.user.id,
          episodeId: episode.id,
          status,
          watchedDate: status === 'WATCHED' ? new Date() : null,
          rating,
        },
      });
    }

    // Update the user's TV show status if needed
    const userTVShow = await prisma.userTVShow.findFirst({
      where: {
        userId: session.user.id,
        tvShowId: episode.season.tvShowId,
      },
    });

    if (userTVShow && status === 'WATCHED') {
      // Update current episode/season tracking
      await prisma.userTVShow.update({
        where: { id: userTVShow.id },
        data: {
          currentSeason: episode.season.seasonNumber,
          currentEpisode: episode.episodeNumber,
          status: userTVShow.status === 'WATCHLIST' ? 'WATCHING' : userTVShow.status,
          updatedAt: new Date(),
        },
      });
    } else if (!userTVShow && status === 'WATCHED') {
      // Create new TV show entry as watching
      await prisma.userTVShow.create({
        data: {
          userId: session.user.id,
          tvShowId: episode.season.tvShowId,
          status: 'WATCHING',
          currentSeason: episode.season.seasonNumber,
          currentEpisode: episode.episodeNumber,
          startDate: new Date(),
        },
      });
    }

    return NextResponse.json(userEpisode);
  } catch (error) {
    console.error('Error updating episode status:', error);
    return NextResponse.json({ error: 'Failed to update episode status' }, { status: 500 });
  }
}

// DELETE - Remove episode status
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const episodeTmdbId = searchParams.get('episodeId');

    if (!episodeTmdbId) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    // Find the episode
    const episode = await prisma.episode.findFirst({
      where: { tmdbId: parseInt(episodeTmdbId) },
    });

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Delete the user episode status
    const deleted = await prisma.userEpisode.deleteMany({
      where: {
        userId: session.user.id,
        episodeId: episode.id,
      },
    });

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error('Error removing episode status:', error);
    return NextResponse.json({ error: 'Failed to remove episode status' }, { status: 500 });
  }
}
