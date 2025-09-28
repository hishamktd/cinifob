'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material';
import { LineChart, ScatterChart, PieChart, SparkLineChart } from '@mui/x-charts';
import { AppIcon } from '@core/components/app-icon';

interface AdvancedChartsProps {
  runtimeDistribution: Record<string, number>;
  hourlyPattern: number[];
  monthlyPattern: number[];
  seasonalPattern: Record<string, number>;
  ratingsByYear: { year: number; avgRating: number; count: number }[];
  topActors: { name: string; count: number }[];
  topDirectors: { name: string; count: number }[];
}

export const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  runtimeDistribution,
  hourlyPattern,
  monthlyPattern,
  seasonalPattern,
  ratingsByYear,
  topActors,
  topDirectors,
}) => {
  const theme = useTheme();

  const hours = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
  );

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Create heatmap data for hourly pattern
  const maxHourly = Math.max(...hourlyPattern);
  const heatmapData = hourlyPattern.map((value, hour) => ({
    hour: hours[hour],
    value,
    intensity: value / maxHourly,
  }));

  // Scatter plot data for rating vs year
  const scatterData = ratingsByYear.flatMap((item) =>
    Array(item.count)
      .fill(null)
      .map(() => ({
        x: item.year,
        y: item.avgRating + (Math.random() - 0.5) * 0.5, // Add jitter for visibility
        id: Math.random(),
      })),
  );

  return (
    <Grid container spacing={3}>
      {/* Runtime Distribution - Donut Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Movie Runtime Distribution
          </Typography>
          <PieChart
            series={[
              {
                data: Object.entries(runtimeDistribution).map(([label, value], index) => ({
                  id: index,
                  value,
                  label,
                })),
                innerRadius: 60,
                outerRadius: 120,
                paddingAngle: 2,
                cornerRadius: 4,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 55, additionalRadius: -5, color: 'gray' },
              },
            ]}
            height={350}
            slotProps={{
              legend: {
                direction: 'column',
                position: { vertical: 'middle', horizontal: 'right' },
                padding: 0,
              },
            }}
          />
        </Paper>
      </Grid>

      {/* Seasonal Pattern - Radial Bar Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Seasonal Viewing Pattern
          </Typography>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}
          >
            <PieChart
              series={[
                {
                  data: Object.entries(seasonalPattern).map(([season, count], index) => ({
                    id: index,
                    value: count,
                    label: season,
                    color: {
                      Spring: theme.palette.success.light,
                      Summer: theme.palette.warning.light,
                      Fall: theme.palette.error.light,
                      Winter: theme.palette.info.light,
                    }[season],
                  })),
                  innerRadius: 0,
                  outerRadius: 100,
                  cx: 175,
                  cy: 175,
                },
              ]}
              width={350}
              height={350}
            />
            <Stack spacing={1} sx={{ ml: 2 }}>
              {Object.entries(seasonalPattern).map(([season, count]) => (
                <Chip
                  key={season}
                  icon={
                    <AppIcon
                      icon={
                        {
                          Spring: 'mdi:flower',
                          Summer: 'mdi:weather-sunny',
                          Fall: 'mdi:leaf',
                          Winter: 'mdi:snowflake',
                        }[season] || 'mdi:calendar'
                      }
                      size={16}
                    />
                  }
                  label={`${season}: ${count}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      </Grid>

      {/* Hourly Heatmap */}
      <Grid size={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            24-Hour Viewing Heatmap
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 0.5, minWidth: 900, py: 2 }}>
              {heatmapData.map((data) => (
                <Tooltip key={data.hour} title={`${data.hour}: ${data.value} views`}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 80,
                      bgcolor: theme.palette.primary.main,
                      opacity: 0.2 + data.intensity * 0.8,
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'common.white', fontWeight: 'bold', mb: 0.5 }}
                    >
                      {data.value}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '10px', color: 'common.white' }}>
                      {data.hour}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Peak viewing times highlighted in darker shades
          </Typography>
        </Paper>
      </Grid>

      {/* Monthly Pattern - Area Chart */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Monthly Viewing Pattern (Year Overview)
          </Typography>
          <LineChart
            series={[
              {
                data: monthlyPattern,
                label: 'Views',
                area: true,
                color: theme.palette.primary.main,
                curve: 'catmullRom',
                showMark: true,
              },
            ]}
            xAxis={[
              {
                data: months,
                scaleType: 'point',
              },
            ]}
            height={350}
            margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
          />
        </Paper>
      </Grid>

      {/* Rating Evolution - Scatter Plot */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Rating Evolution Over Years
          </Typography>
          {ratingsByYear.length > 0 ? (
            <ScatterChart
              series={[
                {
                  data: scatterData.map((d) => ({ x: d.x, y: d.y, id: d.id })),
                  label: 'Ratings',
                  color: theme.palette.warning.main,
                },
              ]}
              xAxis={[
                {
                  label: 'Year',
                  min: Math.min(...ratingsByYear.map((r) => r.year)) - 1,
                  max: Math.max(...ratingsByYear.map((r) => r.year)) + 1,
                },
              ]}
              yAxis={[
                {
                  label: 'Rating',
                  min: 0,
                  max: 10,
                },
              ]}
              height={350}
              margin={{ left: 50, right: 20, top: 20, bottom: 50 }}
            />
          ) : (
            <Box
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}
            >
              <Typography variant="body2" color="text.secondary">
                No rating data available
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Top Actors and Directors */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Most Watched Actors
          </Typography>
          <Box sx={{ height: 340, overflowY: 'auto' }}>
            {topActors.map((actor, index) => (
              <Card key={actor.name} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: index < 3 ? 'primary.main' : 'action.selected',
                        width: 32,
                        height: 32,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {actor.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {Array.from({ length: Math.min(actor.count, 5) }).map((_, i) => (
                          <AppIcon key={i} icon="mdi:movie" size={12} color="primary.main" />
                        ))}
                        {actor.count > 5 && (
                          <Typography variant="caption" color="text.secondary">
                            +{actor.count - 5}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Chip
                      label={`${actor.count} movies`}
                      size="small"
                      color={index < 3 ? 'primary' : 'default'}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Favorite Directors
          </Typography>
          <Box sx={{ height: 340, overflowY: 'auto' }}>
            {topDirectors.map((director, index) => (
              <Card key={director.name} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: index < 3 ? 'secondary.main' : 'action.selected',
                        width: 32,
                        height: 32,
                      }}
                    >
                      <AppIcon icon="mdi:movie-roll" size={16} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {director.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Director
                      </Typography>
                    </Box>
                    <Chip
                      label={`${director.count} films`}
                      size="small"
                      color={index < 3 ? 'secondary' : 'default'}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Mini Sparkline Cards */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom fontWeight="medium">
          Quick Stats Trends
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Weekly Activity
                </Typography>
                <SparkLineChart
                  data={hourlyPattern.slice(0, 7)}
                  height={50}
                  showHighlight
                  showTooltip
                  colors={[theme.palette.primary.main]}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Monthly Trend
                </Typography>
                <SparkLineChart
                  data={monthlyPattern.slice(-6)}
                  height={50}
                  showHighlight
                  showTooltip
                  colors={[theme.palette.success.main]}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Rating Trend
                </Typography>
                <SparkLineChart
                  data={ratingsByYear.map((r) => r.avgRating)}
                  height={50}
                  showHighlight
                  showTooltip
                  colors={[theme.palette.warning.main]}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Peak Hours
                </Typography>
                <SparkLineChart
                  data={hourlyPattern.slice(18, 24)}
                  height={50}
                  showHighlight
                  showTooltip
                  colors={[theme.palette.info.main]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
