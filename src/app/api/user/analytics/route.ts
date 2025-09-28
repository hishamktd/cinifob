import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@core/lib/prisma';
import dayjs from 'dayjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Fetch all user data in parallel
    const [
      watchedMovies,
      watchedTVShows,
      watchlistMovies,
      // watchlistTVShows,
      userEpisodes,
    ] = await Promise.all([
      prisma.userMovie.findMany({
        where: { userId, status: 'WATCHED' },
        include: {
          movie: {
            include: {
              genres: {
                include: {
                  genre: true,
                },
              },
            },
          },
        },
      }),
      prisma.userTVShow.findMany({
        where: { userId, status: 'COMPLETED' },
        include: { tvShow: true },
      }),
      prisma.userMovie.findMany({
        where: { userId, status: 'WATCHLIST' },
        include: { movie: true },
      }),
      prisma.userTVShow.findMany({
        where: { userId, status: 'WATCHLIST' },
        include: { tvShow: true },
      }),
      prisma.userEpisode.findMany({
        where: { userId },
        include: {
          episode: {
            include: {
              season: {
                include: {
                  tvShow: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Advanced Genre Analysis
    const genreData = new Map<
      string,
      {
        count: number;
        totalRuntime: number;
        totalRating: number;
        ratingCount: number;
        titles: string[];
      }
    >();

    watchedMovies.forEach((um) => {
      if (um.movie?.genres) {
        um.movie.genres.forEach((mg) => {
          const genreName = mg.genre.name;
          if (genreName) {
            const existing = genreData.get(genreName) || {
              count: 0,
              totalRuntime: 0,
              totalRating: 0,
              ratingCount: 0,
              titles: [],
            };
            existing.count++;
            existing.totalRuntime += um.movie?.runtime || 0;
            if (um.rating) {
              existing.totalRating += um.rating;
              existing.ratingCount++;
            }
            existing.titles.push(um.movie?.title || '');
            genreData.set(genreName, existing);
          }
        });
      }
    });

    const genreStats = Array.from(genreData.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        percentage: (stats.count / watchedMovies.length) * 100,
        avgRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0,
        totalHours: Math.round(stats.totalRuntime / 60),
      }))
      .sort((a, b) => b.count - a.count);

    // Production Company Analysis
    const companyMap = new Map<string, number>();
    const countryMap = new Map<string, number>();
    const languageMap = new Map<string, number>();
    const yearMap = new Map<number, number>();

    // Analyze movies for production data
    const allMovies = await prisma.movie.findMany({
      where: {
        id: {
          in: watchedMovies.map((um) => um.movieId),
        },
      },
      include: {
        productionCompanies: true,
        productionCountries: true,
        spokenLanguages: true,
      },
    });

    allMovies.forEach((movie) => {
      // Companies
      movie.productionCompanies.forEach((pc) => {
        companyMap.set(pc.name, (companyMap.get(pc.name) || 0) + 1);
      });

      // Countries
      movie.productionCountries.forEach((pc) => {
        countryMap.set(pc.name, (countryMap.get(pc.name) || 0) + 1);
      });

      // Languages
      movie.spokenLanguages.forEach((sl) => {
        languageMap.set(sl.name, (languageMap.get(sl.name) || 0) + 1);
      });

      // Year
      if (movie.releaseDate) {
        const year = new Date(movie.releaseDate).getFullYear();
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    });

    // Decade Analysis
    const decadeMap = new Map<string, number>();
    Array.from(yearMap.entries()).forEach(([year, count]) => {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeMap.set(decade, (decadeMap.get(decade) || 0) + count);
    });

    // Runtime Distribution
    const runtimeRanges = {
      'Under 90 min': 0,
      '90-120 min': 0,
      '120-150 min': 0,
      '150-180 min': 0,
      'Over 180 min': 0,
    };

    watchedMovies.forEach((um) => {
      const runtime = um.movie?.runtime || 0;
      if (runtime < 90) runtimeRanges['Under 90 min']++;
      else if (runtime <= 120) runtimeRanges['90-120 min']++;
      else if (runtime <= 150) runtimeRanges['120-150 min']++;
      else if (runtime <= 180) runtimeRanges['150-180 min']++;
      else runtimeRanges['Over 180 min']++;
    });

    // Time-based viewing patterns
    const hourlyPattern = new Array(24).fill(0);
    const monthlyPattern = new Array(12).fill(0);
    const seasonalPattern = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };

    [...watchedMovies, ...watchedTVShows].forEach((item) => {
      const date = 'watchedAt' in item ? item.watchedAt : item.completedAt;
      if (date) {
        const d = new Date(date);
        hourlyPattern[d.getHours()]++;
        monthlyPattern[d.getMonth()]++;

        const month = d.getMonth() + 1;
        if (month >= 3 && month <= 5) seasonalPattern.Spring++;
        else if (month >= 6 && month <= 8) seasonalPattern.Summer++;
        else if (month >= 9 && month <= 11) seasonalPattern.Fall++;
        else seasonalPattern.Winter++;
      }
    });

    // Rating Analysis
    const ratingsByYear = new Map<number, { total: number; count: number }>();
    watchedMovies.forEach((um) => {
      if (um.watchedAt && um.rating) {
        const year = new Date(um.watchedAt).getFullYear();
        const existing = ratingsByYear.get(year) || { total: 0, count: 0 };
        existing.total += um.rating;
        existing.count++;
        ratingsByYear.set(year, existing);
      }
    });

    // Viewing Streaks and Gaps
    const watchDates = [...watchedMovies, ...watchedTVShows]
      .filter((item) => ('watchedAt' in item ? item.watchedAt : item.completedAt))
      .map((item) => dayjs('watchedAt' in item ? item.watchedAt : item.completedAt))
      .sort((a, b) => a.unix() - b.unix());

    const gaps: number[] = [];
    for (let i = 1; i < watchDates.length; i++) {
      gaps.push(watchDates[i].diff(watchDates[i - 1], 'day'));
    }

    const avgGap = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0;

    // Binging detection (multiple items in same day)
    const dateCountMap = new Map<string, number>();
    watchDates.forEach((date) => {
      const key = date.format('YYYY-MM-DD');
      dateCountMap.set(key, (dateCountMap.get(key) || 0) + 1);
    });
    const bingingDays = Array.from(dateCountMap.values()).filter((count) => count > 1).length;
    const bingingScore = Math.round((bingingDays / dateCountMap.size) * 100);

    // Diversity Score (based on genre variety)
    const uniqueGenres = genreStats.length;
    const totalContent = watchedMovies.length + watchedTVShows.length;
    const diversityScore = Math.min(
      Math.round((uniqueGenres / Math.max(totalContent, 1)) * 200),
      100,
    );

    // Top rated by genre
    const topRatedByGenre: { genre: string; title: string; rating: number; tmdbId: number }[] = [];
    genreData.forEach((stats, genre) => {
      const bestInGenre = watchedMovies
        .filter((um) => {
          const genres = um.movie?.genres || [];
          return genres.some((mg) => {
            return mg.genre.name === genre;
          });
        })
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

      if (bestInGenre?.movie) {
        topRatedByGenre.push({
          genre,
          title: bestInGenre.movie.title,
          rating: bestInGenre.rating || 0,
          tmdbId: bestInGenre.movie.tmdbId,
        });
      }
    });

    // Cast and Crew Analysis
    const actorMap = new Map<string, number>();
    const directorMap = new Map<string, number>();

    const moviesWithCast = await prisma.movie.findMany({
      where: {
        id: { in: watchedMovies.map((um) => um.movieId) },
      },
      include: {
        cast: { include: { person: true } },
        crew: { include: { person: true } },
      },
    });

    moviesWithCast.forEach((movie) => {
      movie.cast.slice(0, 5).forEach((cast) => {
        actorMap.set(cast.person.name, (actorMap.get(cast.person.name) || 0) + 1);
      });

      movie.crew
        .filter((crew) => crew.job === 'Director')
        .forEach((crew) => {
          directorMap.set(crew.person.name, (directorMap.get(crew.person.name) || 0) + 1);
        });
    });

    const topActors = Array.from(actorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topDirectors = Array.from(directorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      genreStats,
      productionStats: {
        companies: Array.from(companyMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        countries: Array.from(countryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        languages: Array.from(languageMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        decades: Array.from(decadeMap.entries())
          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
          .map(([decade, count]) => ({ decade, count })),
      },
      viewingHabits: {
        bingingScore,
        diversityScore,
        completionScore: Math.round(
          (watchedMovies.length / Math.max(watchedMovies.length + watchlistMovies.length, 1)) * 100,
        ),
        averageGap: avgGap,
        preferredLength: Object.entries(runtimeRanges).sort((a, b) => b[1] - a[1])[0][0],
        weekendVsWeekday: {
          weekend: Math.round(
            ((seasonalPattern.Spring + seasonalPattern.Summer) /
              Math.max(
                Object.values(seasonalPattern).reduce((a, b) => a + b, 0),
                1,
              )) *
              100,
          ),
          weekday: Math.round(
            ((seasonalPattern.Fall + seasonalPattern.Winter) /
              Math.max(
                Object.values(seasonalPattern).reduce((a, b) => a + b, 0),
                1,
              )) *
              100,
          ),
        },
      },
      topRatedByGenre,
      runtimeDistribution: runtimeRanges,
      hourlyPattern,
      monthlyPattern,
      seasonalPattern,
      ratingsByYear: Array.from(ratingsByYear.entries()).map(([year, data]) => ({
        year,
        avgRating: data.total / data.count,
        count: data.count,
      })),
      topActors,
      topDirectors,
      totalStats: {
        totalMovies: watchedMovies.length,
        totalShows: watchedTVShows.length,
        totalEpisodes: userEpisodes.length,
        totalRuntime: watchedMovies.reduce((sum, um) => sum + (um.movie?.runtime || 0), 0),
        uniqueGenres: genreStats.length,
        uniqueCountries: countryMap.size,
        uniqueLanguages: languageMap.size,
        avgRating:
          watchedMovies.filter((m) => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) /
          Math.max(watchedMovies.filter((m) => m.rating).length, 1),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
