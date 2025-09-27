import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');
  console.log('⚠️  This will delete all data except users and sessions!');

  try {
    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Delete in order of dependencies (most dependent first)

      // 1. Delete UserMovie records (watched/watchlist items)
      const userMoviesDeleted = await tx.userMovie.deleteMany({});
      console.log(`✅ Deleted ${userMoviesDeleted.count} user movie records`);

      // 2. Delete MovieGenre relations
      const movieGenresDeleted = await tx.movieGenre.deleteMany({});
      console.log(`✅ Deleted ${movieGenresDeleted.count} movie-genre relations`);

      // 3. Delete Cast records
      const castDeleted = await tx.cast.deleteMany({});
      console.log(`✅ Deleted ${castDeleted.count} cast records`);

      // 4. Delete Crew records
      const crewDeleted = await tx.crew.deleteMany({});
      console.log(`✅ Deleted ${crewDeleted.count} crew records`);

      // 5. Delete Video records
      const videosDeleted = await tx.video.deleteMany({});
      console.log(`✅ Deleted ${videosDeleted.count} video records`);

      // 6. Delete ProductionCompany records
      const companiesDeleted = await tx.productionCompany.deleteMany({});
      console.log(`✅ Deleted ${companiesDeleted.count} production company records`);

      // 7. Delete ProductionCountry records
      const countriesDeleted = await tx.productionCountry.deleteMany({});
      console.log(`✅ Deleted ${countriesDeleted.count} production country records`);

      // 8. Delete SpokenLanguage records
      const languagesDeleted = await tx.spokenLanguage.deleteMany({});
      console.log(`✅ Deleted ${languagesDeleted.count} spoken language records`);

      // 9. Delete Movies
      const moviesDeleted = await tx.movie.deleteMany({});
      console.log(`✅ Deleted ${moviesDeleted.count} movies`);

      // 10. Delete Genres
      const genresDeleted = await tx.genre.deleteMany({});
      console.log(`✅ Deleted ${genresDeleted.count} genres`);

      // 11. Delete Persons
      const personsDeleted = await tx.person.deleteMany({});
      console.log(`✅ Deleted ${personsDeleted.count} persons`);

      // Note: We're NOT deleting User or Session records as requested
      const userCount = await tx.user.count();
      const sessionCount = await tx.session.count();
      console.log(`\n📊 Preserved data:`);
      console.log(`   - ${userCount} users`);
      console.log(`   - ${sessionCount} sessions`);
    });

    console.log('\n✨ Database cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupDatabase();
}

export { cleanupDatabase };
