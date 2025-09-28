'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
} from '@mui/material';
import { BarChart, PieChart, LineChart, Gauge } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { movieService } from '@/services/movie.service';
import { tvShowService } from '@/services/tvshow.service';
import { UserMovie, UserTVShow } from '@/types';
import { TMDB_CONFIG } from '@core/constants';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { AdvancedCharts } from '@/components/dashboard/advanced-charts';
import { PredictiveInsights } from '@/components/dashboard/predictive-insights';
import { DiscoveryRecommendations } from '@/components/dashboard/discovery-recommendations';

dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

interface DashboardStats {
  // Overall stats
  totalMoviesWatched: number;
  totalTVShowsWatched: number;
  totalWatchTime: number;
  totalEpisodesWatched: number;

  // Averages
  averageMovieRating: number;
  averageTVRating: number;
  averageMoviesPerMonth: number;

  // This period stats
  thisWeek: number;
  thisMonth: number;
  thisYear: number;

  // Watchlist stats
  movieWatchlist: number;
  tvWatchlist: number;

  // Genres
  topGenres: { genre: string; count: number }[];

  // Monthly breakdown
  monthlyData: { month: string; movies: number; tv: number; hours: number }[];

  // Rating distribution
  ratingDistribution: { rating: number; count: number }[];

  // Watch patterns
  watchPatternByDay: { day: string; count: number }[];

  // Streaks
  currentStreak: number;
  longestStreak: number;

