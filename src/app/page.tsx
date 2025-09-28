'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { ROUTES } from '@core/constants';
import { Box, Card, CardContent, Grid, Paper, Typography } from '@mui/material';

import { AppIcon, AppMovieCard, MainLayout, AppButton, MovieCardSkeleton } from '@core/components';
import { movieService } from '@/services/movie.service';
import { useMovieStatus } from '@/hooks/useMovieStatus';
import { useToast } from '@/hooks/useToast';
import { Movie } from '@/types';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { addToWatchlist, removeFromWatchlist, markAsWatched, isInWatchlist, isWatched } =
    useMovieStatus();
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularMovies();
  }, []);

  const loadPopularMovies = useCallback(async () => {
    try {
      const response = await movieService.getPopularMovies(1);
      // The API returns { movies, page, totalPages, totalResults }
      if (response && response.movies) {
        setPopularMovies(response.movies.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MainLayout>
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        >
          Welcome to CiniFob
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          align="center"
          sx={{
            mb: 6,
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
            px: { xs: 2, sm: 0 },
          }}
        >
          Track your movies, manage your watchlist, and discover new films
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppIcon icon="solar:play-circle-bold" size={32} color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Track Movies
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Keep track of all the movies you have watched and rate them
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppIcon icon="solar:bookmark-bold" size={32} color="secondary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Watchlist
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Save movies to watch later and never miss a great film
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppIcon icon="solar:chart-bold" size={32} color="success" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Statistics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View your watching habits and discover your favorite genres
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Get Started Section */}
        <Paper sx={{ p: 4, mt: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Get Started
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {session
              ? 'Start exploring movies and build your personal collection'
              : 'Join CiniFob today and start tracking your movie journey'}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 1.5, sm: 2 },
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              px: { xs: 2, sm: 0 },
            }}
          >
            {session ? (
              <>
                <AppButton
                  variant="contained"
                  size="large"
                  startIcon="solar:video-library-bold"
                  onClick={() => router.push('/browse')}
                >
                  Browse Content
                </AppButton>
                <AppButton
                  variant="outlined"
                  size="large"
                  startIcon="solar:bookmark-linear"
                  onClick={() => router.push(ROUTES.WATCHLIST)}
                >
                  My Watchlist
                </AppButton>
              </>
            ) : (
              <>
                <AppButton
                  variant="contained"
                  size="large"
                  onClick={() => router.push(ROUTES.REGISTER)}
                >
                  Sign Up
                </AppButton>
                <AppButton
                  variant="outlined"
                  size="large"
                  onClick={() => router.push(ROUTES.LOGIN)}
                >
                  Sign In
                </AppButton>
              </>
            )}
          </Box>
        </Paper>

        {/* Popular Movies Section */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
          >
            Popular Movies
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 0 },
            }}
          >
            Discover what&apos;s trending in cinema right now
          </Typography>

          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(6)).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <MovieCardSkeleton />
                  </Grid>
                ))
              : popularMovies.map((movie) => (
                  <Grid key={movie.tmdbId} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <AppMovieCard
                      movie={movie}
                      size="small"
                      onAddToWatchlist={async () => {
                        if (!session) {
                          showToast('Please login to add to watchlist', 'warning');
                          return;
                        }
                        if (!movie.tmdbId) return;

                        const inWatchlist = isInWatchlist(movie.tmdbId);
                        try {
                          if (inWatchlist) {
                            await movieService.removeFromWatchlist(movie.tmdbId);
                            removeFromWatchlist(movie.tmdbId);
                            showToast('Removed from watchlist', 'success');
                          } else {
                            await movieService.addToWatchlist(movie);
                            addToWatchlist(movie.tmdbId);
                            showToast('Added to watchlist', 'success');
                          }
                        } catch {
                          showToast(
                            inWatchlist
                              ? 'Failed to remove from watchlist'
                              : 'Failed to add to watchlist',
                            'error',
                          );
                        }
                      }}
                      onMarkAsWatched={async () => {
                        if (!session) {
                          showToast('Please login to mark as watched', 'warning');
                          return;
                        }
                        if (!movie.tmdbId) return;

                        const watched = isWatched(movie.tmdbId);
                        try {
                          if (watched) {
                            showToast('Already marked as watched', 'info');
                          } else {
                            await movieService.markAsWatched(movie);
                            markAsWatched(movie.tmdbId);
                            showToast('Marked as watched', 'success');
                          }
                        } catch {
                          showToast('Failed to mark as watched', 'error');
                        }
                      }}
                    />
                  </Grid>
                ))}
          </Grid>

          {!loading && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <AppButton
                variant="outlined"
                size="large"
                onClick={() => router.push('/browse')}
                endIcon="solar:arrow-right-linear"
              >
                Browse All Content
              </AppButton>
            </Box>
          )}
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AppIcon icon="solar:shield-check-bold" size={28} color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Why Choose CiniFob?
                </Typography>
              </Box>
              <Box sx={{ pl: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    <AppIcon icon="solar:check-circle-bold" size={20} color="success" />
                  </Box>
                  <Typography variant="body2">Track movies you&apos;ve watched</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    <AppIcon icon="solar:check-circle-bold" size={20} color="success" />
                  </Box>
                  <Typography variant="body2">Create and manage watchlists</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    <AppIcon icon="solar:check-circle-bold" size={20} color="success" />
                  </Box>
                  <Typography variant="body2">Rate and review movies</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    <AppIcon icon="solar:check-circle-bold" size={20} color="success" />
                  </Box>
                  <Typography variant="body2">View detailed movie information</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    <AppIcon icon="solar:check-circle-bold" size={20} color="success" />
                  </Box>
                  <Typography variant="body2">Discover new movies to watch</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AppIcon icon="solar:info-circle-bold" size={28} color="info" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Quick Stats
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      1M+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Movies Available
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      50K+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      TV Shows
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="h4" color="success">
                      4.9
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="h4" color="warning">
                      24/7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}
