'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { movieService } from '@/services/movie.service';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    watchlistCount: 0,
    watchedCount: 0,
    totalRuntime: 0,
    averageRating: 0,
    genreDistribution: [] as Array<{ name: string; count: number }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserStats();
    }
  }, [status, router]);

  const fetchUserStats = async () => {
    try {
      const [watchlistRes, watchedRes] = await Promise.all([
        movieService.getWatchlist(),
        movieService.getWatchedMovies(),
      ]);

      const watchedMovies = watchedRes.watched;
      const totalRuntime = watchedMovies.reduce((sum, m) => sum + (m.movie?.runtime || 0), 0);
      const ratedMovies = watchedMovies.filter((m) => m.rating);
      const averageRating =
        ratedMovies.length > 0
          ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMovies.length
          : 0;

      // Genre distribution
      const genreMap = new Map();
      watchedMovies.forEach((m) => {
        if (!m.movie?.genres) return;
        const genres = Array.isArray(m.movie.genres) ? m.movie.genres : [];
        genres.forEach((genreId) => {
          const current = genreMap.get(genreId) || 0;
          genreMap.set(genreId, current + 1);
        });
      });

      const genreDistribution = Array.from(genreMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        watchlistCount: watchlistRes.watchlist.length,
        watchedCount: watchedMovies.length,
        totalRuntime,
        averageRating,
        genreDistribution,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days} days ${remainingHours} hours`;
    }
    return `${hours} hours ${minutes % 60} minutes`;
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4 }}>
            <Skeleton variant="rectangular" height={200} />
            <Skeleton variant="text" sx={{ fontSize: '2rem', mt: 2 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Paper sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                <Typography variant="h3">
                  {session?.user?.email?.charAt(0).toUpperCase()}
                </Typography>
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {session?.user?.name || 'Movie Enthusiast'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {session?.user?.email}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Your Movie Statistics
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AppIcon icon="mdi:bookmark" size={40} color="primary.main" />
                    <Box>
                      <Typography variant="h4">{stats.watchlistCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Watchlist
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AppIcon icon="mdi:check-circle" size={40} color="success.main" />
                    <Box>
                      <Typography variant="h4">{stats.watchedCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Movies Watched
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AppIcon icon="mdi:clock" size={40} color="info.main" />
                    <Box>
                      <Typography variant="h6">{formatRuntime(stats.totalRuntime)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Watch Time
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AppIcon icon="mdi:star" size={40} color="warning.main" />
                    <Box>
                      <Typography variant="h4">
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {stats.genreDistribution.length > 0 && (
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Genres Watched
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                      {stats.genreDistribution.map((genre) => (
                        <Paper
                          key={genre.name}
                          sx={{
                            px: 2,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body1">{genre.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({genre.count})
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AppIcon icon="mdi:bookmark" />}
              onClick={() => router.push('/watchlist')}
            >
              View Watchlist
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<AppIcon icon="mdi:check-circle" />}
              onClick={() => router.push('/watched')}
            >
              View Watched
            </Button>
            <Button
              variant="outlined"
              startIcon={<AppIcon icon="mdi:movie-search" />}
              onClick={() => router.push('/movies')}
            >
              Browse Movies
            </Button>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
