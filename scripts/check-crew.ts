import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkCrew() {
  try {
    const movie = await prisma.movie.findFirst({
      where: { tmdbId: 1061474 }, // Superman
      include: {
        crew: {
          include: {
            person: true,
          },
        },
      },
    });

    if (movie) {
      console.log(`Movie: ${movie.title}`);
      console.log(`Total crew members: ${movie.crew.length}`);
      console.log('\nCrew members:');
      movie.crew.forEach((c) => {
        console.log(`  - ${c.person.name}: ${c.job} (${c.department})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCrew();
