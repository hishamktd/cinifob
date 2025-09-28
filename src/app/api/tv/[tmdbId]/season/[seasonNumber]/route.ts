import { NextResponse } from 'next/server';
import { TMDBSeason, TMDBEpisode } from '@/types/tmdb';
import prisma from '@/lib/prisma';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (response.ok) {
        return response;
      }

      if (response.status !== 429 && response.status < 500) {
        throw new Error(`TMDb API error: ${response.status}`);
      }

      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Failed after all retries');
}

async function storeSeasonData(tmdbId: number, seasonData: TMDBSeason) {
  try {
    // First ensure the TV show exists
    const tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId },
    });

    if (!tvShow) {
      // Fetch and store the TV show first
      const tvResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tv/${tmdbId}`,
      );
      if (!tvResponse.ok) {
        console.error('Failed to fetch TV show for season storage');
        return;
      }
    }

    // Find the TV show again
    const existingTvShow = await prisma.tVShow.findUnique({
      where: { tmdbId },
    });

    if (!existingTvShow) {
      console.error('TV show still not found after fetch');
      return;
    }

    // Store or update the season
    await prisma.season.upsert({
      where: {
        tvShowId_seasonNumber: {
          tvShowId: existingTvShow.id,
          seasonNumber: seasonData.season_number,
        },
      },
      update: {
        name: seasonData.name,
        overview: seasonData.overview || null,
        posterPath: seasonData.poster_path || null,
        airDate: seasonData.air_date ? new Date(seasonData.air_date) : null,
        episodeCount: seasonData.episodes?.length || 0,
      },
      create: {
        tvShowId: existingTvShow.id,
        seasonNumber: seasonData.season_number,
        name: seasonData.name,
        overview: seasonData.overview || null,
        posterPath: seasonData.poster_path || null,
        airDate: seasonData.air_date ? new Date(seasonData.air_date) : null,
        episodeCount: seasonData.episodes?.length || 0,
      },
    });

    // Store episodes
    if (seasonData.episodes && seasonData.episodes.length > 0) {
      const season = await prisma.season.findUnique({
        where: {
          tvShowId_seasonNumber: {
            tvShowId: existingTvShow.id,
            seasonNumber: seasonData.season_number,
          },
        },
      });

      if (season) {
        for (const episode of seasonData.episodes) {
          await prisma.episode.upsert({
            where: {
              tvShowId_seasonNumber_episodeNumber: {
                tvShowId: existingTvShow.id,
                seasonNumber: seasonData.season_number,
                episodeNumber: episode.episode_number,
              },
            },
            update: {
              name: episode.name,
              overview: episode.overview || null,
              stillPath: episode.still_path || null,
              airDate: episode.air_date ? new Date(episode.air_date) : null,
              runtime: episode.runtime || null,
              voteAverage: episode.vote_average || null,
              voteCount: episode.vote_count || null,
              productionCode: episode.production_code || null,
              seasonId: season.id,
            },
            create: {
              tvShowId: existingTvShow.id,
              seasonId: season.id,
              seasonNumber: seasonData.season_number,
              episodeNumber: episode.episode_number,
              name: episode.name,
              overview: episode.overview || null,
              stillPath: episode.still_path || null,
              airDate: episode.air_date ? new Date(episode.air_date) : null,
              runtime: episode.runtime || null,
              voteAverage: episode.vote_average || null,
              voteCount: episode.vote_count || null,
              productionCode: episode.production_code || null,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error storing season data:', error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tmdbId: string; seasonNumber: string }> },
) {
  try {
    const resolvedParams = await params;
    const tmdbId = parseInt(resolvedParams.tmdbId);
    const seasonNumber = parseInt(resolvedParams.seasonNumber);

    if (isNaN(tmdbId) || isNaN(seasonNumber)) {
      return NextResponse.json({ error: 'Invalid TV show or season ID' }, { status: 400 });
    }

    // Fetch season details with episodes
    const url = `${TMDB_API_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
    const response = await fetchWithRetry(url);
    const data: TMDBSeason = await response.json();

    if (!data || data.success === false) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    // Store season and episodes in database
    await storeSeasonData(tmdbId, data);

    // Transform the response
    const season = {
      id: data.id,
      name: data.name,
      overview: data.overview,
      posterPath: data.poster_path,
      seasonNumber: data.season_number,
      airDate: data.air_date,
      episodes:
        data.episodes?.map((episode: TMDBEpisode) => ({
          id: episode.id,
          name: episode.name,
          overview: episode.overview,
          episode_number: episode.episode_number,
          season_number: episode.season_number,
          air_date: episode.air_date,
          runtime: episode.runtime,
          still_path: episode.still_path,
          vote_average: episode.vote_average,
          vote_count: episode.vote_count,
          crew: episode.crew || [],
          guest_stars: episode.guest_stars || [],
        })) || [],
    };

    return NextResponse.json({
      season,
      episodes: season.episodes,
      cached: false,
    });
  } catch (error) {
    console.error('Season detail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch season details' }, { status: 500 });
  }
}
