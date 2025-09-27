import { NextResponse } from 'next/server';
import { prisma } from '@core/lib/prisma';
import { tmdbService } from '@/lib/tmdb';

export async function GET(request: Request, { params }: { params: Promise<{ tmdbId: string }> }) {
  let tmdbIdParam: string = '';

  try {
    const resolvedParams = await params;
    tmdbIdParam = resolvedParams.tmdbId;
    const tmdbId = parseInt(tmdbIdParam);

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    // Check cache first - now including relations
    const cachedMovie = await prisma.movie.findUnique({
      where: { tmdbId },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        videos: true,
        cast: {
          include: {
            person: true,
          },
          orderBy: { order: 'asc' },
          take: 10,
        },
        crew: {
          include: {
            person: true,
          },
          where: {
            OR: [
              { job: 'Director' },
              { job: 'Producer' },
              { job: 'Screenplay' },
              { job: 'Writer' },
            ],
          },
          take: 10,
        },
        productionCompanies: true,
        productionCountries: true,
        spokenLanguages: true,
      },
    });

    // If cached and recent (less than 24 hours old), return it
    if (cachedMovie && cachedMovie.cachedAt) {
      const cacheAge = Date.now() - cachedMovie.cachedAt.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (cacheAge < oneDayInMs) {
        return NextResponse.json({
          movie: {
            ...cachedMovie,
            budget: cachedMovie.budget ? cachedMovie.budget.toString() : null,
            revenue: cachedMovie.revenue ? cachedMovie.revenue.toString() : null,
            genres: cachedMovie.genres.map((mg) => mg.genre),
          },
        });
      }
    }

    // Fetch from TMDb with all additional data
    const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);

    // Create or update the movie first
    const updatedMovie = await prisma.movie.upsert({
      where: { tmdbId },
      update: {
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        budget: tmdbMovie.budget ? BigInt(tmdbMovie.budget) : null,
        revenue: tmdbMovie.revenue ? BigInt(tmdbMovie.revenue) : null,
        tagline: tmdbMovie.tagline,
        homepage: tmdbMovie.homepage,
        imdbId: tmdbMovie.imdb_id,
        originalLanguage: tmdbMovie.original_language,
        originalTitle: tmdbMovie.original_title,
        popularity: tmdbMovie.popularity,
        status: tmdbMovie.status,
        cachedAt: new Date(),
      },
      create: {
        tmdbId,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview || null,
        posterPath: tmdbMovie.poster_path || null,
        backdropPath: tmdbMovie.backdrop_path || null,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime || null,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        budget: tmdbMovie.budget ? BigInt(tmdbMovie.budget) : null,
        revenue: tmdbMovie.revenue ? BigInt(tmdbMovie.revenue) : null,
        tagline: tmdbMovie.tagline,
        homepage: tmdbMovie.homepage,
        imdbId: tmdbMovie.imdb_id,
        originalLanguage: tmdbMovie.original_language,
        originalTitle: tmdbMovie.original_title,
        popularity: tmdbMovie.popularity,
        status: tmdbMovie.status,
      },
    });

    // Delete existing relations before creating new ones
    await Promise.all([
      prisma.movieGenre.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.video.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.cast.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.crew.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.productionCompany.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.productionCountry.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.spokenLanguage.deleteMany({ where: { movieId: updatedMovie.id } }),
    ]);

    // Save genres
    if (tmdbMovie.genres && Array.isArray(tmdbMovie.genres)) {
      const genrePromises = tmdbMovie.genres.map(
        (genre) =>
          prisma.movieGenre
            .create({
              data: {
                movieId: updatedMovie.id,
                genreId: genre.id,
              },
            })
            .catch(() => null), // Ignore if genre doesn't exist in database
      );
      await Promise.all(genrePromises);
    }

    // Save videos
    if (tmdbMovie.videos?.results) {
      const videoPromises = tmdbMovie.videos.results.slice(0, 10).map((video) =>
        prisma.video.create({
          data: {
            movieId: updatedMovie.id,
            key: video.key,
            name: video.name,
            site: video.site,
            size: video.size,
            type: video.type,
            official: video.official || false,
            publishedAt: video.published_at ? new Date(video.published_at) : null,
          },
        }),
      );
      await Promise.all(videoPromises);
    }

    // Save cast with Person records
    if (tmdbMovie.credits?.cast) {
      // First, create/update Person records
      const castPeople = tmdbMovie.credits.cast.slice(0, 20);
      await Promise.all(
        castPeople.map((person) =>
          prisma.person.upsert({
            where: { id: person.id },
            update: {
              name: person.name,
              profilePath: person.profile_path || null,
            },
            create: {
              id: person.id,
              name: person.name,
              profilePath: person.profile_path || null,
            },
          }),
        ),
      );

      // Then create Cast records
      const castPromises = castPeople.map(
        (person, index) =>
          prisma.cast
            .create({
              data: {
                movieId: updatedMovie.id,
                personId: person.id,
                character: person.character || null,
                order: person.order || index,
              },
            })
            .catch(() => null), // Ignore duplicates
      );
      await Promise.all(castPromises);
    }

    // Save crew with Person records
    if (tmdbMovie.credits?.crew) {
      const importantCrew = tmdbMovie.credits.crew.filter((person) =>
        [
          'Director',
          'Producer',
          'Screenplay',
          'Writer',
          'Director of Photography',
          'Original Music Composer',
        ].includes(person.job),
      );

      // First, create/update Person records
      const crewPeople = importantCrew.slice(0, 20);
      await Promise.all(
        crewPeople.map((person) =>
          prisma.person.upsert({
            where: { id: person.id },
            update: {
              name: person.name,
              profilePath: person.profile_path || null,
            },
            create: {
              id: person.id,
              name: person.name,
              profilePath: person.profile_path || null,
            },
          }),
        ),
      );

      // Then create Crew records
      const crewPromises = crewPeople.map(
        (person) =>
          prisma.crew
            .create({
              data: {
                movieId: updatedMovie.id,
                personId: person.id,
                job: person.job,
                department: person.department,
              },
            })
            .catch(() => null), // Ignore duplicates
      );
      await Promise.all(crewPromises);
    }

    // Save production companies
    if (tmdbMovie.production_companies) {
      const companyPromises = tmdbMovie.production_companies.map(
        (company) =>
          prisma.productionCompany
            .create({
              data: {
                movieId: updatedMovie.id,
                companyId: company.id,
                name: company.name,
                logoPath: company.logo_path || null,
                originCountry: company.origin_country || null,
              },
            })
            .catch(() => null), // Ignore duplicates
      );
      await Promise.all(companyPromises);
    }

    // Save production countries
    if (tmdbMovie.production_countries) {
      const countryPromises = tmdbMovie.production_countries.map((country) =>
        prisma.productionCountry
          .create({
            data: {
              movieId: updatedMovie.id,
              iso31661: country.iso_3166_1,
              name: country.name,
            },
          })
          .catch(() => null),
      );
      await Promise.all(countryPromises);
    }

    // Save spoken languages
    if (tmdbMovie.spoken_languages) {
      const languagePromises = tmdbMovie.spoken_languages.map((lang) =>
        prisma.spokenLanguage
          .create({
            data: {
              movieId: updatedMovie.id,
              iso6391: lang.iso_639_1,
              name: lang.name,
              englishName: lang.english_name || null,
            },
          })
          .catch(() => null),
      );
      await Promise.all(languagePromises);
    }

    // Fetch the complete movie with all relations
    const completeMovie = await prisma.movie.findUnique({
      where: { id: updatedMovie.id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        videos: true,
        cast: {
          include: {
            person: true,
          },
          orderBy: { order: 'asc' },
          take: 10,
        },
        crew: {
          include: {
            person: true,
          },
          where: {
            OR: [
              { job: 'Director' },
              { job: 'Producer' },
              { job: 'Screenplay' },
              { job: 'Writer' },
            ],
          },
          take: 10,
        },
        productionCompanies: true,
        productionCountries: true,
        spokenLanguages: true,
      },
    });

    return NextResponse.json({
      movie: {
        ...completeMovie,
        budget: completeMovie?.budget ? completeMovie.budget.toString() : null,
        revenue: completeMovie?.revenue ? completeMovie.revenue.toString() : null,
        genres: completeMovie?.genres.map((mg) => mg.genre) || [],
      },
    });
  } catch (error) {
    console.error('Movie detail fetch error:', error);

    // If we have a cached version, return it even if it's stale
    try {
      const cachedMovie = await prisma.movie.findUnique({
        where: { tmdbId: parseInt(tmdbIdParam) },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
          videos: true,
          cast: {
            include: {
              person: true,
            },
            orderBy: { order: 'asc' },
            take: 10,
          },
          crew: {
            include: {
              person: true,
            },
            where: {
              OR: [
                { job: 'Director' },
                { job: 'Producer' },
                { job: 'Screenplay' },
                { job: 'Writer' },
              ],
            },
            take: 10,
          },
          productionCompanies: true,
          productionCountries: true,
          spokenLanguages: true,
        },
      });

      if (cachedMovie) {
        console.log('Returning stale cache due to TMDb API error');
        return NextResponse.json({
          movie: {
            ...cachedMovie,
            budget: cachedMovie.budget ? cachedMovie.budget.toString() : null,
            revenue: cachedMovie.revenue ? cachedMovie.revenue.toString() : null,
            genres: cachedMovie.genres.map((mg) => mg.genre),
          },
          cached: true,
          stale: true,
        });
      }
    } catch (cacheError) {
      console.error('Failed to fetch from cache:', cacheError);
    }

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('TMDB API key')) {
        return NextResponse.json({ error: 'TMDb API key not configured' }, { status: 503 });
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ error: 'Request timeout - TMDb API is slow' }, { status: 504 });
      }
      if (error.message.includes('ECONNRESET') || error.message.includes('network')) {
        return NextResponse.json({ error: 'Network error - please try again' }, { status: 503 });
      }
    }

    return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 });
  }
}
