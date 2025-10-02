'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { MainLayout } from '@core/components';
import WatchedPageView from '@/views/watched';
import { useToast } from '@/hooks/useToast';
import { movieService } from '@/services/movie.service';
import { tvShowService } from '@/services/tvshow.service';
import { MovieSortBy } from '@core/enums';
import { UserMovie, UserTVShow, ContentItem } from '@/types';
import { ContentLoadingPage } from '@/components/content-loading';

export default function WatchedPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [tvShows, setTVShows] = useState<UserTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<'all' | 'movies' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<MovieSortBy>(MovieSortBy.RECENTLY_WATCHED);
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalRuntime: 0,
    averageRating: 0,
    highestRated: null as UserMovie | UserTVShow | null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchWatchedContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchWatchedContent = async () => {
    try {
      // Fetch watched movies
      const moviesResponse = await movieService.getWatchedMovies();
      setMovies(moviesResponse.watched);

      // Fetch completed TV shows
      const tvResponse = await tvShowService.getCompletedShows();
      setTVShows(Array.isArray(tvResponse) ? tvResponse : []);

      calculateStats(moviesResponse.watched, Array.isArray(tvResponse) ? tvResponse : []);
    } catch {
      showToast('Failed to load watched content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = useCallback((watchedMovies: UserMovie[], completedShows: UserTVShow[]) => {
    const allContent = [...watchedMovies, ...completedShows];
    if (allContent.length === 0) return;

    const totalRuntime = watchedMovies.reduce((sum, m) => sum + (m.movie?.runtime || 0), 0);
    const ratedContent = allContent.filter((item) => item.rating);
    const averageRating =
      ratedContent.length > 0
        ? ratedContent.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedContent.length
        : 0;
    const highestRated =
      ratedContent.length > 0
        ? ratedContent.reduce(
            (max, item) => ((item.rating || 0) > (max?.rating || 0) ? item : max),
            ratedContent[0],
          )
        : null;

    setStats({
      totalWatched: allContent.length,
      totalRuntime,
      averageRating,
      highestRated,
    });
  }, []);

  const handleRemoveFromWatched = useCallback(
    async (tmdbId: number, mediaType: 'movie' | 'tv') => {
      try {
        if (mediaType === 'movie') {
          await movieService.removeFromWatched(tmdbId);
          const updatedMovies = movies.filter((m) => m.movie?.tmdbId !== tmdbId);
          setMovies(updatedMovies);
          calculateStats(updatedMovies, tvShows);
        } else {
          // For TV shows, move back to watching or remove entirely
          const response = await fetch(`/api/user/tv/status?tmdbId=${tmdbId}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            const updatedShows = tvShows.filter((s) => s.tvShow?.tmdbId !== tmdbId);
            setTVShows(updatedShows);
            calculateStats(movies, updatedShows);
          }
        }
        showToast('Marked as unwatched', 'success');
      } catch {
        showToast('Failed to remove from watched content', 'error');
      }
    },
    [movies, tvShows, calculateStats, showToast],
  );

  const handleAddToWatchlist = useCallback(
    async (item: ContentItem) => {
      try {
        if (item.mediaType === 'movie') {
          const movie = movies.find((m) => m.movie?.tmdbId === item.tmdbId)?.movie;
          if (movie) {
            await movieService.addToWatchlist(movie);
          }
        } else {
          const tvShow = tvShows.find((s) => s.tvShow?.tmdbId === item.tmdbId)?.tvShow;
          if (tvShow) {
            const response = await fetch('/api/user/tv/watchlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tvShow),
            });
            if (!response.ok) throw new Error();
          }
        }
        showToast('Added to watchlist', 'success');
      } catch {
        showToast('Failed to add to watchlist', 'error');
      }
    },
    [movies, tvShows, showToast],
  );

  const sortContent = useCallback(
    (content: ContentItem[]) => {
      const sorted = [...content];
      switch (sortBy) {
        case MovieSortBy.RECENTLY_WATCHED:
          return sorted.sort((a, b) => {
            const dateA = a._completedAt ? new Date(a._completedAt).getTime() : 0;
            const dateB = b._completedAt ? new Date(b._completedAt).getTime() : 0;
            return dateB - dateA;
          });
        case MovieSortBy.DATE_ADDED:
          return sorted.sort(
            (a, b) => new Date(b._updatedAt || 0).getTime() - new Date(a._updatedAt || 0).getTime(),
          );
        case MovieSortBy.TITLE:
          return sorted.sort((a, b) =>
            (a.title || a.name || '').localeCompare(b.title || b.name || ''),
          );
        case MovieSortBy.RELEASE_DATE:
          return sorted.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
        case MovieSortBy.RATING:
          return sorted.sort((a, b) => (b._rating || 0) - (a._rating || 0));
        default:
          return sorted;
      }
    },
    [sortBy],
  );

  const formatRuntime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${minutes % 60}m`;
  }, []);

  // Convert to ContentItem format and combine
  const sortedContent = useMemo(() => {
    let content: ContentItem[] = [];

    if (contentType === 'all' || contentType === 'movies') {
      const movieItems: ContentItem[] = movies.map((m) => ({
        id: m.movie?.id || 0,
        tmdbId: m.movie?.tmdbId || 0,
        mediaType: 'movie' as const,
        title: m.movie?.title || 'Unknown',
        overview: m.movie?.overview,
        posterPath: m.movie?.posterPath,
        backdropPath: m.movie?.backdropPath,
        date: m.movie?.releaseDate?.toString(),
        voteAverage: m.movie?.voteAverage,
        voteCount: m.movie?.voteCount,
        popularity: m.movie?.popularity,
        runtime: m.movie?.runtime,
        genres: m.movie?.genres,
        _rating: m.rating,
        _completedAt: m.watchedAt?.toString(),
        _updatedAt: m.updatedAt.toString(),
      }));
      content = [...content, ...movieItems];
    }

    if (contentType === 'all' || contentType === 'tv') {
      const tvItems: ContentItem[] = tvShows.map((s) => ({
        id: s.tvShow?.id || 0,
        tmdbId: s.tvShow?.tmdbId || 0,
        mediaType: 'tv' as const,
        title: s.tvShow?.name || 'Unknown',
        name: s.tvShow?.name,
        overview: s.tvShow?.overview ?? undefined,
        posterPath: s.tvShow?.posterPath,
        backdropPath: s.tvShow?.backdropPath,
        date: s.tvShow?.firstAirDate?.toString(),
        voteAverage: s.tvShow?.voteAverage,
        voteCount: s.tvShow?.voteCount,
        popularity: s.tvShow?.popularity,
        numberOfSeasons: s.tvShow?.numberOfSeasons,
        numberOfEpisodes: s.tvShow?.numberOfEpisodes,
        genres: s.tvShow?.genres,
        _rating: s.rating,
        _completedAt: s.completedAt?.toString(),
        _updatedAt: s.updatedAt.toString(),
      }));
      content = [...content, ...tvItems];
    }

    return sortContent(content);
  }, [movies, tvShows, contentType, sortContent]);

  if (loading) {
    return (
      <MainLayout>
        <ContentLoadingPage type="watched" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <WatchedPageView
        movies={movies}
        tvShows={tvShows}
        stats={stats}
        sortBy={sortBy}
        contentType={contentType}
        sortedContent={sortedContent}
        onContentTypeChange={setContentType}
        onSortChange={setSortBy}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatched={handleRemoveFromWatched}
        formatRuntime={formatRuntime}
      />
    </MainLayout>
  );
}
