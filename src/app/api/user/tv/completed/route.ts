import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@core/lib/prisma';

// GET - Get user's completed TV shows
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const completed = await prisma.userTVShow.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
      },
      include: {
        tvShow: true,
      },
      orderBy: {
        completedDate: 'desc',
      },
    });

    return NextResponse.json(completed);
  } catch (error) {
    console.error('Error fetching completed TV shows:', error);
    return NextResponse.json({ error: 'Failed to fetch completed shows' }, { status: 500 });
  }
}

// POST - Mark TV show as completed
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { tmdbId, rating, comment } = data;

    // Find the TV show
    const tvShow = await prisma.tVShow.findFirst({
      where: { tmdbId },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    // Check if user has this TV show
    const existingEntry = await prisma.userTVShow.findFirst({
      where: {
        userId: session.user.id,
        tvShowId: tvShow.id,
      },
    });

    if (existingEntry) {
      // Update existing entry to completed status
      const updated = await prisma.userTVShow.update({
        where: { id: existingEntry.id },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
          rating: rating || existingEntry.rating,
          comment: comment || existingEntry.comment,
          updatedAt: new Date(),
        },
        include: { tvShow: true },
      });
      return NextResponse.json(updated);
    }

    // Create new completed entry
    const userTVShow = await prisma.userTVShow.create({
      data: {
        userId: session.user.id,
        tvShowId: tvShow.id,
        status: 'COMPLETED',
        completedDate: new Date(),
        rating,
        comment,
      },
      include: { tvShow: true },
    });

    return NextResponse.json(userTVShow);
  } catch (error) {
    console.error('Error marking TV show as completed:', error);
    return NextResponse.json({ error: 'Failed to mark as completed' }, { status: 500 });
  }
}
