import { NextResponse } from 'next/server';

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

export async function GET(_request: Request, { params }: { params: Promise<{ tmdbId: string }> }) {
  try {
    const resolvedParams = await params;
    const tmdbId = parseInt(resolvedParams.tmdbId);

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid TV show ID' }, { status: 400 });
    }

    // Fetch TV show details with additional information
    const url = `${TMDB_API_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,seasons`;
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!data || data.success === false) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 });
    }

    // Transform the response
    const tvShow = {
      id: data.id,
      tmdbId: data.id,
      name: data.name,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      firstAirDate: data.first_air_date,
      lastAirDate: data.last_air_date,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      numberOfSeasons: data.number_of_seasons,
      numberOfEpisodes: data.number_of_episodes,
      episodeRunTime: data.episode_run_time,
      genres: data.genres || [],
      tagline: data.tagline,
      homepage: data.homepage,
      status: data.status,
      type: data.type,
      originalLanguage: data.original_language,
      originalName: data.original_name,
      popularity: data.popularity,
      inProduction: data.in_production,
      networks: data.networks || [],
      createdBy: data.created_by || [],
      seasons: data.seasons || [],
      videos: data.videos?.results || [],
      credits: data.credits
        ? {
            cast: data.credits.cast?.slice(0, 20) || [],
            crew: data.credits.crew?.slice(0, 20) || [],
          }
        : null,
    };

    return NextResponse.json({
      tvShow,
      cached: false,
    });
  } catch (error) {
    console.error('TV show detail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch TV show details' }, { status: 500 });
  }
}
