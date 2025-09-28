'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  alpha,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { AppIcon } from '@core/components/app-icon';

interface GenreStats {
  name: string;
  count: number;
  percentage: number;
  avgRating: number;
  totalHours: number;
}

interface ProductionStats {
  companies: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  languages: { name: string; count: number }[];
  decades: { decade: string; count: number }[];
}

interface ViewingHabits {
  bingingScore: number; // How many items watched in short periods
  diversityScore: number; // Genre variety
  completionScore: number; // % of started content finished
  averageGap: number; // Days between watching
  preferredLength: string; // Short/Medium/Long movies
  weekendVsWeekday: { weekend: number; weekday: number };
}

interface AnalyticsSectionProps {
  genreStats: GenreStats[];
  productionStats: ProductionStats;
  viewingHabits: ViewingHabits;
  topRatedByGenre: { genre: string; title: string; rating: number }[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  genreStats,
  productionStats,
  viewingHabits,
  topRatedByGenre,
}) => {
  const theme = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Grid container spacing={3}>
      {/* Genre Deep Dive */}
      <Grid size={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Genre Analysis Deep Dive
          </Typography>
          <Grid container spacing={3}>
            {/* Genre Stats Table */}
            <Grid size={{ xs: 12, md: 8 }}>
              <List>
                {genreStats.slice(0, 5).map((genre, index) => (
                  <ListItem
                    key={genre.name}
                    divider={index < genreStats.length - 1}
                    sx={{
                      bgcolor:
                        index === 0 ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: index === 0 ? 'primary.main' : 'action.selected',
                          width: 32,
                          height: 32,
                          fontSize: '0.875rem',
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {genre.name}
                          </Typography>
                          {index === 0 && (
                            <Chip
                              label="Favorite"
                              size="small"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="caption" color="text.secondary">
                              {genre.count} watched ({genre.percentage.toFixed(1)}%)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {genre.totalHours}h total
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="warning.main">
                              ★ {genre.avgRating.toFixed(1)} avg
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={genre.percentage}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Top Rated by Genre */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Top Rated by Genre
              </Typography>
              <Stack spacing={1}>
                {topRatedByGenre.slice(0, 5).map((item) => (
                  <Card key={item.genre} variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" color="primary" fontWeight="medium">
                        {item.genre}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {item.title}
                      </Typography>
                      <Chip
                        label={`★ ${item.rating}`}
                        size="small"
                        color="warning"
                        sx={{ height: 18, mt: 0.5 }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Production Insights */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Production Insights
          </Typography>
          <Grid container spacing={2}>
            {/* Top Production Companies */}
            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Top Production Companies
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {productionStats.companies.slice(0, 8).map((company) => (
                  <Chip
                    key={company.name}
                    label={`${company.name} (${company.count})`}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Countries */}
            <Grid size={6}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Countries
              </Typography>
              <Stack spacing={0.5}>
                {productionStats.countries.slice(0, 5).map((country) => (
                  <Box key={country.name}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">{country.name}</Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {country.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(country.count / productionStats.countries[0].count) * 100}
                      sx={{ height: 3, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Languages */}
            <Grid size={6}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Languages
              </Typography>
              <Stack spacing={0.5}>
                {productionStats.languages.slice(0, 5).map((language) => (
                  <Box key={language.name}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">{language.name}</Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {language.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(language.count / productionStats.languages[0].count) * 100}
                      sx={{ height: 3, borderRadius: 1 }}
                      color="secondary"
                    />
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>

          {/* Decades Chart */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Content by Decade
            </Typography>
            <BarChart
              series={[
                {
                  data: productionStats.decades.map((d) => d.count),
                  color: theme.palette.info.main,
                },
              ]}
              xAxis={[
                {
                  data: productionStats.decades.map((d) => d.decade),
                  scaleType: 'band',
                },
              ]}
              height={150}
              margin={{ left: 30, right: 10, top: 10, bottom: 25 }}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Viewing Habits Score */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Viewing Habits Profile
          </Typography>

          <Grid container spacing={2}>
            {/* Score Cards */}
            <Grid size={6}>
              <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AppIcon icon="mdi:speedometer" size={20} color="primary.main" />
                    <Typography variant="subtitle2">Binging Score</Typography>
                  </Stack>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={getScoreColor(viewingHabits.bingingScore)}
                  >
                    {viewingHabits.bingingScore}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={viewingHabits.bingingScore}
                    sx={{ height: 4, borderRadius: 2, mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={6}>
              <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AppIcon icon="mdi:palette" size={20} color="secondary.main" />
                    <Typography variant="subtitle2">Diversity Score</Typography>
                  </Stack>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={getScoreColor(viewingHabits.diversityScore)}
                  >
                    {viewingHabits.diversityScore}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={viewingHabits.diversityScore}
                    sx={{ height: 4, borderRadius: 2, mt: 1 }}
                    color="secondary"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={6}>
              <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AppIcon icon="mdi:check-all" size={20} color="success.main" />
                    <Typography variant="subtitle2">Completion Score</Typography>
                  </Stack>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={getScoreColor(viewingHabits.completionScore)}
                  >
                    {viewingHabits.completionScore}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={viewingHabits.completionScore}
                    sx={{ height: 4, borderRadius: 2, mt: 1 }}
                    color="success"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={6}>
              <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AppIcon icon="mdi:calendar-range" size={20} color="info.main" />
                    <Typography variant="subtitle2">Watch Frequency</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {viewingHabits.averageGap}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    days between watches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Preferences */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Preferred Content Length
                  </Typography>
                  <Chip
                    label={viewingHabits.preferredLength}
                    color="primary"
                    variant="outlined"
                    icon={<AppIcon icon="mdi:timer" />}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Weekend vs Weekday
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        Weekend
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={viewingHabits.weekendVsWeekday.weekend}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="primary"
                      />
                      <Typography variant="caption" fontWeight="bold">
                        {viewingHabits.weekendVsWeekday.weekend}%
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        Weekday
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={viewingHabits.weekendVsWeekday.weekday}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="secondary"
                      />
                      <Typography variant="caption" fontWeight="bold">
                        {viewingHabits.weekendVsWeekday.weekday}%
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};
