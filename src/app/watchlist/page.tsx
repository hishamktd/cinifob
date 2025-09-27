'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { MovieCard } from '@/components/movie/movie-card';
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

  const handleRemoveFromWatchlist = async (tmdbId: number) => {
    try {
      await movieService.removeFromWatchlist(tmdbId);
      setMovies(movies.filter((m) => m.movie?.tmdbId !== tmdbId));
      showToast('Removed from watchlist', 'success');
    } catch {
      showToast('Failed to remove from watchlist', 'error');
    }
  };

  const handleMarkAsWatched = (movie: UserMovie) => {
    setRatingDialog({ open: true, movie, rating: null });
  };

  const handleSaveWatched = async () => {
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
  };

  const sortMovies = (movies: UserMovie[]) => {
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
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  const sortedMovies = sortMovies(movies);

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Box
            sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                My Watchlist
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {movies.length} {movies.length === 1 ? 'movie' : 'movies'} to watch
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="Recently Added"
                onClick={() => setSortBy(MovieSortBy.DATE_ADDED)}
                color={sortBy === MovieSortBy.DATE_ADDED ? 'primary' : 'default'}
              />
              <Chip
                label="Title"
                onClick={() => setSortBy(MovieSortBy.TITLE)}
                color={sortBy === MovieSortBy.TITLE ? 'primary' : 'default'}
              />
              <Chip
                label="Release Date"
                onClick={() => setSortBy(MovieSortBy.RELEASE_DATE)}
                color={sortBy === MovieSortBy.RELEASE_DATE ? 'primary' : 'default'}
              />
              <Chip
                label="Rating"
                onClick={() => setSortBy(MovieSortBy.RATING)}
                color={sortBy === MovieSortBy.RATING ? 'primary' : 'default'}
              />
            </Box>
          </Box>

          {movies.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <AppIcon icon="mdi:bookmark-outline" size={64} color="text.secondary" />
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Your watchlist is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Start adding movies you want to watch
              </Typography>
              <Button
                variant="contained"
                startIcon={<AppIcon icon="mdi:movie-search" />}
                onClick={() => router.push('/movies')}
              >
                Browse Movies
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sortedMovies.map((userMovie) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={userMovie.movie?.id}>
                  <MovieCard movie={userMovie.movie || {}} showActions={false} />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<AppIcon icon="mdi:bookmark-remove" />}
                      onClick={() => handleRemoveFromWatchlist(userMovie?.movie?.tmdbId || 0)}
                      fullWidth
                    >
                      Remove
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<AppIcon icon="mdi:check" />}
                      onClick={() => handleMarkAsWatched(userMovie)}
                      fullWidth
                    >
                      Watched
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      <Dialog
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ open: false, movie: null, rating: null })}
      >
        <DialogTitle>Rate this movie</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography gutterBottom>
              How would you rate {ratingDialog.movie?.movie?.title}?
            </Typography>
            <Rating
              value={ratingDialog.rating}
              onChange={(_, newValue) => setRatingDialog({ ...ratingDialog, rating: newValue })}
              size="large"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog({ open: false, movie: null, rating: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveWatched} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
