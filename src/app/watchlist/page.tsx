'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';

import UnifiedWatchlistPageView from '@/views/watchlist/unified';
import { UserMovie, UserTVShow, ContentItem } from '@/types';
import { MainLayout } from '@core/components/layout';
import { useToast } from '@/hooks/useToast';
import { ContentLoadingPage } from '@/components/content-loading';

const WatchlistPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [tvShows, setTVShows] = useState<UserTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<'all' | 'movies' | 'tv'>('all');
  const [sortBy, setSortBy] = useState('date_added');
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    item: UserMovie | UserTVShow | null;
    rating: number | null;
    watchedDate: Dayjs;
    mediaType: 'movie' | 'tv';
  }>({
    open: false,
    item: null,
    rating: null,
    watchedDate: dayjs(),
    mediaType: 'movie',
  });

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    fetchWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch movies watchlist
      const moviesRes = await fetch('/api/user/watchlist');
      if (moviesRes.ok) {
        const moviesData = await moviesRes.json();
        setMovies(Array.isArray(moviesData.watchlist) ? moviesData.watchlist : []);
      }

      // Fetch TV shows watchlist
      const tvRes = await fetch('/api/user/tv/watchlist');
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        setTVShows(Array.isArray(tvData) ? tvData : []);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      showToast('Failed to load watchlist', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleRemoveFromWatchlist = async (tmdbId: number, mediaType: 'movie' | 'tv') => {
    try {
      const endpoint =
        mediaType === 'movie'
          ? `/api/user/watchlist?tmdbId=${tmdbId}`
          : `/api/user/tv/watchlist?tmdbId=${tmdbId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (mediaType === 'movie') {
          setMovies(movies.filter((m) => m.movie?.tmdbId !== tmdbId));
        } else {
          setTVShows(tvShows.filter((s) => s.tvShow?.tmdbId !== tmdbId));
        }
        showToast(`Removed from watchlist`, 'success');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      showToast('Failed to remove from watchlist', 'error');
    }
  };

  const handleMarkAsWatched = (item: UserMovie | UserTVShow, mediaType: 'movie' | 'tv') => {
    setRatingDialog({
      open: true,
      item,
      rating: null,
      watchedDate: dayjs(),
      mediaType,
    });
  };

  const handleSaveWatched = async () => {
    if (!ratingDialog.item) return;

    try {
      if (ratingDialog.mediaType === 'movie') {
        const movie = (ratingDialog.item as UserMovie).movie;
        if (!movie) return;

        const response = await fetch('/api/user/watched', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...movie,
            rating: ratingDialog.rating,
            watchedDate: ratingDialog.watchedDate.toISOString(),
          }),
        });

        if (response.ok) {
          setMovies(movies.filter((m) => m.movie?.tmdbId !== movie.tmdbId));
          showToast('Marked as watched', 'success');
        }
      } else {
        const tvShow = (ratingDialog.item as UserTVShow).tvShow;
        if (!tvShow) return;

        const response = await fetch('/api/user/tv/watching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...tvShow,
            currentSeason: 1,
            currentEpisode: 1,
          }),
        });

        if (response.ok) {
          setTVShows(tvShows.filter((s) => s.tvShow?.tmdbId !== tvShow.tmdbId));
          showToast('Started watching', 'success');
          router.push(`/tv/${tvShow.tmdbId}`);
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleCloseDialog = () => {
    setRatingDialog({
      open: false,
      item: null,
      rating: null,
      watchedDate: dayjs(),
      mediaType: 'movie',
    });
  };

  const sortedContent = useMemo(() => {
    let content: ContentItem[] = [];

    // Convert to ContentItem format
    if (contentType === 'all' || contentType === 'movies') {
      const movieItems: ContentItem[] = (Array.isArray(movies) ? movies : []).map((m) => ({
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
        _createdAt: m.createdAt,
      }));
      content = [...content, ...movieItems];
    }

    if (contentType === 'all' || contentType === 'tv') {
      const tvItems: ContentItem[] = (Array.isArray(tvShows) ? tvShows : []).map((s) => ({
        id: s.tvShow?.id || 0,
        tmdbId: s.tvShow?.tmdbId || 0,
        mediaType: 'tv' as const,
        title: s.tvShow?.name || 'Unknown',
        name: s.tvShow?.name,
        overview: s.tvShow?.overview,
        posterPath: s.tvShow?.posterPath,
        backdropPath: s.tvShow?.backdropPath,
        date: s.tvShow?.firstAirDate?.toString(),
        voteAverage: s.tvShow?.voteAverage,
        voteCount: s.tvShow?.voteCount,
        popularity: s.tvShow?.popularity,
        numberOfSeasons: s.tvShow?.numberOfSeasons,
        numberOfEpisodes: s.tvShow?.numberOfEpisodes,
        genres: s.tvShow?.genres,
        _createdAt: s.createdAt,
      }));
      content = [...content, ...tvItems];
    }

    // Sort content
    return content.sort((a, b) => {
      switch (sortBy) {
        case 'date_added':
          return (
            new Date(b._createdAt as string).getTime() - new Date(a._createdAt as string).getTime()
          );
        case 'title':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'release_date':
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case 'rating':
          return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'type':
          return a.mediaType.localeCompare(b.mediaType);
        default:
          return 0;
      }
    });
  }, [movies, tvShows, contentType, sortBy]);

  if (loading) {
    return (
      <MainLayout>
        <ContentLoadingPage type="watchlist" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <UnifiedWatchlistPageView
        movies={movies}
        tvShows={tvShows}
        sortBy={sortBy}
        contentType={contentType}
        sortedContent={sortedContent}
        ratingDialog={ratingDialog}
        onContentTypeChange={setContentType}
        onSortChange={setSortBy}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onMarkAsWatched={handleMarkAsWatched}
        onRatingChange={(rating) => setRatingDialog({ ...ratingDialog, rating })}
        onDateChange={(date) => setRatingDialog({ ...ratingDialog, watchedDate: date || dayjs() })}
        onSaveWatched={handleSaveWatched}
        onCloseDialog={handleCloseDialog}
      />
    </MainLayout>
  );
};

export default WatchlistPage;