  // Predictions
  projectedYearTotal: number;
  completionRate: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMoviesWatched: 0,
    totalTVShowsWatched: 0,
    totalWatchTime: 0,
    totalEpisodesWatched: 0,
    averageMovieRating: 0,
    averageTVRating: 0,
    averageMoviesPerMonth: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
    movieWatchlist: 0,
    tvWatchlist: 0,
    topGenres: [],
    monthlyData: [],
    ratingDistribution: [],
    watchPatternByDay: [],
    currentStreak: 0,
    longestStreak: 0,
    projectedYearTotal: 0,
    completionRate: 0,
  });
  const [recentWatched, setRecentWatched] = useState<(UserMovie | UserTVShow)[]>([]);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<{
    genreStats: Array<{
      name: string;
      count: number;
      percentage: number;
      avgRating: number;
      totalHours: number;
    }>;
    productionStats: {
      companies: Array<{ name: string; count: number }>;
      countries: Array<{ name: string; count: number }>;
      languages: Array<{ name: string; count: number }>;
      decades: Array<{ decade: string; count: number }>;
    };
    viewingHabits: {
      bingingScore: number;
      diversityScore: number;
      completionScore: number;
      averageGap: number;
      preferredLength: string;
      weekendVsWeekday: { weekend: number; weekday: number };
    };
    topRatedByGenre: Array<{ genre: string; title: string; rating: number; tmdbId: number }>;
    runtimeDistribution: Record<string, number>;
    hourlyPattern: number[];
    monthlyPattern: number[];
    seasonalPattern: Record<string, number>;
    ratingsByYear: Array<{ year: number; avgRating: number; count: number }>;
    topActors: Array<{ name: string; count: number }>;
    topDirectors: Array<{ name: string; count: number }>;
  } | null>(null);
  const [watchedMoviesData, setWatchedMoviesData] = useState<UserMovie[]>([]);
  const [watchedShowsData, setWatchedShowsData] = useState<UserTVShow[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
      fetchAdvancedAnalytics();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const [watchlistRes, watchedRes, tvWatchlistRes, tvCompletedRes] = await Promise.all([
        movieService.getWatchlist(),
        movieService.getWatchedMovies(),
        fetch('/api/user/tv/watchlist').then((r) => r.json()),
        tvShowService.getCompletedShows(),
      ]);

      const watchedMovies: UserMovie[] = watchedRes.watched;
      const watchlistMovies: UserMovie[] = watchlistRes.watchlist;
      const tvWatchlist: UserTVShow[] = Array.isArray(tvWatchlistRes) ? tvWatchlistRes : [];
      const completedTVShows: UserTVShow[] = Array.isArray(tvCompletedRes) ? tvCompletedRes : [];

      // Store for predictive insights
      setWatchedMoviesData(watchedMovies);
      setWatchedShowsData(completedTVShows);

      // Calculate total watch time
      const totalMovieTime = watchedMovies.reduce((sum, m) => sum + (m.movie?.runtime || 0), 0);
      const totalTVTime = completedTVShows.reduce((sum, s) => {
        const avgEpisodeTime = 45; // Average episode runtime
        const episodes = s.tvShow?.numberOfEpisodes || 0;
        return sum + episodes * avgEpisodeTime;
      }, 0);

      // Calculate averages
      const ratedMovies = watchedMovies.filter((m) => m.rating);
      const avgMovieRating =
        ratedMovies.length > 0
          ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMovies.length
          : 0;

      const ratedTVShows = completedTVShows.filter((s) => s.rating);
      const avgTVRating =
        ratedTVShows.length > 0
          ? ratedTVShows.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedTVShows.length
          : 0;

      // Time period calculations
      const now = dayjs();
      const thisWeek = [
        ...watchedMovies.filter(
          (item) => item.watchedAt && dayjs(item.watchedAt).isSame(now, 'week'),
        ),
        ...completedTVShows.filter(
          (item) => item.completedAt && dayjs(item.completedAt).isSame(now, 'week'),
        ),
      ].length;

      const thisMonth = [
        ...watchedMovies.filter(
          (item) => item.watchedAt && dayjs(item.watchedAt).isSame(now, 'month'),
        ),
        ...completedTVShows.filter(
          (item) => item.completedAt && dayjs(item.completedAt).isSame(now, 'month'),
        ),
      ].length;

      const thisYear = [
        ...watchedMovies.filter(
          (item) => item.watchedAt && dayjs(item.watchedAt).isSame(now, 'year'),
        ),
        ...completedTVShows.filter(
          (item) => item.completedAt && dayjs(item.completedAt).isSame(now, 'year'),
        ),
      ].length;

      // Generate monthly data for the past 12 months
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const month = now.subtract(i, 'month');
        const monthMovies = watchedMovies.filter(
          (m) => m.watchedAt && dayjs(m.watchedAt).isSame(month, 'month'),
        );
        const monthTV = completedTVShows.filter(
          (s) => s.completedAt && dayjs(s.completedAt).isSame(month, 'month'),
        );

        const monthHours = Math.round(
          (monthMovies.reduce((sum, m) => sum + (m.movie?.runtime || 0), 0) +
            monthTV.length * 45 * 10) /
            60, // Assuming 10 episodes average per show
        );

        monthlyData.push({
          month: month.format('MMM'),
          movies: monthMovies.length,
          tv: monthTV.length,
          hours: monthHours,
        });
      }

      // Genre analysis
      const genreMap = new Map<string, number>();
      watchedMovies.forEach((m) => {
        if (m.movie?.genres) {
          const genres = Array.isArray(m.movie.genres) ? m.movie.genres : [];
          genres.forEach((g) => {
            const genreName = typeof g === 'string' ? g : (g as { name: string }).name;
            if (genreName) {
              genreMap.set(genreName, (genreMap.get(genreName) || 0) + 1);
            }
          });
        }
      });

      const topGenres = Array.from(genreMap.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Rating distribution
      const ratingMap = new Map<number, number>();
      [...watchedMovies, ...completedTVShows].forEach((item) => {
        if (item.rating) {
          const rating = Math.floor(item.rating);
          ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
        }
      });

      const ratingDistribution = Array.from({ length: 10 }, (_, i) => ({
        rating: i + 1,
        count: ratingMap.get(i + 1) || 0,
      }));

      // Day of week pattern
      const dayMap = new Map<string, number>();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      watchedMovies.forEach((m) => {
        if (m.watchedAt) {
          const day = days[dayjs(m.watchedAt).day()];
          dayMap.set(day, (dayMap.get(day) || 0) + 1);
        }
      });

      const watchPatternByDay = days.map((day) => ({
        day,
        count: dayMap.get(day) || 0,
      }));

      // Calculate streaks
      const movieDates = watchedMovies
        .filter((item) => item.watchedAt)
        .map((item) => dayjs(item.watchedAt));
      const tvDates = completedTVShows
        .filter((item) => item.completedAt)
        .map((item) => dayjs(item.completedAt));
      const sortedDates = [...movieDates, ...tvDates].sort((a, b) => a.unix() - b.unix());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: dayjs.Dayjs | null = null;

      sortedDates.forEach((date) => {
        if (!lastDate || date.diff(lastDate, 'day') === 1) {
          tempStreak++;
        } else if (date.diff(lastDate, 'day') > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = date;

        // Check if current streak
        if (now.diff(date, 'day') <= 1) {
          currentStreak = tempStreak;
        }
      });
      longestStreak = Math.max(longestStreak, tempStreak);

      // Projections
      const monthsPassed = now.month() + 1;
      const avgPerMonth = thisYear / monthsPassed;
      const projectedYearTotal = Math.round(avgPerMonth * 12);

      // Completion rate (watched vs watchlist)
      const totalWatchlist = watchlistMovies.length + tvWatchlist.length;
      const totalWatched = watchedMovies.length + completedTVShows.length;
      const completionRate =
        totalWatchlist > 0
          ? Math.round((totalWatched / (totalWatched + totalWatchlist)) * 100)
          : 100;

      setStats({
        totalMoviesWatched: watchedMovies.length,
        totalTVShowsWatched: completedTVShows.length,
        totalWatchTime: totalMovieTime + totalTVTime,
        totalEpisodesWatched: completedTVShows.reduce(
          (sum, s) => sum + (s.tvShow?.numberOfEpisodes || 0),
          0,
        ),
        averageMovieRating: avgMovieRating,
        averageTVRating: avgTVRating,
        averageMoviesPerMonth: avgPerMonth,
        thisWeek,
        thisMonth,
        thisYear,
        movieWatchlist: watchlistMovies.length,
        tvWatchlist: tvWatchlist.length,
        topGenres,
        monthlyData,
        ratingDistribution,
        watchPatternByDay,
        currentStreak,
        longestStreak,
        projectedYearTotal,
        completionRate,
      });

      // Recent items
      const recentMovies = watchedMovies.map((item) => ({
        ...item,
        dateField: item.watchedAt,
        itemType: 'movie' as const,
      }));
      const recentShows = completedTVShows.map((item) => ({
        ...item,
        dateField: item.completedAt,
        itemType: 'tv' as const,
      }));
      const recentItems = [...recentMovies, ...recentShows]
        .sort((a, b) => {
          return new Date(b.dateField || 0).getTime() - new Date(a.dateField || 0).getTime();
        })
        .slice(0, 5)
        .map(({ ...item }) => item);

      setRecentWatched(recentItems);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvancedAnalytics = async () => {
    try {
      const response = await fetch('/api/user/analytics');
      if (response.ok) {
        const data = await response.json();
        setAdvancedAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    }
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <Typography variant="h4">Loading your stats...</Typography>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome back, {session?.user?.name || 'Cinephile'}! Here&apos;s your viewing analytics.
          </Typography>

          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  borderTop: `4px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="caption" fontWeight="medium">
                        TOTAL WATCHED
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.totalMoviesWatched + stats.totalTVShowsWatched}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label={`${stats.totalMoviesWatched} movies`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${stats.totalTVShowsWatched} shows`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    <AppIcon icon="mdi:movie-check" size={48} color="primary.main" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  borderTop: `4px solid ${theme.palette.success.main}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="caption" fontWeight="medium">
                        WATCH TIME
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {formatWatchTime(stats.totalWatchTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(stats.totalWatchTime / 60)} total hours
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:clock-time-eight" size={48} color="success.main" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  borderTop: `4px solid ${theme.palette.warning.main}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="caption" fontWeight="medium">
                        AVG RATING
                      </Typography>
                      <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography variant="h3" fontWeight="bold">
                          {((stats.averageMovieRating + stats.averageTVRating) / 2).toFixed(1)}
                        </Typography>
                        <Rating
                          value={(stats.averageMovieRating + stats.averageTVRating) / 2}
                          max={10}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Out of 10
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:star" size={48} color="warning.main" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  borderTop: `4px solid ${theme.palette.info.main}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="caption" fontWeight="medium">
                        CURRENT STREAK
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.currentStreak}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Days in a row
                      </Typography>
                    </Box>
                    <AppIcon icon="mdi:fire" size={48} color="info.main" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 1 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Monthly Activity Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Monthly Activity Trend
                </Typography>
                <LineChart
                  series={[
                    {
                      data: stats.monthlyData.map((m) => m.movies),
                      label: 'Movies',
                      color: theme.palette.primary.main,
                      curve: 'catmullRom',
                    },
                    {
                      data: stats.monthlyData.map((m) => m.tv),
                      label: 'TV Shows',
                      color: theme.palette.secondary.main,
                      curve: 'catmullRom',
                    },
                    {
                      data: stats.monthlyData.map((m) => m.hours),
                      label: 'Hours',
                      color: theme.palette.success.main,
                      curve: 'catmullRom',
                      yAxisId: 'rightAxis',
                    },
                  ]}
                  xAxis={[
                    {
                      data: stats.monthlyData.map((m) => m.month),
                      scaleType: 'point',
                    },
                  ]}
                  yAxis={[
                    { id: 'leftAxis', position: 'left' },
                    { id: 'rightAxis', position: 'right' },
                  ]}
                  height={350}
                  margin={{ left: 50, right: 50, top: 20, bottom: 30 }}
                  sx={{
                    [`& .${axisClasses.left} .${axisClasses.label}`]: {
                      transform: 'translateX(-10px)',
                    },
                  }}
                />
              </Paper>
            </Grid>

            {/* Completion Gauge */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Completion Rate
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 300,
                  }}
                >
                  <Gauge
                    value={stats.completionRate}
                    startAngle={-90}
                    endAngle={90}
                    height={200}
                    text={({ value }) => `${value}%`}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Watched vs Watchlist
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Chip
                      label={`${stats.movieWatchlist + stats.tvWatchlist} in queue`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Genre Distribution */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Top Genres
                </Typography>
                {stats.topGenres.length > 0 && (
                  <PieChart
                    series={[
                      {
                        data: stats.topGenres.map((g, i) => ({
                          id: i,
                          value: g.count,
                          label: g.genre,
                        })),
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { additionalRadius: -10, color: 'gray' },
                      },
                    ]}
                    height={350}
                    margin={{ top: 20, bottom: 30, left: 20, right: 100 }}
                  />
                )}
              </Paper>
            </Grid>

            {/* Rating Distribution */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Rating Distribution
                </Typography>
                <BarChart
                  series={[
                    {
                      data: stats.ratingDistribution.map((r) => r.count),
                      color: theme.palette.warning.main,
                    },
                  ]}
                  xAxis={[
                    {
                      data: stats.ratingDistribution.map((r) => r.rating),
                      scaleType: 'band',
                      label: 'Rating',
                    },
                  ]}
                  yAxis={[{ label: 'Count' }]}
                  height={350}
                  margin={{ left: 40, right: 20, top: 20, bottom: 50 }}
                />
              </Paper>
            </Grid>

            {/* Watch Pattern by Day */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Watch Pattern
                </Typography>
                <BarChart
                  series={[
                    {
                      data: stats.watchPatternByDay.map((d) => d.count),
                      color: theme.palette.info.main,
                    },
                  ]}
                  xAxis={[
                    {
                      data: stats.watchPatternByDay.map((d) => d.day),
                      scaleType: 'band',
                    },
                  ]}
                  height={350}
                  margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
                  layout="vertical"
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Stats and Predictions Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Year Projections */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  {new Date().getFullYear()} Projections
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={4}>
                    <Box textAlign="center">
                      <Typography variant="h2" fontWeight="bold" color="primary">
                        {stats.thisYear}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Watched This Year
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box textAlign="center">
                      <Typography variant="h2" fontWeight="bold" color="secondary">
                        {stats.projectedYearTotal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Projected Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box textAlign="center">
                      <Typography variant="h2" fontWeight="bold" color="success.main">
                        {stats.averageMoviesPerMonth.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Per Month Avg
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        This Week
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.thisWeek} items
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((stats.thisWeek / 7) * 100, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        This Month
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.thisMonth} items
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((stats.thisMonth / 30) * 100, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                      color="secondary"
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Recent Activity */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Recent Activity
                </Typography>
                <List>
                  {recentWatched.map((item, index) => {
                    const isMovie = 'movie' in item;
                    const title = isMovie
                      ? (item as UserMovie).movie?.title
                      : (item as UserTVShow).tvShow?.name;
                    const date = isMovie
                      ? (item as UserMovie).watchedAt
                      : (item as UserTVShow).completedAt;
                    const poster = isMovie
                      ? (item as UserMovie).movie?.posterPath
                      : (item as UserTVShow).tvShow?.posterPath;

                    return (
                      <ListItem
                        key={`${isMovie ? 'movie' : 'tv'}-${item.id}`}
                        divider={index < recentWatched.length - 1}
                        secondaryAction={
                          item.rating && (
                            <Chip label={`${item.rating}★`} size="small" color="warning" />
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={poster ? `${TMDB_CONFIG.IMAGE_BASE_URL}/w92${poster}` : undefined}
                            variant="rounded"
                          >
                            <AppIcon icon={isMovie ? 'mdi:movie' : 'mdi:television'} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={title}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={isMovie ? 'Movie' : 'TV Show'}
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="caption">
                                {date ? dayjs(date).format('MMM D, YYYY') : 'Unknown date'}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Advanced Analytics Section */}
          {advancedAnalytics && (
            <>
              <AnalyticsSection
                genreStats={advancedAnalytics.genreStats || []}
                productionStats={
                  advancedAnalytics.productionStats || {
                    companies: [],
                    countries: [],
                    languages: [],
                    decades: [],
                  }
                }
                viewingHabits={
                  advancedAnalytics.viewingHabits || {
                    bingingScore: 0,
                    diversityScore: 0,
                    completionScore: 0,
                    averageGap: 0,
                    preferredLength: 'Unknown',
                    weekendVsWeekday: { weekend: 50, weekday: 50 },
                  }
                }
                topRatedByGenre={advancedAnalytics.topRatedByGenre || []}
              />

              <Box sx={{ mt: 3 }}>
                <AdvancedCharts
                  runtimeDistribution={advancedAnalytics.runtimeDistribution || {}}
                  hourlyPattern={advancedAnalytics.hourlyPattern || []}
                  monthlyPattern={advancedAnalytics.monthlyPattern || []}
                  seasonalPattern={advancedAnalytics.seasonalPattern || {}}
                  ratingsByYear={advancedAnalytics.ratingsByYear || []}
                  topActors={advancedAnalytics.topActors || []}
                  topDirectors={advancedAnalytics.topDirectors || []}
                />
              </Box>

              {/* Predictive Insights Section */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
                  Predictive Insights & AI Analysis
                </Typography>
                <PredictiveInsights
                  watchedMovies={watchedMoviesData.map((item) => ({
                    id: item.id,
                    movie: item.movie
                      ? {
                          releaseDate: item.movie.releaseDate?.toString(),
                          popularity: item.movie.popularity || undefined,
                          genres: item.movie.genres,
                        }
                      : undefined,
                    rating: item.rating,
                    watchedAt: item.watchedAt?.toString() || null,
                  }))}
                  watchedShows={watchedShowsData.map((item) => ({
                    id: item.id,
                    tvShow: item.tvShow
                      ? {
                          genres: item.tvShow.genres || undefined,
                        }
                      : undefined,
                    rating: item.rating,
                    completedAt: item.completedAt?.toString() || null,
                  }))}
                  genreStats={advancedAnalytics.genreStats || []}
                  viewingHabits={advancedAnalytics.viewingHabits || {}}
                  monthlyPattern={advancedAnalytics.monthlyPattern || []}
                  hourlyPattern={advancedAnalytics.hourlyPattern || []}
                />
              </Box>

              {/* Discovery & Recommendations Section */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
                  Discover & Explore
                </Typography>
                <DiscoveryRecommendations
                  genreStats={advancedAnalytics.genreStats || []}
                  topActors={advancedAnalytics.topActors || []}
                  topDirectors={advancedAnalytics.topDirectors || []}
                  productionStats={
                    advancedAnalytics.productionStats || {
                      countries: [],
                      languages: [],
                      decades: [],
                    }
                  }
                  viewingHabits={advancedAnalytics.viewingHabits || {}}
                />
              </Box>
            </>
          )}

          {/* Achievement Cards */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Achievements & Milestones
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                      }}
                    >
                      <AppIcon icon="mdi:trophy" size={32} color="warning.main" />
                      <Typography variant="h6" fontWeight="bold">
                        {stats.longestStreak}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Longest Streak
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                      }}
                    >
                      <AppIcon icon="mdi:calendar-check" size={32} color="success.main" />
                      <Typography variant="h6" fontWeight="bold">
                        {Math.floor(stats.totalWatchTime / (24 * 60))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Days Watched
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <AppIcon icon="mdi:television-classic" size={32} color="primary.main" />
                      <Typography variant="h6" fontWeight="bold">
                        {stats.totalEpisodesWatched}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Episodes
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                      }}
                    >
                      <AppIcon icon="mdi:tag-multiple" size={32} color="info.main" />
                      <Typography variant="h6" fontWeight="bold">
                        {stats.topGenres.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Genres Explored
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      }}
                    >
                      <AppIcon icon="mdi:bookmark-check" size={32} color="secondary.main" />
                      <Typography variant="h6" fontWeight="bold">
                        {stats.completionRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completion
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      }}
                    >
                      <AppIcon icon="mdi:heart" size={32} color="error.main" />
                      <Typography variant="h6" fontWeight="bold">
                        {stats.topGenres[0]?.genre || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fav Genre
                      </Typography>
                    </Card>
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
