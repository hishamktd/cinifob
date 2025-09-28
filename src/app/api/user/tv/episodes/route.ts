import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tmdbId = searchParams.get('tmdbId');
    const seasonNumber = searchParams.get('season');

    if (!tmdbId) {
      return NextResponse.json({ error: 'TV show ID is required' }, { status: 400 });
    }

    const tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    const whereClause = {
      userId: parseInt(session.user.id),
      episode: {
        tvShowId: tvShow.id,
        ...(seasonNumber && { seasonNumber: parseInt(seasonNumber) }),
      },
    };

    const userEpisodes = await prisma.userEpisode.findMany({
      where: whereClause,
      include: {
        episode: true,
      },
    });

    return NextResponse.json(userEpisodes);
  } catch (error) {
    console.error('Error fetching user episodes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, seasonNumber, episodeNumber, watched = true, rating, notes } = body;

    if (!tmdbId || seasonNumber === undefined || episodeNumber === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the TV show or fetch it from API if it doesn't exist
    let tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      // Fetch TV show from our API to ensure it's saved to database
      const tvResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tv/${tmdbId}`,
      );

      if (!tvResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch TV show' }, { status: 404 });
      }

      // Try to find it again after the API call (which should have saved it)
      tvShow = await prisma.tVShow.findUnique({
        where: { tmdbId: parseInt(tmdbId) },
      });

      if (!tvShow) {
        return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
      }
    }

    // Find or create the episode
    let episode = await prisma.episode.findUnique({
      where: {
        tvShowId_seasonNumber_episodeNumber: {
          tvShowId: tvShow.id,
          seasonNumber: parseInt(seasonNumber),
          episodeNumber: parseInt(episodeNumber),
        },
      },
    });

    if (!episode) {
      // Fetch episode data from API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tv/${tmdbId}/season/${seasonNumber}`,
      );
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch season data' }, { status: 404 });
      }

      // Check again if episode was created
      episode = await prisma.episode.findUnique({
        where: {
          tvShowId_seasonNumber_episodeNumber: {
            tvShowId: tvShow.id,
            seasonNumber: parseInt(seasonNumber),
            episodeNumber: parseInt(episodeNumber),
          },
        },
      });

      if (!episode) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
      }
    }

    // Check if user episode exists
    const existingUserEpisode = await prisma.userEpisode.findUnique({
      where: {
        userId_episodeId: {
          userId: parseInt(session.user.id),
          episodeId: episode.id,
        },
      },
    });

    if (existingUserEpisode) {
      // Update existing
      const updated = await prisma.userEpisode.update({
        where: {
          userId_episodeId: {
            userId: parseInt(session.user.id),
            episodeId: episode.id,
          },
        },
        data: {
          watched,
          ...(watched && { watchedAt: new Date() }),
          ...(rating !== undefined && { rating }),
          ...(notes !== undefined && { notes }),
        },
      });

      // Update UserTVShow progress
      await updateTVShowProgress(parseInt(session.user.id), tvShow.id);

      return NextResponse.json({
        message: 'Episode updated',
        userEpisode: updated,
      });
    }

    // Create new user episode
    const userEpisode = await prisma.userEpisode.create({
      data: {
        userId: parseInt(session.user.id),
        episodeId: episode.id,
        watched,
        ...(watched && { watchedAt: new Date() }),
        ...(rating !== undefined && { rating }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Update UserTVShow progress
    await updateTVShowProgress(parseInt(session.user.id), tvShow.id);

    return NextResponse.json({
      message: 'Episode tracked',
      userEpisode,
    });
  } catch (error) {
    console.error('Error tracking episode:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function updateTVShowProgress(userId: number, tvShowId: number) {
  // Get all watched episodes for this show
  const watchedEpisodes = await prisma.userEpisode.findMany({
    where: {
      userId,
      watched: true,
      episode: {
        tvShowId,
      },
    },
    include: {
      episode: true,
    },
    orderBy: [
      { episode: { seasonNumber: 'desc' } },
      { episode: { episodeNumber: 'desc' } },
    ],
  });

  if (watchedEpisodes.length === 0) return;

  const latestEpisode = watchedEpisodes[0].episode;

  // Check if user has a TV show entry
  const userTVShow = await prisma.userTVShow.findUnique({
    where: {
      userId_tvShowId: {
        userId,
        tvShowId,
      },
    },
  });

  if (!userTVShow) {
    // Create one if it doesn't exist
    await prisma.userTVShow.create({
      data: {
        userId,
        tvShowId,
        status: 'WATCHING',
        currentSeason: latestEpisode.seasonNumber,
        currentEpisode: latestEpisode.episodeNumber,
        startedAt: new Date(),
      },
    });
  } else {
    // Update progress
    const tvShow = await prisma.tVShow.findUnique({
      where: { id: tvShowId },
    });

    const totalEpisodes = tvShow?.numberOfEpisodes || 0;
    const isCompleted = watchedEpisodes.length === totalEpisodes;

    await prisma.userTVShow.update({
      where: {
        userId_tvShowId: {
          userId,
          tvShowId,
        },
      },
      data: {
        currentSeason: latestEpisode.seasonNumber,
        currentEpisode: latestEpisode.episodeNumber,
        ...(isCompleted && {
          status: 'COMPLETED',
          completedAt: new Date(),
        }),
        ...(userTVShow.status === 'WATCHLIST' && {
          status: 'WATCHING',
          startedAt: new Date(),
        }),
      },
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tmdbId = searchParams.get('tmdbId');
    const seasonNumber = searchParams.get('season');
    const episodeNumber = searchParams.get('episode');

    if (!tmdbId || seasonNumber === null || episodeNumber === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    const episode = await prisma.episode.findUnique({
      where: {
        tvShowId_seasonNumber_episodeNumber: {
          tvShowId: tvShow.id,
          seasonNumber: parseInt(seasonNumber),
          episodeNumber: parseInt(episodeNumber),
        },
      },
    });

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    await prisma.userEpisode.delete({
      where: {
        userId_episodeId: {
          userId: parseInt(session.user.id),
          episodeId: episode.id,
        },
      },
    });

    // Update TV show progress
    await updateTVShowProgress(parseInt(session.user.id), tvShow.id);

    return NextResponse.json({ message: 'Episode tracking removed' });
  } catch (error) {
    console.error('Error removing episode tracking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}