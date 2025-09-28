'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';

import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AppIcon, AppLoader, AppEmptyState, MainLayout, AppButton } from '@core/components';
import { ContentCard } from '@/components/content-card';
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
      <Container>
        <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 0 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
            >
              Watched Movies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your movie watching journey
            </Typography>
          </Box>

          {movies.length > 0 && (
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <AppIcon icon="mdi:movie-check" size={24} color="primary.main" />
                    <Typography
                      variant="h4"
                      sx={{ mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                    >
                      {stats.totalWatched}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Movies Watched
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <AppIcon icon="mdi:clock-outline" size={24} color="primary.main" />
                    <Typography
                      variant="h4"
                      sx={{ mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                    >
                      {formatRuntime(stats.totalRuntime)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Total Runtime
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <AppIcon icon="mdi:star" size={24} color="primary.main" />
                    <Typography
                      variant="h4"
                      sx={{ mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                    >
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Average Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {stats.highestRated && (
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <AppIcon icon="mdi:trophy" size={24} color="primary.main" />
                      <Typography
                        variant="body1"
                        sx={{ mt: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        noWrap
                      >
                        {stats.highestRated.movie?.title || 'Unknown'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Highest Rated ({stats.highestRated.rating}★)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
              All Watched Movies
            </Typography>
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
                label="Recently Watched"
                onClick={() => setSortBy(MovieSortBy.RECENTLY_WATCHED)}
                color={sortBy === MovieSortBy.RECENTLY_WATCHED ? 'primary' : 'default'}
                size="small"
                sx={{ flexShrink: 0 }}
              />
              <Chip
                label="Title"
                onClick={() => setSortBy(MovieSortBy.TITLE)}
                color={sortBy === MovieSortBy.TITLE ? 'primary' : 'default'}
                size="small"
                sx={{ flexShrink: 0 }}
              />
              <Chip
                label="Release Date"
                onClick={() => setSortBy(MovieSortBy.RELEASE_DATE)}
                color={sortBy === MovieSortBy.RELEASE_DATE ? 'primary' : 'default'}
                size="small"
                sx={{ flexShrink: 0 }}
              />
              <Chip
                label="My Rating"
                onClick={() => setSortBy(MovieSortBy.RATING)}
                color={sortBy === MovieSortBy.RATING ? 'primary' : 'default'}
                size="small"
                sx={{ flexShrink: 0 }}
              />
            </Box>
          </Box>

          {movies.length === 0 ? (
            <AppEmptyState
              icon="mdi:movie-check-outline"
              title="No watched movies yet"
              description="Keep track of movies you've watched and rate them."
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
                    isInWatchlist={false}
                    isWatched={true}
                  />

                  {/* Watched Date Section */}
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                      borderRadius: 1,
                    }}
                  >
                    {editingDateId === userMovie.id ? (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DatePicker
                            label="Watched Date"
                            value={dayjs(userMovie.watchedAt)}
                            onChange={(newDate) => handleUpdateWatchedDate(userMovie.id, newDate)}
                            maxDate={dayjs()}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                              },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => setEditingDateId(null)}
                            sx={{ flexShrink: 0 }}
                          >
                            <AppIcon icon="mdi:close" size={20} />
                          </IconButton>
                        </Box>
                      </LocalizationProvider>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Watched on
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {dayjs(userMovie.watchedAt).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setEditingDateId(userMovie.id)}
                          sx={{
                            ml: 1,
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <AppIcon icon="mdi:pencil" size={16} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* User Rating if exists */}
                  {userMovie.rating && (
                    <Box
                      sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <AppIcon icon="mdi:star" size={18} color="warning.main" />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Your Rating: {userMovie.rating}/10
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <AppButton
                      size="small"
                      variant="outlined"
                      onClick={() => handleAddToWatchlist(userMovie.movie)}
                      fullWidth
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        },
                        '& .MuiButton-startIcon': {
                          display: { xs: 'none', sm: 'inherit' },
                        },
                      }}
                    >
                      Watch Again
                    </AppButton>
                    <AppButton
                      size="small"
                      variant="text"
                      onClick={() => handleRemoveFromWatched(userMovie.movie?.tmdbId || 0)}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        '& .MuiButton-startIcon': {
                          display: { xs: 'none', sm: 'inherit' },
                        },
                      }}
                    >
                      Remove
                    </AppButton>
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
