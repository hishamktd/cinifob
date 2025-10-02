import { PrismaClient } from '../src/generated/prisma';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface CleanupOptions {
  preserveUsers?: boolean;
  preserveSessions?: boolean;
  preserveGenres?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getCleanupStats() {
  const [
    userCount,
    sessionCount,
    movieCount,
    userMovieCount,
    genreCount,
    personCount,
    castCount,
    crewCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.movie.count(),
    prisma.userMovie.count(),
    prisma.genre.count(),
    prisma.person.count(),
    prisma.cast.count(),
    prisma.crew.count(),
  ]);

  return {
    users: userCount,
    sessions: sessionCount,
    movies: movieCount,
    userMovies: userMovieCount,
    genres: genreCount,
    persons: personCount,
    cast: castCount,
    crew: crewCount,
    total:
      userCount +
      sessionCount +
      movieCount +
      userMovieCount +
      genreCount +
      personCount +
      castCount +
      crewCount,
  };
}

async function cleanupDatabase(options: CleanupOptions = {}) {
  const {
    preserveUsers = true,
    preserveSessions = true,
    preserveGenres = false,
    dryRun = false,
    force = false,
  } = options;

  console.log('🧹 Database Cleanup Utility');
  console.log('━'.repeat(50));

  // Get current database stats
  const stats = await getCleanupStats();
  console.log('\n📊 Current Database Statistics:');
  console.log(`   • Users: ${stats.users}`);
  console.log(`   • Sessions: ${stats.sessions}`);
  console.log(`   • Movies: ${stats.movies}`);
  console.log(`   • User Movies (Watchlist/Watched): ${stats.userMovies}`);
  console.log(`   • Genres: ${stats.genres}`);
  console.log(`   • Persons: ${stats.persons}`);
  console.log(`   • Cast: ${stats.cast}`);
  console.log(`   • Crew: ${stats.crew}`);
  console.log(`   • Total Records: ${stats.total}`);

  console.log('\n⚙️  Cleanup Options:');
  console.log(`   • Preserve Users: ${preserveUsers ? '✅' : '❌'}`);
  console.log(`   • Preserve Sessions: ${preserveSessions ? '✅' : '❌'}`);
  console.log(`   • Preserve Genres: ${preserveGenres ? '✅' : '❌'}`);
  console.log(`   • Dry Run: ${dryRun ? '✅' : '❌'}`);

  if (dryRun) {
    console.log('\n📝 DRY RUN MODE - No data will be deleted');
  }

  if (!force && !dryRun) {
    console.log('\n⚠️  WARNING: This operation will delete data from your database!');
    const answer = await askQuestion('Are you sure you want to continue? (yes/no): ');
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Cleanup cancelled');
      rl.close();
      await prisma.$disconnect();
      return;
    }
  }

  console.log('\n🔄 Starting cleanup...\n');

  try {
    if (dryRun) {
      // Dry run - just show what would be deleted
      console.log('🔍 Analyzing what would be deleted...\n');

      const deletions = {
        userMovies: await prisma.userMovie.count(),
        movieGenres: await prisma.movieGenre.count(),
        cast: await prisma.cast.count(),
        crew: await prisma.crew.count(),
        videos: await prisma.video.count(),
        productionCompanies: await prisma.productionCompany.count(),
        productionCountries: await prisma.productionCountry.count(),
        spokenLanguages: await prisma.spokenLanguage.count(),
        movies: await prisma.movie.count(),
        genres: preserveGenres ? 0 : await prisma.genre.count(),
        persons: await prisma.person.count(),
        users: preserveUsers ? 0 : await prisma.user.count(),
        sessions: preserveSessions ? 0 : await prisma.session.count(),
      };

      console.log('📋 DRY RUN Results - Would delete:');
      Object.entries(deletions).forEach(([table, count]) => {
        if (count > 0) {
          console.log(`   • ${table}: ${count} records`);
        }
      });

      const totalToDelete = Object.values(deletions).reduce((a, b) => a + b, 0);
      console.log(`\n   Total records that would be deleted: ${totalToDelete}`);
    } else {
      // Actual deletion
      await prisma.$transaction(
        async (tx) => {
          const results = [];

          // 1. Delete UserMovie records (watched/watchlist items)
          const userMoviesDeleted = await tx.userMovie.deleteMany({});
          results.push(`✅ Deleted ${userMoviesDeleted.count} user movie records`);

          // 2. Delete MovieGenre relations
          const movieGenresDeleted = await tx.movieGenre.deleteMany({});
          results.push(`✅ Deleted ${movieGenresDeleted.count} movie-genre relations`);

          // 3. Delete Cast records
          const castDeleted = await tx.cast.deleteMany({});
          results.push(`✅ Deleted ${castDeleted.count} cast records`);

          // 4. Delete Crew records
          const crewDeleted = await tx.crew.deleteMany({});
          results.push(`✅ Deleted ${crewDeleted.count} crew records`);

          // 5. Delete Video records
          const videosDeleted = await tx.video.deleteMany({});
          results.push(`✅ Deleted ${videosDeleted.count} video records`);

          // 6. Delete ProductionCompany records
          const companiesDeleted = await tx.productionCompany.deleteMany({});
          results.push(`✅ Deleted ${companiesDeleted.count} production company records`);

          // 7. Delete ProductionCountry records
          const countriesDeleted = await tx.productionCountry.deleteMany({});
          results.push(`✅ Deleted ${countriesDeleted.count} production country records`);

          // 8. Delete SpokenLanguage records
          const languagesDeleted = await tx.spokenLanguage.deleteMany({});
          results.push(`✅ Deleted ${languagesDeleted.count} spoken language records`);

          // 9. Delete Movies
          const moviesDeleted = await tx.movie.deleteMany({});
          results.push(`✅ Deleted ${moviesDeleted.count} movies`);

          // 10. Optionally delete Genres
          if (!preserveGenres) {
            const genresDeleted = await tx.genre.deleteMany({});
            results.push(`✅ Deleted ${genresDeleted.count} genres`);
          }

          // 11. Delete Persons
          const personsDeleted = await tx.person.deleteMany({});
          results.push(`✅ Deleted ${personsDeleted.count} persons`);

          // 12. Optionally delete Sessions
          if (!preserveSessions) {
            const sessionsDeleted = await tx.session.deleteMany({});
            results.push(`✅ Deleted ${sessionsDeleted.count} sessions`);
          }

          // 13. Optionally delete Users
          if (!preserveUsers) {
            const usersDeleted = await tx.user.deleteMany({});
            results.push(`✅ Deleted ${usersDeleted.count} users`);
          }

          // Print all results
          results.forEach((result) => console.log(result));
        },
        {
          timeout: 30000, // 30 seconds timeout for large deletions
        },
      );

      // Show what was preserved
      console.log('\n📊 Preserved data:');
      if (preserveUsers) {
        const userCount = await prisma.user.count();
        console.log(`   • ${userCount} users`);
      }
      if (preserveSessions) {
        const sessionCount = await prisma.session.count();
        console.log(`   • ${sessionCount} sessions`);
      }
      if (preserveGenres) {
        const genreCount = await prisma.genre.count();
        console.log(`   • ${genreCount} genres`);
      }
    }

    console.log('\n✨ Database cleanup completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Parse command line arguments
function parseArgs(): CleanupOptions {
  const args = process.argv.slice(2);
  const options: CleanupOptions = {
    preserveUsers: true,
    preserveSessions: true,
    preserveGenres: false,
    dryRun: false,
    force: false,
  };

  args.forEach((arg) => {
    switch (arg) {
      case '--delete-users':
        options.preserveUsers = false;
        break;
      case '--delete-sessions':
        options.preserveSessions = false;
        break;
      case '--preserve-genres':
        options.preserveGenres = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--help':
        console.log('Database Cleanup Script');
        console.log('Usage: npm run db:cleanup [options]');
        console.log('\nOptions:');
        console.log('  --delete-users      Delete all users (default: preserve)');
        console.log('  --delete-sessions   Delete all sessions (default: preserve)');
        console.log('  --preserve-genres   Keep genre data (default: delete)');
        console.log('  --dry-run          Show what would be deleted without deleting');
        console.log('  --force            Skip confirmation prompt');
        console.log('  --help             Show this help message');
        process.exit(0);
    }
  });

  return options;
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  const options = parseArgs();
  cleanupDatabase(options);
}

export { cleanupDatabase };
