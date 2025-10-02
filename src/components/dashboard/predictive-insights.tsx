'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  Tooltip,
} from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { AppIcon } from '@core/components/app-icon';
import dayjs from 'dayjs';

interface PredictiveInsightsProps {
  watchedMovies: Array<{
    id: number;
    movie?: {
      releaseDate?: string;
      popularity?: number;
      genres?: Array<{ name: string } | string>;
    };
    rating?: number | null;
    watchedAt?: string | null;
  }>;
  watchedShows: Array<{
    id: number;
    tvShow?: {
      genres?: Array<{ name: string } | string>;
    };
    rating?: number | null;
    completedAt?: string | null;
  }>;
  genreStats: { name: string; count: number; avgRating: number }[];
  viewingHabits: {
    bingingScore: number;
    diversityScore: number;
    completionScore: number;
    averageGap: number;
    preferredLength: string;
    weekendVsWeekday: { weekend: number; weekday: number };
  };
  monthlyPattern: number[];
  hourlyPattern: number[];
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({
  watchedMovies,
  watchedShows,
  genreStats,
  viewingHabits,
  monthlyPattern,
  hourlyPattern,
}) => {
  const theme = useTheme();

  // Calculate taste profile
  const tasteProfile = useMemo(() => {
    const profile = {
      mainstream: 0,
      indie: 0,
      classic: 0,
      modern: 0,
      action: 0,
      drama: 0,
      comedy: 0,
      scifi: 0,
      horror: 0,
      romance: 0,
    };

    // Analyze genre preferences
    genreStats.forEach((genre) => {
      const normalizedCount = Math.min(genre.count / 10, 10);
      switch (genre.name.toLowerCase()) {
        case 'action':
          profile.action = normalizedCount;
          break;
        case 'drama':
          profile.drama = normalizedCount;
          break;
        case 'comedy':
          profile.comedy = normalizedCount;
          break;
        case 'science fiction':
        case 'sci-fi':
          profile.scifi = normalizedCount;
          break;
        case 'horror':
        case 'thriller':
          profile.horror = normalizedCount;
          break;
        case 'romance':
          profile.romance = normalizedCount;
          break;
      }
    });

    // Analyze release year patterns
    const currentYear = new Date().getFullYear();
    const avgYear =
      watchedMovies.reduce((sum, m) => {
        const year = m.movie?.releaseDate
          ? new Date(m.movie.releaseDate).getFullYear()
          : currentYear;
        return sum + year;
      }, 0) / Math.max(watchedMovies.length, 1);

    if (avgYear < currentYear - 20) {
      profile.classic = 8;
      profile.modern = 2;
    } else if (avgYear < currentYear - 10) {
      profile.classic = 5;
      profile.modern = 5;
    } else {
      profile.classic = 2;
      profile.modern = 8;
    }

    // Analyze popularity patterns
    const avgPopularity =
      watchedMovies.reduce((sum, m) => sum + (m.movie?.popularity || 0), 0) /
      Math.max(watchedMovies.length, 1);
    if (avgPopularity > 50) {
      profile.mainstream = 8;
      profile.indie = 2;
    } else if (avgPopularity > 20) {
      profile.mainstream = 5;
      profile.indie = 5;
    } else {
      profile.mainstream = 2;
      profile.indie = 8;
    }

    return profile;
  }, [watchedMovies, genreStats]);

  // Predict next watch time
  const predictNextWatchTime = useMemo(() => {
    const peakHour = hourlyPattern.indexOf(Math.max(...hourlyPattern));

    const today = dayjs();
    const nextWatchHour =
      today.hour() < peakHour ? today.hour(peakHour) : today.add(1, 'day').hour(peakHour);

    return {
      time: nextWatchHour.format('h:mm A'),
      day: nextWatchHour.format('dddd'),
      confidence: Math.min(
        (Math.max(...hourlyPattern) / hourlyPattern.reduce((a, b) => a + b, 1)) * 100,
        95,
      ),
    };
  }, [hourlyPattern]);

  // Generate recommendations based on patterns
  const recommendations = useMemo(() => {
    const recs = [];

    // Genre-based recommendations
    const topGenre = genreStats[0];
    if (topGenre) {
      recs.push({
        type: 'genre',
        title: `More ${topGenre.name} content`,
        reason: `You've watched ${topGenre.count} ${topGenre.name} titles`,
        icon: 'mdi:tag',
        color: 'primary',
      });
    }

    // Time-based recommendations
    if (viewingHabits.bingingScore > 70) {
      recs.push({
        type: 'series',
        title: 'Try a limited series',
        reason: 'Your binging score suggests you enjoy continuous viewing',
        icon: 'mdi:television-play',
        color: 'secondary',
      });
    }

    // Diversity recommendations
    if (viewingHabits.diversityScore < 50) {
      recs.push({
        type: 'explore',
        title: 'Explore new genres',
        reason: 'Broaden your horizons with different content types',
        icon: 'mdi:compass',
        color: 'info',
      });
    }

    // Completion recommendations
    if (viewingHabits.completionScore < 60) {
      recs.push({
        type: 'watchlist',
        title: 'Clear your watchlist',
        reason: `You have items waiting to be watched`,
        icon: 'mdi:playlist-check',
        color: 'warning',
      });
    }

    return recs;
  }, [genreStats, viewingHabits]);

  // Calculate viewing velocity
  const viewingVelocity = useMemo(() => {
    const lastMonthCount = monthlyPattern[monthlyPattern.length - 1] || 0;
    const previousMonthCount = monthlyPattern[monthlyPattern.length - 2] || 0;
    const change =
      previousMonthCount > 0
        ? ((lastMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

    return {
      current: lastMonthCount,
      previous: previousMonthCount,
      change: change,
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
    };
  }, [monthlyPattern]);

  // Predict genre fatigue
  const genreFatigue = useMemo(() => {
    const recentGenres: Record<string, number> = {};
    const last10 = [...watchedMovies, ...watchedShows]
      .sort((a, b) => {
        const dateA =
          'watchedAt' in a
            ? a.watchedAt
            : 'completedAt' in a
              ? (a as { completedAt?: string | Date | null }).completedAt
              : null;
        const dateB =
          'watchedAt' in b
            ? b.watchedAt
            : 'completedAt' in b
              ? (b as { completedAt?: string | Date | null }).completedAt
              : null;
        return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
      })
      .slice(0, 10);

    last10.forEach((item) => {
      const genres =
        'movie' in item
          ? item.movie?.genres
          : 'tvShow' in item
            ? (item as { tvShow?: { genres?: (string | { name: string })[] } }).tvShow?.genres
            : undefined;
      if (genres && Array.isArray(genres)) {
        genres.forEach((g) => {
          const name = typeof g === 'string' ? g : g.name;
          if (name) {
            recentGenres[name] = (recentGenres[name] || 0) + 1;
          }
        });
      }
    });

    const overRepresented = Object.entries(recentGenres)
      .filter(([, count]) => count >= 5)
      .map(([genre, count]) => ({ genre, count, percentage: (count / 10) * 100 }));

    return overRepresented;
  }, [watchedMovies, watchedShows]);

  return (
    <Grid container spacing={3}>
      {/* Taste Profile Radar */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Your Taste Profile
          </Typography>
          <RadarChart
            series={[
              {
                data: [
                  tasteProfile.action,
                  tasteProfile.drama,
                  tasteProfile.comedy,
                  tasteProfile.scifi,
                  tasteProfile.horror,
                  tasteProfile.romance,
                ],
                label: 'Your Preferences',
                color: theme.palette.primary.main,
              },
            ]}
            radar={{
              metrics: ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Romance'],
              max: 10,
            }}
            height={350}
            width={350}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          />
        </Paper>
      </Grid>

      {/* AI Predictions */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            AI Predictions
          </Typography>
          <Stack spacing={2}>
            {/* Next Watch Time */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <AppIcon icon="mdi:clock-outline" />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2">Most Likely Watch Time</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {predictNextWatchTime.day} at {predictNextWatchTime.time}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={predictNextWatchTime.confidence}
                      sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {predictNextWatchTime.confidence.toFixed(0)}% confidence
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Viewing Velocity */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor:
                        viewingVelocity.trend === 'increasing'
                          ? 'success.main'
                          : viewingVelocity.trend === 'decreasing'
                            ? 'error.main'
                            : 'warning.main',
                    }}
                  >
                    <AppIcon
                      icon={
                        viewingVelocity.trend === 'increasing'
                          ? 'mdi:trending-up'
                          : viewingVelocity.trend === 'decreasing'
                            ? 'mdi:trending-down'
                            : 'mdi:trending-neutral'
                      }
                    />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2">Viewing Velocity</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {viewingVelocity.current} this month
                      </Typography>
                      <Chip
                        label={`${viewingVelocity.change > 0 ? '+' : ''}${viewingVelocity.change.toFixed(0)}%`}
                        size="small"
                        color={
                          viewingVelocity.trend === 'increasing'
                            ? 'success'
                            : viewingVelocity.trend === 'decreasing'
                              ? 'error'
                              : 'warning'
                        }
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      vs {viewingVelocity.previous} last month
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Taste Evolution */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <AppIcon icon="mdi:chart-timeline-variant" />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2">Taste Evolution</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={
                          tasteProfile.mainstream > tasteProfile.indie ? 'Mainstream' : 'Indie'
                        }
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={tasteProfile.modern > tasteProfile.classic ? 'Modern' : 'Classic'}
                        size="small"
                        color="secondary"
                      />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      Based on your recent viewing history
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Paper>
      </Grid>

      {/* Smart Recommendations */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Smart Recommendations
          </Typography>
          <List>
            {recommendations.map((rec, index) => (
              <ListItem key={index} divider={index < recommendations.length - 1}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: `${rec.color}.main`, width: 32, height: 32 }}>
                    <AppIcon icon={rec.icon} size={16} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={rec.title} secondary={rec.reason} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Genre Fatigue Alert */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Content Balance Analysis
          </Typography>
          {genreFatigue.length > 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Genre Concentration Detected</AlertTitle>
              You&apos;ve been watching a lot of {genreFatigue[0].genre} content lately (
              {genreFatigue[0].percentage}% of last 10)
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Well Balanced</AlertTitle>
              Your recent viewing shows good variety across different genres
            </Alert>
          )}

          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Suggested Mix for Optimal Enjoyment
          </Typography>
          <Stack spacing={1}>
            {genreStats.slice(0, 4).map((genre, index) => {
              const optimal = index === 0 ? 40 : index === 1 ? 30 : index === 2 ? 20 : 10;
              const current = (genre.count / watchedMovies.length) * 100;
              const diff = current - optimal;

              return (
                <Box key={genre.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{genre.name}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Current: {current.toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="primary">
                        Optimal: {optimal}%
                      </Typography>
                      {Math.abs(diff) > 10 && (
                        <Tooltip
                          title={diff > 0 ? 'Consider watching less' : 'Consider watching more'}
                        >
                          <AppIcon
                            icon={diff > 0 ? 'mdi:arrow-down' : 'mdi:arrow-up'}
                            size={14}
                            color={diff > 0 ? 'error.main' : 'success.main'}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(current, 100)}
                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Grid>

      {/* Viewing Pattern Forecast */}
      <Grid size={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            30-Day Activity Forecast
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Based on your historical patterns and current trends
          </Typography>
          <Box sx={{ height: 300 }}>
            <LineChart
              series={[
                {
                  data: monthlyPattern,
                  label: 'Historical',
                  color: theme.palette.primary.main,
                  area: true,
                },
                {
                  data: [
                    ...monthlyPattern.slice(-3),
                    Math.round(monthlyPattern[monthlyPattern.length - 1] * 1.1),
                    Math.round(monthlyPattern[monthlyPattern.length - 1] * 1.15),
                    Math.round(monthlyPattern[monthlyPattern.length - 1] * 1.08),
                  ],
                  label: 'Predicted',
                  color: theme.palette.secondary.main,
                  area: true,
                },
              ]}
              xAxis={[
                {
                  data: [
                    ...Array.from(
                      { length: monthlyPattern.length },
                      (_, i) => `Past ${monthlyPattern.length - i}`,
                    ),
                    'Next 1',
                    'Next 2',
                    'Next 3',
                  ],
                  scaleType: 'point',
                },
              ]}
              height={280}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
