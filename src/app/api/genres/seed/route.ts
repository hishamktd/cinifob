import { NextResponse } from 'next/server';
import { prisma } from '@core/lib/prisma';

// Common TMDb genre IDs and names
const TMDB_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export async function GET() {
  try {
    // Seed all genres
    const upsertPromises = TMDB_GENRES.map((genre) =>
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
      message: 'Genres seeded successfully',
      count: savedGenres.length,
      genres: savedGenres,
    });
  } catch (error) {
    console.error('Genre seed error:', error);
    return NextResponse.json({ error: 'Failed to seed genres' }, { status: 500 });
  }
}
