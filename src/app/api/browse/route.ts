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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const mediaType = searchParams.get('type') || 'all'; // 'all', 'movie', 'tv'
    const sortBy = searchParams.get('sort') || 'popular'; // 'popular', 'trending', 'top_rated', 'now_playing', 'on_the_air'
    const genre = searchParams.get('genre'); // Genre ID

    let results = [];
    let totalPages = 1;
    let totalResults = 0;

    if (query) {
      // Search mode
      if (mediaType === 'all' || mediaType === 'movie') {
        const movieUrl = `${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query,
        )}&page=${page}`;
        const movieResponse = await fetchWithRetry(movieUrl);
        const movieData = await movieResponse.json();

        const movies = movieData.results.map((item: any) => ({
          ...item,
          media_type: 'movie',
          title: item.title,
          date: item.release_date,
        }));

        if (mediaType === 'movie') {
          results = movies;
          totalPages = movieData.total_pages;
          totalResults = movieData.total_results;
        } else {
          results = [...results, ...movies];
        }
      }

      if (mediaType === 'all' || mediaType === 'tv') {
        const tvUrl = `${TMDB_API_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query,
        )}&page=${page}`;
        const tvResponse = await fetchWithRetry(tvUrl);
        const tvData = await tvResponse.json();

        const tvShows = tvData.results.map((item: any) => ({
          ...item,
          media_type: 'tv',
          title: item.name,
          date: item.first_air_date,
        }));

        if (mediaType === 'tv') {
          results = tvShows;
          totalPages = tvData.total_pages;
          totalResults = tvData.total_results;
        } else {
          results = [...results, ...tvShows];
          totalPages = Math.max(totalPages, tvData.total_pages);
          totalResults += tvData.total_results;
        }
      }

      // Sort combined results by popularity
      if (mediaType === 'all') {
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      }
    } else {
      // Browse mode
      let url = '';

      if (mediaType === 'tv') {
        // TV endpoints
        switch (sortBy) {
          case 'trending':
            url = `${TMDB_API_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'top_rated':
            url = `${TMDB_API_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'on_the_air':
            url = `${TMDB_API_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'airing_today':
            url = `${TMDB_API_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          default: // popular
            url = `${TMDB_API_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`;
        }
      } else if (mediaType === 'movie') {
        // Movie endpoints
        switch (sortBy) {
          case 'trending':
            url = `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'top_rated':
            url = `${TMDB_API_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'now_playing':
            url = `${TMDB_API_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'upcoming':
            url = `${TMDB_API_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          default: // popular
            url = `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
        }
      } else {
        // All - fetch both and combine based on sort type
        let movieUrl = '';
        let tvUrl = '';

        switch (sortBy) {
          case 'trending':
            movieUrl = `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`;
            tvUrl = `${TMDB_API_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'top_rated':
            movieUrl = `${TMDB_API_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
            tvUrl = `${TMDB_API_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
          case 'popular':
          default:
            movieUrl = `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
            tvUrl = `${TMDB_API_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`;
            break;
        }

        const [movieResponse, tvResponse] = await Promise.all([
          fetchWithRetry(movieUrl),
          fetchWithRetry(tvUrl),
        ]);

        const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);

        const movies = movieData.results.map((item: any) => ({
          ...item,
          media_type: 'movie',
          title: item.title,
          date: item.release_date,
        }));

        const tvShows = tvData.results.map((item: any) => ({
          ...item,
          media_type: 'tv',
          title: item.name,
          date: item.first_air_date,
        }));

        results = [...movies, ...tvShows];
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        totalPages = Math.max(movieData.total_pages, tvData.total_pages);
        totalResults = movieData.total_results + tvData.total_results;
      }

      // Handle single type request (movie or tv only)
      if (url) {
        const response = await fetchWithRetry(url);
        const data = await response.json();

        results = data.results.map((item: any) => ({
          ...item,
          media_type: mediaType,
          title: mediaType === 'tv' ? item.name : item.title,
          date: mediaType === 'tv' ? item.first_air_date : item.release_date,
        }));

        totalPages = data.total_pages;
        totalResults = data.total_results;
      }
    }

    // Filter by genre if specified
    if (genre && results.length > 0) {
      const genreId = parseInt(genre);
      results = results.filter((item: any) => item.genre_ids && item.genre_ids.includes(genreId));
    }

    // Transform results to consistent format
    const transformedResults = results.map((item: any) => ({
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
    }));

    return NextResponse.json({
      results: transformedResults,
      page,
      totalPages: Math.min(totalPages, 500),
      totalResults,
    });
  } catch (error) {
    console.error('Browse API error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
