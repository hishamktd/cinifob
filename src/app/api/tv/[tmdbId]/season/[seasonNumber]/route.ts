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
    const data = await response.json();

    if (!data || data.success === false) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    // Transform the response
    const season = {
      id: data.id,
      name: data.name,
      overview: data.overview,
      posterPath: data.poster_path,
      seasonNumber: data.season_number,
      airDate: data.air_date,
      episodes:
        data.episodes?.map((episode: any) => ({
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
