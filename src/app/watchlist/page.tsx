'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';

import { Container } from '@mui/material';

import { AppLoader, MainLayout } from '@core/components';
import WatchlistPageView from '@/views/watchlist';
import { useToast } from '@/hooks/useToast';
import { movieService } from '@/services/movie.service';
import { MovieSortBy } from '@core/enums';
import { UserMovie } from '@/types';

export default function WatchlistPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<MovieSortBy>(MovieSortBy.DATE_ADDED);
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    movie: UserMovie | null;
    rating: number | null;
    watchedDate: Dayjs;
  }>({ open: false, movie: null, rating: null, watchedDate: dayjs() });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchWatchlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchWatchlist = async () => {
    try {
      const response = await movieService.getWatchlist();
      setMovies(response.watchlist);
    } catch {
      showToast('Failed to load watchlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = useCallback(
    async (tmdbId: number) => {
      try {
        await movieService.removeFromWatchlist(tmdbId);
        setMovies(movies.filter((m) => m.movie?.tmdbId !== tmdbId));
        showToast('Removed from watchlist', 'success');
      } catch {
        showToast('Failed to remove from watchlist', 'error');
      }
    },
    [movies, showToast],
  );

  const handleMarkAsWatched = useCallback((movie: UserMovie) => {
    setRatingDialog({ open: true, movie, rating: null, watchedDate: dayjs() });
  }, []);

  const handleSaveWatched = useCallback(async () => {
    if (!ratingDialog.movie) return;

    try {
      await movieService.markAsWatched(
        ratingDialog.movie.movie || {},
        ratingDialog.rating || undefined,
        undefined,
        ratingDialog.watchedDate.toDate(),
      );
      setMovies(movies.filter((m) => m.movie?.tmdbId !== ratingDialog.movie?.movie?.tmdbId));
      showToast('Marked as watched', 'success');
      setRatingDialog({ open: false, movie: null, rating: null, watchedDate: dayjs() });
    } catch {
      showToast('Failed to mark as watched', 'error');
    }
  }, [ratingDialog.movie, ratingDialog.rating, ratingDialog.watchedDate, movies, showToast]);

  const sortMovies = useCallback(
    (movies: UserMovie[]) => {
      const sorted = [...movies];
      switch (sortBy) {
        case MovieSortBy.DATE_ADDED:
          return sorted.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
        case MovieSortBy.TITLE:
          return sorted.sort((a, b) => (a.movie?.title || '').localeCompare(b.movie?.title || ''));
        case MovieSortBy.RELEASE_DATE:
          return sorted.sort((a, b) => {
            const dateA = a.movie?.releaseDate ? new Date(a.movie.releaseDate).getTime() : 0;
            const dateB = b.movie?.releaseDate ? new Date(b.movie.releaseDate).getTime() : 0;
            return dateB - dateA;
          });
        case MovieSortBy.RATING:
          return sorted.sort((a, b) => (b?.movie?.voteAverage || 0) - (a?.movie?.voteAverage || 0));
        default:
          return sorted;
      }
    },
    [sortBy],
  );

  const sortedMovies = useMemo(() => sortMovies(movies), [sortMovies, movies]);

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <AppLoader type="circular" message="Loading watchlist..." />
        </Container>
      </MainLayout>
    );
  }

  const handleRatingChange = (rating: number | null) => {
    setRatingDialog((prev) => ({ ...prev, rating }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setRatingDialog((prev) => ({ ...prev, watchedDate: date }));
    }
  };

  const handleCloseDialog = () => {
    setRatingDialog({ open: false, movie: null, rating: null, watchedDate: dayjs() });
  };

  return (
    <MainLayout>
      <WatchlistPageView
        movies={movies}
        sortBy={sortBy}
        sortedMovies={sortedMovies}
        ratingDialog={ratingDialog}
        onSortChange={setSortBy}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onMarkAsWatched={handleMarkAsWatched}
        onRatingChange={handleRatingChange}
        onDateChange={handleDateChange}
        onSaveWatched={handleSaveWatched}
        onCloseDialog={handleCloseDialog}
      />
    </MainLayout>
  );
}
