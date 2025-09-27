'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Typography,
  Skeleton,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { movieService } from '@/services/movie.service';
import { Movie } from '@/types';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
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
  };

  return (
    <MainLayout>
      <Box sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to CiniFob
        </Typography>
        <Typography variant="h5" color="text.secondary" align="center" sx={{ mb: 6 }}>
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
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {session ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AppIcon icon="solar:video-library-bold" />}
                  onClick={() => router.push('/movies')}
                >
                  Browse Movies
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AppIcon icon="solar:bookmark-linear" />}
                  onClick={() => router.push('/watchlist')}
                >
                  My Watchlist
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" size="large" onClick={() => router.push('/register')}>
                  Sign Up
                </Button>
                <Button variant="outlined" size="large" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Paper>

        {/* Popular Movies Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom>
            Popular Movies
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Discover what&apos;s trending in cinema right now
          </Typography>

          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(6)).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card>
                      <Skeleton variant="rectangular" height={300} />
                      <CardContent>
                        <Skeleton />
                        <Skeleton width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : popularMovies.map((movie) => (
                  <Grid key={movie.tmdbId} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.03)',
                        },
                      }}
                      onClick={() => router.push(`/movies/${movie.tmdbId}`)}
                    >
                      {movie.posterPath ? (
                        <CardMedia
                          component="img"
                          height="300"
                          image={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                          alt={movie.title}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'action.disabled',
                          }}
                        >
                          <AppIcon icon="solar:video-library-bold" size={48} />
                        </Box>
                      )}
                      <CardContent>
                        <Typography variant="body1" noWrap fontWeight="medium">
                          {movie.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <AppIcon icon="solar:star-bold" size={16} color="warning" />
                          <Typography variant="body2" color="text.secondary">
                            {movie.voteAverage?.toFixed(1)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
          </Grid>

          {!loading && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/movies')}
                endIcon={<AppIcon icon="solar:arrow-right-linear" />}
              >
                View All Movies
              </Button>
            </Box>
          )}
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
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
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AppIcon icon="solar:info-circle-bold" size={28} color="info" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Quick Stats
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      1M+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Movies Available
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      50K+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      TV Shows
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="h4" color="success">
                      4.9
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
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
