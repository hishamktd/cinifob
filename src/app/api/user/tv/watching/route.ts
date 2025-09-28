import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get user's currently watching TV shows
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watching = await prisma.userTVShow.findMany({
      where: {
        userId: session.user.id,
        status: 'WATCHING',
      },
      include: {
        tvShow: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate progress for each show
    const watchingWithProgress = await Promise.all(
      watching.map(async (item) => {
        const totalEpisodes = item.tvShow.numberOfEpisodes || 0;

        // Get watched episodes count
        const watchedEpisodesCount = await prisma.userEpisode.count({
          where: {
            userId: session.user.id,
            episode: {
              season: {
                tvShowId: item.tvShowId,
              },
            },
            status: 'WATCHED',
          },
        });

        return {
          ...item,
          episodesWatched: watchedEpisodesCount,
          totalEpisodes,
          progress: totalEpisodes > 0 ? (watchedEpisodesCount / totalEpisodes) * 100 : 0,
        };
      }),
    );

    return NextResponse.json(watchingWithProgress);
  } catch (error) {
    console.error('Error fetching watching TV shows:', error);
    return NextResponse.json({ error: 'Failed to fetch watching shows' }, { status: 500 });
  }
}

// POST - Mark TV show as watching
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      tmdbId,
      name,
      overview,
      posterPath,
      backdropPath,
      firstAirDate,
      voteAverage,
      voteCount,
      popularity,
      numberOfSeasons,
      numberOfEpisodes,
      genres,
      currentSeason,
      currentEpisode,
    } = data;

    // First, ensure the TV show exists in our database
    let tvShow = await prisma.tVShow.findFirst({
      where: { tmdbId },
    });

    if (!tvShow) {
      // Create the TV show if it doesn't exist
      tvShow = await prisma.tVShow.create({
        data: {
          tmdbId,
          name,
          overview,
          posterPath,
          backdropPath,
          firstAirDate: firstAirDate ? new Date(firstAirDate) : null,
          voteAverage,
          voteCount,
          popularity,
          numberOfSeasons,
          numberOfEpisodes,
          genres: genres || [],
        },
      });
    }

    // Check if user already has this TV show
    const existingEntry = await prisma.userTVShow.findFirst({
      where: {
        userId: session.user.id,
        tvShowId: tvShow.id,
      },
    });

    if (existingEntry) {
      // Update existing entry to watching status
      const updated = await prisma.userTVShow.update({
        where: { id: existingEntry.id },
        data: {
          status: 'WATCHING',
          startDate: existingEntry.startDate || new Date(),
          currentSeason: currentSeason || existingEntry.currentSeason,
          currentEpisode: currentEpisode || existingEntry.currentEpisode,
          updatedAt: new Date(),
        },
        include: { tvShow: true },
      });
      return NextResponse.json(updated);
    }

    // Create new watching entry
    const userTVShow = await prisma.userTVShow.create({
      data: {
        userId: session.user.id,
        tvShowId: tvShow.id,
        status: 'WATCHING',
        startDate: new Date(),
        currentSeason: currentSeason || 1,
        currentEpisode: currentEpisode || 1,
      },
      include: { tvShow: true },
    });

    return NextResponse.json(userTVShow);
  } catch (error) {
    console.error('Error marking TV show as watching:', error);
    return NextResponse.json({ error: 'Failed to mark as watching' }, { status: 500 });
  }
}
