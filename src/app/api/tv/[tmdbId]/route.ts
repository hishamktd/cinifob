import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TMDBTVShow, TMDBGenre } from '@/types/tmdb';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      clearTimeout(timeout);

      if (response.ok) {
        return response;
      }

      // Handle 404 specifically - TV show not found
      if (response.status === 404) {
        return response; // Let the caller handle the 404
      }

      if (response.status !== 429 && response.status < 500) {
        throw new Error(`TMDb API error: ${response.status}`);
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error: unknown) {
      lastError = error as Error;

      // Log connection errors
      if (
        error instanceof Error &&
        ((error.cause as { code: string })?.code === 'ECONNRESET' || error.name === 'AbortError')
      ) {
        console.log(
          `Network error on attempt ${attempt}/${retries}:`,
          (error.cause as { code: string })?.code || error.name,
        );
      }
    }

    // Wait before retry (except on last attempt)
    if (attempt < retries) {
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Failed after all retries');
}

// Background job to store TV show data
async function storeTVShowDataInBackground(tmdbShow: TMDBTVShow, tmdbId: number) {
  try {
    // Create or update the TV show
    const updatedTVShow = await prisma.tVShow.upsert({
      where: { tmdbId },
      update: {
        name: tmdbShow.name,
        originalName: tmdbShow.original_name || undefined,
        overview: tmdbShow.overview || undefined,
        posterPath: tmdbShow.poster_path || undefined,
        backdropPath: tmdbShow.backdrop_path || undefined,
        firstAirDate: tmdbShow.first_air_date ? new Date(tmdbShow.first_air_date) : null,
        lastAirDate: tmdbShow.last_air_date ? new Date(tmdbShow.last_air_date) : null,
        episodeRunTime: tmdbShow.episode_run_time || [],
        voteAverage: tmdbShow.vote_average || undefined,
        voteCount: tmdbShow.vote_count || undefined,
        numberOfSeasons: tmdbShow.number_of_seasons || undefined,
        numberOfEpisodes: tmdbShow.number_of_episodes || undefined,
        inProduction: tmdbShow.in_production,
        status: tmdbShow.status || undefined,
        type: tmdbShow.type || undefined,
        homepage: tmdbShow.homepage || undefined,
        originalLanguage: tmdbShow.original_language || undefined,
        popularity: tmdbShow.popularity || undefined,
        tagline: tmdbShow.tagline || undefined,
        cachedAt: new Date(),
      },
      create: {
        tmdbId,
        name: tmdbShow.name,
        originalName: tmdbShow.original_name || undefined,
        overview: tmdbShow.overview || undefined,
        posterPath: tmdbShow.poster_path || undefined,
        backdropPath: tmdbShow.backdrop_path || undefined,
        firstAirDate: tmdbShow.first_air_date ? new Date(tmdbShow.first_air_date) : null,
        lastAirDate: tmdbShow.last_air_date ? new Date(tmdbShow.last_air_date) : null,
        episodeRunTime: tmdbShow.episode_run_time || [],
        voteAverage: tmdbShow.vote_average || undefined,
        voteCount: tmdbShow.vote_count || undefined,
        numberOfSeasons: tmdbShow.number_of_seasons || undefined,
        numberOfEpisodes: tmdbShow.number_of_episodes || undefined,
        inProduction: tmdbShow.in_production || false,
        status: tmdbShow.status || undefined,
        type: tmdbShow.type || undefined,
        homepage: tmdbShow.homepage || undefined,
        originalLanguage: tmdbShow.original_language || undefined,
        popularity: tmdbShow.popularity || undefined,
        tagline: tmdbShow.tagline || undefined,
      },
    });

    // Delete existing relations
    const deletePromises = [
      prisma.tVShowGenre.deleteMany({ where: { tvShowId: updatedTVShow.id } }),
      prisma.network.deleteMany({ where: { tvShowId: updatedTVShow.id } }),
      prisma.tVShowProductionCompany.deleteMany({ where: { tvShowId: updatedTVShow.id } }),
      prisma.creator.deleteMany({ where: { tvShowId: updatedTVShow.id } }),
    ];

    await Promise.all(deletePromises);

    // Store genres
    if (tmdbShow.genres && Array.isArray(tmdbShow.genres)) {
      const genrePromises = tmdbShow.genres.map(async (genre: TMDBGenre) => {
        try {
          // Ensure genre exists
          await prisma.genre.upsert({
            where: { id: genre.id },
            update: { name: genre.name },
            create: { id: genre.id, name: genre.name },
          });

          // Create the relation
          await prisma.tVShowGenre.create({
            data: {
              tvShowId: updatedTVShow.id,
              genreId: genre.id,
            },
          });
        } catch {
          // Silently skip - relation likely already exists
        }
      });

      await Promise.all(genrePromises);
    }

    // Store networks
    if (tmdbShow.networks && Array.isArray(tmdbShow.networks)) {
      const networkPromises = tmdbShow.networks.slice(0, 5).map((network) =>
        prisma.network
          .create({
            data: {
              tvShowId: updatedTVShow.id,
              networkId: network.id,
              name: network.name,
              logoPath: network.logo_path,
            },
          })
          .catch(() => null),
      );
      await Promise.all(networkPromises);
    }

    // Store creators
    if (tmdbShow.created_by && Array.isArray(tmdbShow.created_by)) {
      const creatorPromises = tmdbShow.created_by.slice(0, 5).map((creator) =>
        prisma.creator
          .create({
            data: {
              tvShowId: updatedTVShow.id,
              personId: creator.id,
              name: creator.name,
              profilePath: creator.profile_path,
            },
          })
          .catch(() => null),
      );
      await Promise.all(creatorPromises);
    }

    // Store seasons
    if (tmdbShow.seasons && Array.isArray(tmdbShow.seasons)) {
      const seasonPromises = tmdbShow.seasons.map((season) =>
        prisma.season
          .upsert({
            where: {
              tvShowId_seasonNumber: {
                tvShowId: updatedTVShow.id,
                seasonNumber: season.season_number,
              },
            },
            update: {
              name: season.name,
              overview: season.overview,
              posterPath: season.poster_path,
              airDate: season.air_date ? new Date(season.air_date) : null,
              episodeCount: season.episode_count,
            },
            create: {
              tvShowId: updatedTVShow.id,
              seasonNumber: season.season_number,
              name: season.name,
              overview: season.overview,
              posterPath: season.poster_path,
              airDate: season.air_date ? new Date(season.air_date) : null,
              episodeCount: season.episode_count,
            },
          })
          .catch(() => null),
      );
      await Promise.all(seasonPromises);
    }

    console.log(`✅ Background storage complete for TV show ${tmdbId}`);
  } catch (error) {
    console.error(`❌ Background storage failed for TV show ${tmdbId}:`, error);
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ tmdbId: string }> }) {
  let tmdbIdParam: string = '';

  try {
    const resolvedParams = await params;
    tmdbIdParam = resolvedParams.tmdbId;
    const tmdbId = parseInt(tmdbIdParam);

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid TV show ID' }, { status: 400 });
    }

    // Check cache first
    const cachedTVShow = await prisma.tVShow.findUnique({
      where: { tmdbId },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        networks: true,
        createdBy: true,
        seasons: {
          orderBy: { seasonNumber: 'asc' },
        },
      },
    });

    if (cachedTVShow && cachedTVShow.cachedAt) {
      const cacheAge = Date.now() - cachedTVShow.cachedAt.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (cacheAge < oneDayInMs) {
        return NextResponse.json({
          tvShow: {
            ...cachedTVShow,
            genres: cachedTVShow.genres.map((tvg) => tvg.genre),
          },
          cached: true,
        });
      }
    }

    // Fetch fresh data from TMDb
    let tmdbShow;
    try {
      const url = `${TMDB_API_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,seasons`;
      const response = await fetchWithRetry(url);

      // Handle 404 response
      if (!response.ok && response.status === 404) {
        // If we have cached data, return it even if stale
        if (cachedTVShow) {
          return NextResponse.json({
            tvShow: {
              ...cachedTVShow,
              genres: cachedTVShow.genres.map((tvg) => tvg.genre),
            },
            cached: true,
            stale: true,
          });
        }
        return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
      }

      tmdbShow = await response.json();

      if (!tmdbShow || tmdbShow.success === false) {
        // If we have cached data, return it even if stale
        if (cachedTVShow) {
          return NextResponse.json({
            tvShow: {
              ...cachedTVShow,
              genres: cachedTVShow.genres.map((tvg) => tvg.genre),
            },
            cached: true,
            stale: true,
          });
        }
        return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
      }
    } catch (fetchError) {
      console.error('TMDb fetch failed:', fetchError);

      // If we have ANY cached data, return it even if stale
      if (cachedTVShow) {
        return NextResponse.json({
          tvShow: {
            ...cachedTVShow,
            genres: cachedTVShow.genres.map((tvg) => tvg.genre),
          },
          cached: true,
          stale: true,
        });
      }

      // No cached data and fetch failed
      throw fetchError;
    }

    // Transform the response for immediate return
    const responseData = {
      id: cachedTVShow?.id, // Keep existing DB id if available
      tmdbId: tmdbShow.id,
      name: tmdbShow.name,
      overview: tmdbShow.overview,
      posterPath: tmdbShow.poster_path,
      backdropPath: tmdbShow.backdrop_path,
      firstAirDate: tmdbShow.first_air_date,
      lastAirDate: tmdbShow.last_air_date,
      voteAverage: tmdbShow.vote_average,
      voteCount: tmdbShow.vote_count,
      numberOfSeasons: tmdbShow.number_of_seasons,
      numberOfEpisodes: tmdbShow.number_of_episodes,
      episodeRunTime: tmdbShow.episode_run_time,
      genres: tmdbShow.genres || [],
      tagline: tmdbShow.tagline,
      homepage: tmdbShow.homepage,
      status: tmdbShow.status,
      type: tmdbShow.type,
      originalLanguage: tmdbShow.original_language,
      originalName: tmdbShow.original_name,
      popularity: tmdbShow.popularity,
      inProduction: tmdbShow.in_production,
      networks: tmdbShow.networks || [],
      createdBy: tmdbShow.created_by || [],
      seasons: tmdbShow.seasons || [],
      videos: tmdbShow.videos?.results || [],
      credits: tmdbShow.credits
        ? {
            cast: tmdbShow.credits.cast?.slice(0, 20) || [],
            crew: tmdbShow.credits.crew?.slice(0, 20) || [],
          }
        : null,
    };

    // Start background storage (don't await)
    storeTVShowDataInBackground(tmdbShow, tmdbId).catch((error) => {
      console.error('Background storage error:', error);
    });

    // Return immediately with fresh data
    return NextResponse.json({
      tvShow: responseData,
      cached: false,
    });
  } catch (error) {
    console.error('TV show detail fetch error:', error);

    // Try to get ANY cached data as last resort
    if (tmdbIdParam) {
      try {
        const cachedTVShow = await prisma.tVShow.findUnique({
          where: { tmdbId: parseInt(tmdbIdParam) },
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        });

        if (cachedTVShow) {
          return NextResponse.json({
            tvShow: {
              ...cachedTVShow,
              genres: cachedTVShow.genres.map((tvg) => tvg.genre),
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

    return NextResponse.json({ error: 'Failed to fetch TV show details' }, { status: 500 });
  }
}
