import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tmdbId = searchParams.get('tmdbId');
    const seasonNumber = searchParams.get('season');

    if (!tmdbId) {
      return NextResponse.json({ error: 'TV show ID is required' }, { status: 400 });
    }

    const tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    const whereClause = {
      userId: parseInt(session.user.id),
      episode: {
        tvShowId: tvShow.id,
        ...(seasonNumber && { seasonNumber: parseInt(seasonNumber) }),
      },
    };

    const userEpisodes = await prisma.userEpisode.findMany({
      where: whereClause,
      include: {
        episode: true,
      },
    });

    return NextResponse.json(userEpisodes);
  } catch (error) {
    console.error('Error fetching user episodes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, seasonNumber, episodeNumber, watched = true, rating } = body;
    const status = watched ? 'watched' : 'planned';

    if (!tmdbId || seasonNumber === undefined || episodeNumber === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the TV show or fetch it from API if it doesn't exist
    let tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      // Fetch TV show data from TMDB and save it
      const tmdbResponse = await fetch(
        `${process.env.TMDB_API_URL || 'https://api.themoviedb.org/3'}/tv/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`,
      );

      if (tmdbResponse.ok) {
        const tmdbData = await tmdbResponse.json();

        // Create the TV show in our database
        tvShow = await prisma.tVShow.create({
          data: {
            tmdbId: parseInt(tmdbId),
            name: tmdbData.name,
            originalName: tmdbData.original_name,
            overview: tmdbData.overview,
            posterPath: tmdbData.poster_path,
            backdropPath: tmdbData.backdrop_path,
            firstAirDate: tmdbData.first_air_date ? new Date(tmdbData.first_air_date) : null,
            lastAirDate: tmdbData.last_air_date ? new Date(tmdbData.last_air_date) : null,
            voteAverage: tmdbData.vote_average,
            voteCount: tmdbData.vote_count,
            numberOfSeasons: tmdbData.number_of_seasons,
            numberOfEpisodes: tmdbData.number_of_episodes,
            episodeRunTime: tmdbData.episode_run_time || [],
            inProduction: tmdbData.in_production || false,
            status: tmdbData.status,
            type: tmdbData.type,
            homepage: tmdbData.homepage,
            originalLanguage: tmdbData.original_language,
            popularity: tmdbData.popularity,
            tagline: tmdbData.tagline,
          },
        });
      }

      if (!tvShow) {
        return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
      }
    }

    // Find or create the episode
    let episode = await prisma.episode.findUnique({
      where: {
        tvShowId_seasonNumber_episodeNumber: {
          tvShowId: tvShow.id,
          seasonNumber: parseInt(seasonNumber),
          episodeNumber: parseInt(episodeNumber),
        },
      },
    });

    if (!episode) {
      // Fetch season data from TMDB API
      const seasonResponse = await fetch(
        `${process.env.TMDB_API_URL || 'https://api.themoviedb.org/3'}/tv/${tmdbId}/season/${seasonNumber}?api_key=${process.env.TMDB_API_KEY}`,
      );

      if (seasonResponse.ok) {
        const seasonData = await seasonResponse.json();

        // Find the season or create it
        let season = await prisma.season.findUnique({
          where: {
            tvShowId_seasonNumber: {
              tvShowId: tvShow.id,
              seasonNumber: parseInt(seasonNumber),
            },
          },
        });

        if (!season) {
          season = await prisma.season.create({
            data: {
              tvShowId: tvShow.id,
              seasonNumber: parseInt(seasonNumber),
              name: seasonData.name,
              overview: seasonData.overview,
              posterPath: seasonData.poster_path,
              airDate: seasonData.air_date ? new Date(seasonData.air_date) : null,
              episodeCount: seasonData.episodes?.length || 0,
            },
          });
        }

        // Find the specific episode in the season data
        const episodeData = seasonData.episodes?.find(
          (ep: { episode_number: number }) => ep.episode_number === parseInt(episodeNumber),
        );

        if (episodeData) {
          // Create the episode
          episode = await prisma.episode.create({
            data: {
              tvShowId: tvShow.id,
              seasonId: season.id,
              seasonNumber: parseInt(seasonNumber),
              episodeNumber: parseInt(episodeNumber),
              name: episodeData.name,
              overview: episodeData.overview,
              stillPath: episodeData.still_path,
              airDate: episodeData.air_date ? new Date(episodeData.air_date) : null,
              runtime: episodeData.runtime,
              voteAverage: episodeData.vote_average,
              voteCount: episodeData.vote_count,
              productionCode: episodeData.production_code,
            },
          });
        }
      }

      if (!episode) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
      }
    }

    // Check if user episode exists
    const existingUserEpisode = await prisma.userEpisode.findUnique({
      where: {
        userId_episodeId: {
          userId: parseInt(session.user.id),
          episodeId: episode.id,
        },
      },
    });

    if (existingUserEpisode) {
      // Update existing
      const updated = await prisma.userEpisode.update({
        where: {
          userId_episodeId: {
            userId: parseInt(session.user.id),
            episodeId: episode.id,
          },
        },
        data: {
          status,
          ...(watched && { watchedAt: new Date() }),
          ...(rating !== undefined && { rating }),
        },
      });

      // Update UserTVShow progress
      await updateTVShowProgress(parseInt(session.user.id), tvShow.id);

      return NextResponse.json({
        message: 'Episode updated',
        userEpisode: updated,
      });
    }

    // Create new user episode
    const userEpisode = await prisma.userEpisode.create({
      data: {
        userId: parseInt(session.user.id),
        episodeId: episode.id,
        status,
        ...(watched && { watchedAt: new Date() }),
        ...(rating !== undefined && { rating }),
      },
    });

    // Update UserTVShow progress
    await updateTVShowProgress(parseInt(session.user.id), tvShow.id);

    return NextResponse.json({
      message: 'Episode tracked',
      userEpisode,
    });
  } catch (error) {
    console.error('Error tracking episode:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function updateTVShowProgress(userId: number, tvShowId: number) {
  // Get all watched episodes for this show
  const watchedEpisodes = await prisma.userEpisode.findMany({
    where: {
      userId,
      status: 'watched',
      episode: {
        tvShowId,
      },
    },
    include: {
      episode: true,
    },
    orderBy: [{ episode: { seasonNumber: 'desc' } }, { episode: { episodeNumber: 'desc' } }],
  });

  if (watchedEpisodes.length === 0) return;

  // const latestEpisode = watchedEpisodes[0].episode;

  // Check if user has a TV show entry
  const userTVShow = await prisma.userTVShow.findUnique({
    where: {
      userId_tvShowId: {
        userId,
        tvShowId,
      },
    },
  });

  if (!userTVShow) {
    // Create one if it doesn't exist
    await prisma.userTVShow.create({
      data: {
        userId,
        tvShowId,
        status: 'WATCHING',
        startedAt: new Date(),
      },
    });
  } else {
    // Update progress
    const tvShow = await prisma.tVShow.findUnique({
      where: { id: tvShowId },
    });

    const totalEpisodes = tvShow?.numberOfEpisodes || 0;
    const isCompleted = watchedEpisodes.length === totalEpisodes;

    await prisma.userTVShow.update({
      where: {
        userId_tvShowId: {
          userId,
          tvShowId,
        },
      },
      data: {
        ...(isCompleted && {
          status: 'COMPLETED',
          completedAt: new Date(),
        }),
        ...(userTVShow.status === 'WATCHLIST' && {
          status: 'WATCHING',
          startedAt: new Date(),
        }),
      },
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tmdbId = searchParams.get('tmdbId');
    const seasonNumber = searchParams.get('season');
    const episodeNumber = searchParams.get('episode');

    if (!tmdbId || seasonNumber === null || episodeNumber === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tvShow = await prisma.tVShow.findUnique({
      where: { tmdbId: parseInt(tmdbId) },
    });

    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    const episode = await prisma.episode.findUnique({
      where: {
        tvShowId_seasonNumber_episodeNumber: {
          tvShowId: tvShow.id,
          seasonNumber: parseInt(seasonNumber),
          episodeNumber: parseInt(episodeNumber),
        },
      },
    });

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    await prisma.userEpisode.delete({
      where: {
        userId_episodeId: {
          userId: parseInt(session.user.id),
          episodeId: episode.id,
        },
      },
    });

    // Update TV show progress
    await updateTVShowProgress(parseInt(session.user.id), tvShow.id);

    return NextResponse.json({ message: 'Episode tracking removed' });
  } catch (error) {
    console.error('Error removing episode tracking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
