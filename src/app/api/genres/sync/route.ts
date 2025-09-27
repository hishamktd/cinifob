import { NextResponse } from 'next/server';
import { prisma } from '@core/lib/prisma';
import { tmdbService } from '@/lib/tmdb';

export async function GET() {
  try {
    // Fetch genres from TMDb
    const genres = await tmdbService.getGenres();

    // Upsert all genres to database
    const upsertPromises = genres.map((genre) =>
      prisma.genre.upsert({
        where: { id: genre.id },
        update: { name: genre.name },
        create: { id: genre.id, name: genre.name },
      }),
    );

    await Promise.all(upsertPromises);

    const savedGenres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      message: 'Genres synchronized successfully',
      count: savedGenres.length,
      genres: savedGenres,
    });
  } catch (error) {
    console.error('Genre sync error:', error);
    return NextResponse.json({ error: 'Failed to sync genres' }, { status: 500 });
  }
}
