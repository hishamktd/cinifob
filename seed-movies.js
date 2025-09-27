const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function seedMovies() {
  console.log('Seeding movies...');

  const movies = [
    {
      tmdbId: 872585,
      title: 'Oppenheimer',
      overview:
        'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      posterPath: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdropPath: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
      releaseDate: new Date('2023-07-19'),
      genres: [18, 36], // Drama, History
      runtime: 180,
      voteAverage: 8.1,
      voteCount: 7842,
    },
    {
      tmdbId: 693134,
      title: 'Dune: Part Two',
      overview:
        'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen.',
      posterPath: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdropPath: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
      releaseDate: new Date('2024-02-27'),
      genres: [878, 12], // Science Fiction, Adventure
      runtime: 166,
      voteAverage: 8.3,
      voteCount: 5432,
    },
    {
      tmdbId: 466420,
      title: 'Killers of the Flower Moon',
      overview:
        'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one.',
      posterPath: '/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg',
      backdropPath: '/cCTp6Odb8wLuNYmRUaOfmyNZQow.jpg',
      releaseDate: new Date('2023-10-18'),
      genres: [18, 80, 36], // Drama, Crime, History
      runtime: 206,
      voteAverage: 7.5,
      voteCount: 2341,
    },
    {
      tmdbId: 976573,
      title: 'Elemental',
      overview:
        'In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental.',
      posterPath: '/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg',
      backdropPath: '/4fLZUr1e65hKPPVw0R3PmKFKxj1.jpg',
      releaseDate: new Date('2023-06-14'),
      genres: [16, 35, 10751], // Animation, Comedy, Family
      runtime: 101,
      voteAverage: 7.6,
      voteCount: 3421,
    },
    {
      tmdbId: 502356,
      title: 'The Super Mario Bros. Movie',
      overview:
        'While working underground to fix a water main, Brooklyn plumbers Mario and Luigi are transported to the magical Mushroom Kingdom.',
      posterPath: '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
      backdropPath: '/9n2tJBplPRBiXZ9Ws6hkSXGVsVD.jpg',
      releaseDate: new Date('2023-04-05'),
      genres: [16, 12, 35], // Animation, Adventure, Comedy
      runtime: 92,
      voteAverage: 7.6,
      voteCount: 8234,
    },
  ];

  try {
    for (const movie of movies) {
      await prisma.movie.upsert({
        where: { tmdbId: movie.tmdbId },
        update: movie,
        create: movie,
      });
      console.log(`✅ Seeded: ${movie.title}`);
    }
    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('Error seeding movies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMovies();
