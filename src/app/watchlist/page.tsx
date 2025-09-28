'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { AppButton, AppLoader, AppEmptyState, AppRating, MainLayout } from '@core/components';
import { ContentCard } from '@/components/content-card';
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
  }>({ open: false, movie: null, rating: null });

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
    setRatingDialog({ open: true, movie, rating: null });
  }, []);

  const handleSaveWatched = useCallback(async () => {
    if (!ratingDialog.movie) return;

    try {
      await movieService.markAsWatched(
        ratingDialog.movie.movie || {},
        ratingDialog.rating || undefined,
      );
      setMovies(movies.filter((m) => m.movie?.tmdbId !== ratingDialog.movie?.movie?.tmdbId));
      showToast('Marked as watched', 'success');
      setRatingDialog({ open: false, movie: null, rating: null });
    } catch {
      showToast('Failed to mark as watched', 'error');
    }
  }, [ratingDialog.movie, ratingDialog.rating, movies, showToast]);

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

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 0 } }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
              >
                My Watchlist
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {movies.length} {movies.length === 1 ? 'movie' : 'movies'} to watch
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 0.5, sm: 1 },
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: 4,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'action.hover',
                  borderRadius: 2,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'action.disabled',
                  borderRadius: 2,
                },
              }}
            >
              <Chip
                label="Recently Added"
                onClick={() => setSortBy(MovieSortBy.DATE_ADDED)}
                color={sortBy === MovieSortBy.DATE_ADDED ? 'primary' : 'default'}
                sx={{ flexShrink: 0 }}
              />
              <Chip
                label="Title"
                onClick={() => setSortBy(MovieSortBy.TITLE)}
                color={sortBy === MovieSortBy.TITLE ? 'primary' : 'default'}
                sx={{ flexShrink: 0 }}
              />
              <Chip
                label="Release Date"
                onClick={() => setSortBy(MovieSortBy.RELEASE_DATE)}
                color={sortBy === MovieSortBy.RELEASE_DATE ? 'primary' : 'default'}
                sx={{ flexShrink: 0 }}
              />
              <Chip
                label="Rating"
                onClick={() => setSortBy(MovieSortBy.RATING)}
                color={sortBy === MovieSortBy.RATING ? 'primary' : 'default'}
                sx={{ flexShrink: 0 }}
              />
            </Box>
          </Box>

          {movies.length === 0 ? (
            <AppEmptyState
              icon="mdi:bookmark-outline"
              title="Your watchlist is empty"
              description="Start building your movie collection by adding movies you want to watch."
              actionLabel="Browse Movies"
              actionIcon="mdi:movie-search"
              onAction={() => router.push('/movies')}
            />
          ) : (
            <Grid container spacing={3}>
              {sortedMovies.map((userMovie) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={userMovie.movie?.id}>
                  <ContentCard
                    item={{
                      id: userMovie.movie?.id || 0,
                      tmdbId: userMovie.movie?.tmdbId || 0,
                      mediaType: 'movie',
                      title: userMovie.movie?.title || 'Unknown Title',
                      overview: userMovie.movie?.overview,
                      posterPath: userMovie.movie?.posterPath,
                      backdropPath: userMovie.movie?.backdropPath,
                      date: userMovie.movie?.releaseDate?.toString(),
                      voteAverage: userMovie.movie?.voteAverage,
                      voteCount: userMovie.movie?.voteCount,
                      popularity: userMovie.movie?.popularity,
                      genreIds:
                        userMovie.movie?.genres?.map((g: { id?: number } | number | string) =>
                          typeof g === 'object' ? g.id || 0 : Number(g),
                        ) || [],
                    }}
                    isInWatchlist={true}
                    isWatched={false}
                    onAddToWatchlist={() =>
                      handleRemoveFromWatchlist(userMovie?.movie?.tmdbId || 0)
                    }
                    onMarkAsWatched={() => handleMarkAsWatched(userMovie)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      <Dialog
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ open: false, movie: null, rating: null })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Rate this movie</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography gutterBottom>
              How would you rate {ratingDialog.movie?.movie?.title}?
            </Typography>
            <AppRating
              value={ratingDialog.rating}
              onChange={(_, newValue) => setRatingDialog({ ...ratingDialog, rating: newValue })}
              size="large"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setRatingDialog({ open: false, movie: null, rating: null })}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSaveWatched} variant="contained">
            Save
          </AppButton>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
