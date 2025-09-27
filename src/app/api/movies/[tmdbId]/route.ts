import { NextResponse } from 'next/server';
import { prisma } from '@core/lib/prisma';
import { tmdbService } from '@/lib/tmdb';
import { Any } from '@/types';

// Background job to store movie data
async function storeMovieDataInBackground(tmdbMovie: Any, tmdbId: number) {
  try {
    // Create or update the movie
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

    // Delete existing relations (but don't wait)
    const deletePromises = [
      prisma.movieGenre.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.video.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.cast.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.crew.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.productionCompany.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.productionCountry.deleteMany({ where: { movieId: updatedMovie.id } }),
      prisma.spokenLanguage.deleteMany({ where: { movieId: updatedMovie.id } }),
    ];

    await Promise.all(deletePromises);

    // Store genres - create them if they don't exist
    if (tmdbMovie.genres && Array.isArray(tmdbMovie.genres)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const genrePromises = tmdbMovie.genres.map(async (genre: any) => {
        try {
          // First ensure genre exists
          await prisma.genre.upsert({
            where: { id: genre.id },
            update: { name: genre.name },
            create: { id: genre.id, name: genre.name },
          });

          // Then create the relation
          await prisma.movieGenre.create({
            data: {
              movieId: updatedMovie.id,
              genreId: genre.id,
            },
          });
        } catch {
          // Silently skip - genre relation likely already exists
        }
      });

      await Promise.all(genrePromises);
    }

    // Store videos
    if (tmdbMovie.videos?.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoPromises = tmdbMovie.videos.results.slice(0, 10).map((video: any) =>
        prisma.video
          .create({
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
          })
          .catch(() => null),
      );
      await Promise.all(videoPromises);
    }

    // Store cast and crew (for background storage)
    if (tmdbMovie.credits) {
      // Store cast
      if (tmdbMovie.credits.cast && Array.isArray(tmdbMovie.credits.cast)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const castPromises = tmdbMovie.credits.cast.slice(0, 20).map(async (member: any) => {
          try {
            // First ensure person exists
            await prisma.person.upsert({
              where: { id: member.id },
              update: {
                name: member.name,
                profilePath: member.profile_path,
              },
              create: {
                id: member.id,
                name: member.name,
                profilePath: member.profile_path,
              },
            });

            // Then create cast relation
            await prisma.cast.create({
              data: {
                movieId: updatedMovie.id,
                personId: member.id,
                character: member.character,
                order: member.order,
              },
            });
          } catch {
            console.log('Cast member relation already exists or failed');
          }
        });

        await Promise.all(castPromises);
      }

      // Store crew
      if (tmdbMovie.credits.crew && Array.isArray(tmdbMovie.credits.crew)) {
        const crewPromises = tmdbMovie.credits.crew
          .filter((member: Any) =>
            ['Director', 'Producer', 'Screenplay', 'Writer', 'Executive Producer'].includes(
              member.job,
            ),
          )
          .slice(0, 20)
          .map(async (member: Any) => {
            try {
              // First ensure person exists
              await prisma.person.upsert({
                where: { id: member.id },
                update: {
                  name: member.name,
                  profilePath: member.profile_path,
                },
                create: {
                  id: member.id,
                  name: member.name,
                  profilePath: member.profile_path,
                },
              });

              // Then create crew relation
              await prisma.crew.create({
                data: {
                  movieId: updatedMovie.id,
                  personId: member.id,
                  department: member.department,
                  job: member.job,
                },
              });
            } catch {
              console.log('Crew member relation already exists or failed');
            }
          });

        await Promise.all(crewPromises);
      }
    }

    console.log(`✅ Background storage complete for movie ${tmdbId}`);
  } catch (error) {
    console.error(`❌ Background storage failed for movie ${tmdbId}:`, error);
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ tmdbId: string }> }) {
  let tmdbIdParam: string = '';

  try {
    const resolvedParams = await params;
    tmdbIdParam = resolvedParams.tmdbId;
    const tmdbId = parseInt(tmdbIdParam);

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    // Check cache first
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
            credits:
              cachedMovie.cast.length > 0 || cachedMovie.crew.length > 0
                ? {
                    cast: cachedMovie.cast.map((c) => ({
                      ...c.person,
                      character: c.character,
                      order: c.order,
                    })),
                    crew: cachedMovie.crew.map((c) => ({
                      ...c.person,
                      department: c.department,
                      job: c.job,
                    })),
                  }
                : null,
          },
          cached: true,
        });
      }
    }

    // Fetch fresh data from TMDb
    let tmdbMovie;
    try {
      tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
    } catch (fetchError) {
      console.error('TMDb fetch failed:', fetchError);

      // If we have ANY cached data, return it even if stale
      if (cachedMovie) {
        return NextResponse.json({
          movie: {
            ...cachedMovie,
            budget: cachedMovie.budget ? cachedMovie.budget.toString() : null,
            revenue: cachedMovie.revenue ? cachedMovie.revenue.toString() : null,
            genres: cachedMovie.genres.map((mg) => mg.genre),
            credits:
              cachedMovie.cast.length > 0 || cachedMovie.crew.length > 0
                ? {
                    cast: cachedMovie.cast.map((c) => ({
                      ...c.person,
                      character: c.character,
                      order: c.order,
                    })),
                    crew: cachedMovie.crew.map((c) => ({
                      ...c.person,
                      department: c.department,
                      job: c.job,
                    })),
                  }
                : null,
          },
          cached: true,
          stale: true,
        });
      }

      // No cached data and fetch failed
      throw fetchError;
    }

    // Transform the TMDb response for immediate return
    const responseData = {
      id: cachedMovie?.id, // Keep existing DB id if available
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      posterPath: tmdbMovie.poster_path,
      backdropPath: tmdbMovie.backdrop_path,
      releaseDate: tmdbMovie.release_date,
      runtime: tmdbMovie.runtime,
      voteAverage: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      budget: tmdbMovie.budget ? tmdbMovie.budget.toString() : null,
      revenue: tmdbMovie.revenue ? tmdbMovie.revenue.toString() : null,
      tagline: tmdbMovie.tagline,
      homepage: tmdbMovie.homepage,
      imdbId: tmdbMovie.imdb_id,
      originalLanguage: tmdbMovie.original_language,
      originalTitle: tmdbMovie.original_title,
      popularity: tmdbMovie.popularity,
      status: tmdbMovie.status,
      genres: tmdbMovie.genres || [],
      videos: tmdbMovie.videos?.results || [],
      credits: tmdbMovie.credits
        ? {
            cast: tmdbMovie.credits.cast?.slice(0, 10) || [],
            crew:
              tmdbMovie.credits.crew
                ?.filter((c: Any) =>
                  ['Director', 'Producer', 'Screenplay', 'Writer'].includes(c.job),
                )
                .slice(0, 10) || [],
          }
        : null,
      production_companies: tmdbMovie.production_companies || [],
      production_countries: tmdbMovie.production_countries || [],
      spoken_languages: tmdbMovie.spoken_languages || [],
    };

    // Start background storage (don't await)
    storeMovieDataInBackground(tmdbMovie, tmdbId).catch((error) => {
      console.error('Background storage error:', error);
    });

    // Return immediately with fresh data
    return NextResponse.json({
      movie: responseData,
      cached: false,
    });
  } catch (error) {
    console.error('Movie detail fetch error:', error);

    // Try to get ANY cached data as last resort
    if (tmdbIdParam) {
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
          },
        });

        if (cachedMovie) {
          return NextResponse.json({
            movie: {
              ...cachedMovie,
              budget: cachedMovie.budget ? cachedMovie.budget.toString() : null,
              revenue: cachedMovie.revenue ? cachedMovie.revenue.toString() : null,
              genres: cachedMovie.genres.map((mg) => mg.genre),
            },
            cached: true,
            stale: true,
            error: true,
          });
        }
      } catch (cacheError) {
        console.error('Cache retrieval failed:', cacheError);
      }
    }

    // Return appropriate error response
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
