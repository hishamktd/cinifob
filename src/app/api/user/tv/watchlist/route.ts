import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@core/lib/prisma';

// GET - Get user's TV show watchlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchlist = await prisma.userTVShow.findMany({
      where: {
        userId: parseInt(session.user.id),
        status: 'WATCHLIST',
      },
      include: {
        tvShow: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(watchlist);
  } catch (error) {
    console.error('Error fetching TV show watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

// POST - Add TV show to watchlist
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

    // Check if user already has this TV show in any status
    const existingEntry = await prisma.userTVShow.findFirst({
      where: {
        userId: parseInt(session.user.id),
        tvShowId: tvShow.id,
      },
    });

    if (existingEntry) {
      // Update existing entry to watchlist status
      const updated = await prisma.userTVShow.update({
        where: { id: existingEntry.id },
        data: {
          status: 'WATCHLIST',
          updatedAt: new Date(),
        },
        include: { tvShow: true },
      });
      return NextResponse.json(updated);
    }

    // Create new watchlist entry
    const userTVShow = await prisma.userTVShow.create({
      data: {
        userId: parseInt(session.user.id),
        tvShowId: tvShow.id,
        status: 'WATCHLIST',
      },
      include: { tvShow: true },
    });

    return NextResponse.json(userTVShow);
  } catch (error) {
    console.error('Error adding TV show to watchlist:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}

// DELETE - Remove TV show from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdbId');

    if (!tmdbId) {
      return NextResponse.json({ error: 'TV show ID is required' }, { status: 400 });
    }

    // Find the TV show
    const tvShow = await prisma.tVShow.findFirst({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    // Delete the user-TV show relationship
    const deleted = await prisma.userTVShow.deleteMany({
      where: {
        userId: parseInt(session.user.id),
        tvShowId: tvShow.id,
        status: 'WATCHLIST',
      },
    });

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error('Error removing TV show from watchlist:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}
