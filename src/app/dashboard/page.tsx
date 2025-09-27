'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { movieService } from '@/services/movie.service';
import { TMDB_CONFIG } from '@core/constants';
import { UserMovie } from '@/types';

dayjs.extend(relativeTime);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    watchlistCount: 0,
    watchedCount: 0,
    totalRuntime: 0,
    averageRating: 0,
    thisMonthWatched: 0,
    thisYearWatched: 0,
  });
  const [recentActivity, setRecentActivity] = useState<(UserMovie & { type: string })[]>([]);
  const [watchlistPreview, setWatchlistPreview] = useState<UserMovie[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const [watchlistRes, watchedRes] = await Promise.all([
        movieService.getWatchlist(),
        movieService.getWatchedMovies(),
      ]);

      const watchedMovies = watchedRes.watched;
      const watchlist = watchlistRes.watchlist;

      // Calculate statistics
      const totalRuntime = watchedMovies.reduce((sum, m) => sum + (m.movie?.runtime || 0), 0);
      const ratedMovies = watchedMovies.filter(m => m.rating);
      const averageRating = ratedMovies.length > 0
        ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMovies.length
        : 0;

      // This month and year stats
      const now = dayjs();
      const thisMonthWatched = watchedMovies.filter(m =>
        dayjs(m.watchedAt).isSame(now, 'month')
      ).length;
      const thisYearWatched = watchedMovies.filter(m =>
        dayjs(m.watchedAt).isSame(now, 'year')
      ).length;

      setStats({
        watchlistCount: watchlist.length,
        watchedCount: watchedMovies.length,
        totalRuntime,
        averageRating,
        thisMonthWatched,
        thisYearWatched,
      });

      // Recent activity (combine watchlist and watched, sort by date)
      const allActivity = [
        ...watchlist.map(m => ({ ...m, type: 'watchlist' })),
        ...watchedMovies.map(m => ({ ...m, type: 'watched' })),
      ].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 5);

      setRecentActivity(allActivity);

      // Watchlist preview (latest 4)
      setWatchlistPreview(watchlist.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watched':
        return 'mdi:check-circle';
      case 'watchlist':
        return 'mdi:bookmark';
      default:
        return 'mdi:movie';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'watched':
        return 'success.main';
      case 'watchlist':
        return 'primary.main';
      default:
        return 'text.secondary';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={i}>
                  <Skeleton variant="rectangular" height={120} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0]}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Here&apos;s your movie tracking overview
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Watchlist
                      </Typography>
                      <Typography variant="h4">
                        {stats.watchlistCount}
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:bookmark" size={40} color="primary.main" />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((stats.watchlistCount / 100) * 100, 100)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Watched
                      </Typography>
                      <Typography variant="h4">
                        {stats.watchedCount}
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:check-circle" size={40} color="success.main" />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {stats.thisMonthWatched} this month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Watch Time
                      </Typography>
                      <Typography variant="h5">
                        {formatRuntime(stats.totalRuntime)}
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:clock-time-eight" size={40} color="info.main" />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total time spent
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Avg Rating
                      </Typography>
                      <Typography variant="h4">
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:star" size={40} color="warning.main" />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Your average rating
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Recent Activity */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Activity</Typography>
                </Box>
                {recentActivity.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AppIcon icon="mdi:history" size={48} color="text.secondary" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      No recent activity
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {recentActivity.map((activity, index) => (
                      <ListItem
                        key={activity.id}
                        divider={index < recentActivity.length - 1}
                        secondaryAction={
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(activity.updatedAt).fromNow()}
                          </Typography>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                            <AppIcon icon={getActivityIcon(activity.type)} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.movie?.title || 'Unknown'}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption">
                                {activity.type === 'watched' ? 'Watched' : 'Added to watchlist'}
                              </Typography>
                              {activity.rating && (
                                <Chip
                                  label={`${activity.rating}★`}
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Watchlist Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Your Watchlist</Typography>
                  <Button
                    size="small"
                    endIcon={<AppIcon icon="mdi:arrow-right" />}
                    onClick={() => router.push('/watchlist')}
                  >
                    View All
                  </Button>
                </Box>
                {watchlistPreview.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AppIcon icon="mdi:bookmark-outline" size={48} color="text.secondary" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Your watchlist is empty
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => router.push('/movies')}
                    >
                      Browse Movies
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {watchlistPreview.map((item) => (
                      <Grid size={6} key={item.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                          }}
                          onClick={() => item.movie && router.push(`/movies/${item.movie.tmdbId}`)}
                        >
                          <Box sx={{ position: 'relative', paddingTop: '150%' }}>
                            {item.movie?.posterPath ? (
                              <Image
                                src={`${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZES[2]}${item.movie.posterPath}`}
                                alt={item.movie.title}
                                fill
                                style={{
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'grey.300',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <AppIcon icon="mdi:movie-outline" size={48} color="grey.500" />
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="body2" noWrap>
                              {item.movie?.title || 'Unknown'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Year Progress */}
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {new Date().getFullYear()} Progress
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Movies Watched This Year
                      </Typography>
                      <Typography variant="h3">
                        {stats.thisYearWatched}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Average Per Month
                      </Typography>
                      <Typography variant="h3">
                        {(stats.thisYearWatched / (new Date().getMonth() + 1)).toFixed(1)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Projected Total
                      </Typography>
                      <Typography variant="h3">
                        {Math.round((stats.thisYearWatched / (new Date().getMonth() + 1)) * 12)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AppIcon icon="mdi:movie-search" />}
                      onClick={() => router.push('/movies')}
                    >
                      Browse Movies
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AppIcon icon="mdi:bookmark" />}
                      onClick={() => router.push('/watchlist')}
                    >
                      My Watchlist
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AppIcon icon="mdi:check-circle" />}
                      onClick={() => router.push('/watched')}
                    >
                      Watched Movies
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AppIcon icon="mdi:account" />}
                      onClick={() => router.push('/profile')}
                    >
                      My Profile
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}