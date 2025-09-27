import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkGenres() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(`Total genres in database: ${genres.length}`);
    console.log('\nGenres:');
    genres.forEach((genre) => {
      console.log(`  ID: ${genre.id}, Name: ${genre.name}`);
    });

    // Check movie-genre relations
    const movieGenres = await prisma.movieGenre.count();
    console.log(`\nTotal movie-genre relations: ${movieGenres}`);

    // Check a specific movie's genres
    const movie = await prisma.movie.findFirst({
      where: { tmdbId: 912649 }, // Venom: The Last Dance
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (movie) {
      console.log(`\nMovie: ${movie.title}`);
      console.log('Genres:', movie.genres.map((mg) => mg.genre.name).join(', '));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGenres();
