'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { Toast } from '@core/components/toast';
import { TMDB_CONFIG } from '@core/constants';
import { MovieStatus } from '@core/enums';
import { movieService } from '@/services/movie.service';
import { Movie, UserMovie } from '@/types';

export default function MovieDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userMovie, setUserMovie] = useState<UserMovie | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'success' | 'error' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const tmdbId = parseInt(params.tmdbId as string);

  useEffect(() => {
    if (tmdbId) {
      fetchMovieDetails();
      if (session) {
        checkUserMovieStatus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, session]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`/api/movies/${tmdbId}`);
      const data = await response.json();
      if (data.movie) {
        setMovie(data.movie);
      }
    } catch {
      console.error('Error fetching movie details');
      showToast('Failed to load movie details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkUserMovieStatus = async () => {
    try {
      const [watchlistRes, watchedRes] = await Promise.all([
        movieService.getWatchlist(),
        movieService.getWatchedMovies(),
      ]);

      const inWatchlist = watchlistRes.watchlist.find((um) => um.movie?.tmdbId === tmdbId);
      const inWatched = watchedRes.watched.find((um) => um.movie?.tmdbId === tmdbId);

      if (inWatched) {
        setUserMovie(inWatched);
        setRating(inWatched.rating || null);
      } else if (inWatchlist) {
        setUserMovie(inWatchlist);
      }
    } catch {
      console.error('Error checking user movie status');
    }
  };

  const handleAddToWatchlist = async () => {
    if (!session) {
      showToast('Please login to add to watchlist', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await movieService.addToWatchlist(movie!);
      showToast('Added to watchlist', 'success');
      await checkUserMovieStatus();
    } catch {
      showToast('Failed to add to watchlist', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!session) {
      showToast('Please login to mark as watched', 'warning');
      return;
    }

    setRatingDialogOpen(true);
  };

  const handleSaveWatched = async () => {
    setActionLoading(true);
    try {
      await movieService.markAsWatched(movie!, rating || undefined);
      showToast('Marked as watched', 'success');
      setRatingDialogOpen(false);
      await checkUserMovieStatus();
    } catch {
      showToast('Failed to mark as watched', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    setActionLoading(true);
    try {
      await movieService.removeFromWatchlist(tmdbId);
      showToast('Removed from watchlist', 'success');
      setUserMovie(null);
    } catch {
      showToast('Failed to remove from watchlist', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (message: string, severity: 'info' | 'success' | 'error' | 'warning') => {
    setToast({ open: true, message, severity });
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4 }}>
            <Skeleton variant="rectangular" height={400} />
            <Skeleton variant="text" sx={{ fontSize: '2rem', mt: 2 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h4">Movie not found</Typography>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  const backdropUrl = movie.backdropPath
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZES[2]}${movie.backdropPath}`
    : null;

  const posterUrl = movie.posterPath
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZES[4]}${movie.posterPath}`
    : null;

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown';

  const isInWatchlist = userMovie?.status === MovieStatus.WATCHLIST;
  const isWatched = userMovie?.status === MovieStatus.WATCHED;

  return (
    <MainLayout>
      {backdropUrl && (
        <Box
          sx={{
            position: 'relative',
            height: { xs: 200, md: 400 },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Image src={backdropUrl} alt={movie.title} fill style={{ objectFit: 'cover' }} priority />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9))',
            }}
          />
        </Box>
      )}

      <Container>
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              {posterUrl ? (
                <Card sx={{ position: 'relative', paddingTop: '150%' }}>
                  <Image src={posterUrl} alt={movie.title} fill style={{ objectFit: 'cover' }} />
                </Card>
              ) : (
                <Card
                  sx={{
                    position: 'relative',
                    paddingTop: '150%',
                    bgcolor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon icon="mdi:movie-outline" size={64} color="grey.500" />
                </Card>
              )}

              <Box sx={{ mt: 3 }}>
                {!isWatched && (
                  <Button
                    fullWidth
                    variant={isInWatchlist ? 'outlined' : 'contained'}
                    color="primary"
                    startIcon={
                      <AppIcon icon={isInWatchlist ? 'mdi:bookmark-check' : 'mdi:bookmark-plus'} />
                    }
                    onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
                    disabled={actionLoading}
                    sx={{ mb: 2 }}
                  >
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </Button>
                )}

                <Button
                  fullWidth
                  variant={isWatched ? 'contained' : 'outlined'}
                  color={isWatched ? 'success' : 'primary'}
                  startIcon={<AppIcon icon={isWatched ? 'mdi:check-circle' : 'mdi:check'} />}
                  onClick={handleMarkAsWatched}
                  disabled={actionLoading || isWatched}
                >
                  {isWatched ? 'Watched' : 'Mark as Watched'}
                </Button>

                {isWatched && userMovie?.rating && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>
                      Your Rating
                    </Typography>
                    <Rating value={userMovie.rating} readOnly size="large" />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {movie.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  {releaseYear}
                </Typography>
                {movie.runtime && (
                  <Typography variant="h6" color="text.secondary">
                    • {movie.runtime} min
                  </Typography>
                )}
                {movie.voteAverage && (
                  <Chip
                    label={movie.voteAverage.toFixed(1)}
                    color="primary"
                    icon={<AppIcon icon="mdi:star" size={16} />}
                  />
                )}
              </Box>

              {movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {movie.genres.map(
                    (genre: string | number | { id: number; name: string }, index: number) => {
                      const genreId = typeof genre === 'object' ? genre.id : genre;
                      const genreLabel = typeof genre === 'object' ? genre.name : `Genre ${genre}`;
                      return (
                        <Chip
                          key={`genre-${genreId}-${index}`}
                          label={genreLabel}
                          variant="outlined"
                        />
                      );
                    },
                  )}
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h5" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {movie.overview || 'No overview available'}
              </Typography>

              {movie.voteCount && (
                <Paper sx={{ p: 2, mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Based on {movie.voteCount.toLocaleString()} votes
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>Rate this movie</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography gutterBottom>How would you rate {movie.title}?</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWatched} variant="contained" disabled={actionLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </MainLayout>
  );
}
