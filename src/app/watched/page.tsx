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
  Card,
  CardContent,
  Divider,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { MovieCard } from '@/components/movie/movie-card';
import { useToast } from '@/hooks/useToast';
import { movieService } from '@/services/movie.service';
import { MovieSortBy } from '@core/enums';

export default function WatchedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<MovieSortBy>(MovieSortBy.DATE_ADDED);
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalRuntime: 0,
    averageRating: 0,
    highestRated: null as any,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchWatchedMovies();
    }
  }, [status]);

  const fetchWatchedMovies = async () => {
    try {
      const response = await movieService.getWatchedMovies();
      setMovies(response.watched);
      calculateStats(response.watched);
    } catch (error) {
      showToast('Failed to load watched movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (watchedMovies: any[]) => {
    if (watchedMovies.length === 0) return;

    const totalRuntime = watchedMovies.reduce((sum, m) => sum + (m.movie.runtime || 0), 0);
    const ratedMovies = watchedMovies.filter(m => m.rating);
    const averageRating = ratedMovies.length > 0
      ? ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length
      : 0;
    const highestRated = ratedMovies.length > 0
      ? ratedMovies.reduce((max, m) => m.rating > (max?.rating || 0) ? m : max, ratedMovies[0])
      : null;

    setStats({
      totalWatched: watchedMovies.length,
      totalRuntime,
      averageRating,
      highestRated,
    });
  };

  const handleRemoveFromWatched = async (tmdbId: number) => {
    try {
      await movieService.removeFromWatched(tmdbId);
      const updatedMovies = movies.filter(m => m.movie.tmdbId !== tmdbId);
      setMovies(updatedMovies);
      calculateStats(updatedMovies);
      showToast('Removed from watched movies', 'success');
    } catch (error) {
      showToast('Failed to remove from watched movies', 'error');
    }
  };

  const sortMovies = (movies: any[]) => {
    const sorted = [...movies];
    switch (sortBy) {
      case MovieSortBy.DATE_ADDED:
        return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case MovieSortBy.TITLE:
        return sorted.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
      case MovieSortBy.RELEASE_DATE:
        return sorted.sort((a, b) => {
          const dateA = a.movie.releaseDate ? new Date(a.movie.releaseDate).getTime() : 0;
          const dateB = b.movie.releaseDate ? new Date(b.movie.releaseDate).getTime() : 0;
          return dateB - dateA;
        });
      case MovieSortBy.RATING:
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${minutes % 60}m`;
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Watched Movies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your movie watching journey
            </Typography>
          </Box>

          {movies.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <AppIcon icon="mdi:movie-check" size={24} color="primary.main" />
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {stats.totalWatched}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Movies Watched
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <AppIcon icon="mdi:clock-outline" size={24} color="primary.main" />
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {formatRuntime(stats.totalRuntime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Runtime
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <AppIcon icon="mdi:star" size={24} color="primary.main" />
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {stats.highestRated && (
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <AppIcon icon="mdi:trophy" size={24} color="primary.main" />
                      <Typography variant="body1" sx={{ mt: 1 }} noWrap>
                        {stats.highestRated.movie.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Highest Rated ({stats.highestRated.rating}★)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              All Watched Movies
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="Recently Watched"
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
                label="My Rating"
                onClick={() => setSortBy(MovieSortBy.RATING)}
                color={sortBy === MovieSortBy.RATING ? 'primary' : 'default'}
              />
            </Box>
          </Box>

          {movies.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <AppIcon icon="mdi:movie-check-outline" size={64} color="text.secondary" />
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                No watched movies yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Start tracking movies you've watched
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
                <Grid item xs={12} sm={6} md={4} lg={3} key={userMovie.movie.id}>
                  <MovieCard
                    movie={userMovie.movie}
                    showActions={false}
                    userRating={userMovie.rating}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<AppIcon icon="mdi:delete-outline" />}
                      onClick={() => handleRemoveFromWatched(userMovie.movie.tmdbId)}
                      fullWidth
                    >
                      Remove
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}