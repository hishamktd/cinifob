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
    const status = searchParams.get('status');

    const whereClause = {
      userId: parseInt(session.user.id),
      ...(status && { status }),
    };

    const userTVShows = await prisma.userTVShow.findMany({
      where: whereClause,
      include: {
        tvShow: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const shows = userTVShows.map((userShow) => ({
      id: userShow.tvShow.id,
      tmdbId: userShow.tvShow.tmdbId,
      name: userShow.tvShow.name,
      posterPath: userShow.tvShow.posterPath,
      backdropPath: userShow.tvShow.backdropPath,
      overview: userShow.tvShow.overview,
      firstAirDate: userShow.tvShow.firstAirDate,
      voteAverage: userShow.tvShow.voteAverage,
      numberOfSeasons: userShow.tvShow.numberOfSeasons,
      numberOfEpisodes: userShow.tvShow.numberOfEpisodes,
      genres: userShow.tvShow.genres.map((g) => g.genre.name),
      status: userShow.status,
      currentSeason: userShow.currentSeason,
      currentEpisode: userShow.currentEpisode,
      rating: userShow.rating,
      notes: userShow.notes,
      startedAt: userShow.startedAt,
      completedAt: userShow.completedAt,
      addedAt: userShow.createdAt,
    }));

    return NextResponse.json(shows);
  } catch (error) {
    console.error('Error fetching user TV shows:', error);
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
    const { tmdbId, status = 'WATCHLIST' } = body;

    if (!tmdbId) {
      return NextResponse.json({ error: 'TV show ID is required' }, { status: 400 });
    }

    // Check if TV show exists in our database
    let tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    // If not, fetch from API and save
    if (!tvShow) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tv/${tmdbId}`,
      );
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch TV show data' }, { status: 404 });
      }
      const tvShowData = await response.json();
      tvShow = await prisma.tVShow.findUnique({
        where: { tmdbId: parseInt(tmdbId) },
      });
    }

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    // Check if already exists
    const existingEntry = await prisma.userTVShow.findUnique({
      where: {
        userId_tvShowId: {
          userId: parseInt(session.user.id),
          tvShowId: tvShow.id,
        },
      },
    });

    if (existingEntry) {
      // Update existing entry
      const updated = await prisma.userTVShow.update({
        where: {
          userId_tvShowId: {
            userId: parseInt(session.user.id),
            tvShowId: tvShow.id,
          },
        },
        data: {
          status,
          ...(status === 'WATCHING' && !existingEntry.startedAt && { startedAt: new Date() }),
          ...(status === 'COMPLETED' && !existingEntry.completedAt && { completedAt: new Date() }),
        },
      });
      return NextResponse.json({
        message: 'TV show status updated',
        userTVShow: updated,
      });
    }

    // Create new entry
    const userTVShow = await prisma.userTVShow.create({
      data: {
        userId: parseInt(session.user.id),
        tvShowId: tvShow.id,
        status,
        ...(status === 'WATCHING' && { startedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    return NextResponse.json({
      message: 'TV show added successfully',
      userTVShow,
    });
  } catch (error) {
    console.error('Error adding TV show:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    if (!tmdbId) {
      return NextResponse.json({ error: 'TV show ID is required' }, { status: 400 });
    }

    const tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    await prisma.userTVShow.delete({
      where: {
        userId_tvShowId: {
          userId: parseInt(session.user.id),
          tvShowId: tvShow.id,
        },
      },
    });

    return NextResponse.json({ message: 'TV show removed successfully' });
  } catch (error) {
    console.error('Error removing TV show:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}