import { NextRequest, NextResponse } from 'next/server';

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
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const { type, id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const relationType = searchParams.get('relationType') || 'both'; // 'similar', 'recommendations', 'both'

    if (type !== 'movie' && type !== 'tv') {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const contentId = parseInt(id);
    if (isNaN(contentId)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }

    let allResults: any[] = [];
    let totalPages = 1;
    let totalResults = 0;

    // Fetch similar content
    if (relationType === 'similar' || relationType === 'both') {
      const similarUrl = `${TMDB_API_BASE_URL}/${type}/${contentId}/similar?api_key=${TMDB_API_KEY}&page=${page}`;
      const similarResponse = await fetchWithRetry(similarUrl);
      const similarData = await similarResponse.json();

      if (similarData.results) {
        const similarWithType = similarData.results.map((item: any) => ({
          ...item,
          media_type: type,
          title: type === 'tv' ? item.name : item.title,
          date: type === 'tv' ? item.first_air_date : item.release_date,
          relation_type: 'similar',
        }));
        allResults = [...allResults, ...similarWithType];
        totalPages = Math.max(totalPages, similarData.total_pages);
        totalResults += similarData.total_results;
      }
    }

    // Fetch recommendations
    if (relationType === 'recommendations' || relationType === 'both') {
      const recommendationsUrl = `${TMDB_API_BASE_URL}/${type}/${contentId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}`;
      const recommendationsResponse = await fetchWithRetry(recommendationsUrl);
      const recommendationsData = await recommendationsResponse.json();

      if (recommendationsData.results) {
        const recommendationsWithType = recommendationsData.results.map((item: any) => ({
          ...item,
          media_type: type,
          title: type === 'tv' ? item.name : item.title,
          date: type === 'tv' ? item.first_air_date : item.release_date,
          relation_type: 'recommendation',
        }));
        allResults = [...allResults, ...recommendationsWithType];
        totalPages = Math.max(totalPages, recommendationsData.total_pages);
        totalResults += recommendationsData.total_results;
      }
    }

    // Remove duplicates if fetching both
    if (relationType === 'both') {
      const uniqueResults = new Map();
      allResults.forEach((item) => {
        if (!uniqueResults.has(item.id)) {
          uniqueResults.set(item.id, item);
        }
      });
      allResults = Array.from(uniqueResults.values());
    }

    // Sort by popularity
    allResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    // Transform results to consistent format
    const transformedResults = allResults.map((item: any) => ({
      id: item.id,
      tmdbId: item.id,
      mediaType: item.media_type,
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      date: item.date,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      popularity: item.popularity,
      genreIds: item.genre_ids || [],
      relationType: item.relation_type,
    }));

    return NextResponse.json({
      results: transformedResults,
      page,
      totalPages: Math.min(totalPages, 500),
      totalResults,
    });
  } catch (error) {
    console.error('Related content API error:', error);
    return NextResponse.json({ error: 'Failed to fetch related content' }, { status: 500 });
  }
}
