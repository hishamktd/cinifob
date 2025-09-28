'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dayjs } from 'dayjs';

import { Container } from '@mui/material';

import { AppLoader, MainLayout } from '@core/components';
import WatchedPageView from '@/views/watched';
import { useToast } from '@/hooks/useToast';
import { movieService } from '@/services/movie.service';
import { MovieSortBy } from '@core/enums';
import { UserMovie } from '@/types';

export default function WatchedPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<MovieSortBy>(MovieSortBy.RECENTLY_WATCHED);
  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalRuntime: 0,
    averageRating: 0,
    highestRated: null as UserMovie | null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchWatchedMovies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchWatchedMovies = async () => {
    try {
      const response = await movieService.getWatchedMovies();
      setMovies(response.watched);
      calculateStats(response.watched);
    } catch {
      showToast('Failed to load watched movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = useCallback((watchedMovies: UserMovie[]) => {
    if (watchedMovies.length === 0) return;

    const totalRuntime = watchedMovies.reduce((sum, m) => sum + (m.movie?.runtime || 0), 0);
    const ratedMovies = watchedMovies.filter((m) => m.rating);
    const averageRating =
      ratedMovies.length > 0
        ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMovies.length
        : 0;
    const highestRated =
      ratedMovies.length > 0
        ? ratedMovies.reduce(
            (max, m) => ((m.rating || 0) > (max?.rating || 0) ? m : max),
            ratedMovies[0],
          )
        : null;

    setStats({
      totalWatched: watchedMovies.length,
      totalRuntime,
      averageRating,
      highestRated,
    });
  }, []);

  const handleRemoveFromWatched = useCallback(
    async (tmdbId: number) => {
      try {
        await movieService.removeFromWatched(tmdbId);
        const updatedMovies = movies.filter((m) => m.movie?.tmdbId !== tmdbId);
        setMovies(updatedMovies);
        calculateStats(updatedMovies);
        showToast('Marked as unwatched', 'success');
      } catch {
        showToast('Failed to remove from watched movies', 'error');
      }
    },
    [movies, calculateStats, showToast],
  );

  const handleUpdateWatchedDate = useCallback(
    async (movieId: number, newDate: Dayjs | null) => {
      if (!newDate) return;

      try {
        const response = await fetch(`/api/user/watched/${movieId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ watchedAt: newDate.toISOString() }),
        });

        if (response.ok) {
          setMovies((prev) =>
            prev.map((m) => (m.id === movieId ? { ...m, watchedAt: newDate.toDate() } : m)),
          );
          showToast('Watch date updated', 'success');
          // Re-sort if sorted by date
          if (sortBy === MovieSortBy.RECENTLY_WATCHED) {
            setMovies((prev) =>
              [...prev].sort((a, b) => {
                const dateA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
                const dateB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
                return dateB - dateA;
              }),
            );
          }
        } else {
          showToast('Failed to update watch date', 'error');
        }
      } catch {
        showToast('Failed to update watch date', 'error');
      }
      setEditingDateId(null);
    },
    [showToast, sortBy],
  );

  const handleAddToWatchlist = useCallback(
    async (movie: UserMovie['movie']) => {
      try {
        if (movie) {
          await movieService.addToWatchlist(movie);
        }
        showToast('Added to watchlist', 'success');
      } catch {
        showToast('Failed to add to watchlist', 'error');
      }
    },
    [showToast],
  );

  const sortMovies = useCallback(
    (movies: UserMovie[]) => {
      const sorted = [...movies];
      switch (sortBy) {
        case MovieSortBy.RECENTLY_WATCHED:
          return sorted.sort((a, b) => {
            const dateA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
            const dateB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
            return dateB - dateA;
          });
        case MovieSortBy.DATE_ADDED:
          return sorted.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
        case MovieSortBy.TITLE:
          return sorted.sort((a, b) => (a.movie?.title || '').localeCompare(b.movie?.title || ''));
        case MovieSortBy.RELEASE_DATE:
          return sorted.sort((a, b) => {
            const dateA = a.movie?.releaseDate ? new Date(a.movie.releaseDate).getTime() : 0;
            const dateB = b.movie?.releaseDate ? new Date(b.movie?.releaseDate).getTime() : 0;
            return dateB - dateA;
          });
        case MovieSortBy.RATING:
          return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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

  const sortedMovies = useMemo(() => sortMovies(movies), [sortMovies, movies]);

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <AppLoader type="circular" message="Loading watched movies..." />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <WatchedPageView
        movies={movies}
        stats={stats}
        sortBy={sortBy}
        editingDateId={editingDateId}
        sortedMovies={sortedMovies}
        onSortChange={setSortBy}
        onEditDateClick={setEditingDateId}
        onCancelEditDate={() => setEditingDateId(null)}
        onUpdateWatchedDate={handleUpdateWatchedDate}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatched={handleRemoveFromWatched}
        formatRuntime={formatRuntime}
      />
    </MainLayout>
  );
}
