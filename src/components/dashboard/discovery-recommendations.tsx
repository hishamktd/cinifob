'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  IconButton,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { AppIcon } from '@core/components/app-icon';

interface DiscoveryRecommendationsProps {
  genreStats: { name: string; count: number; avgRating: number }[];
  topActors: { name: string; count: number }[];
  topDirectors: { name: string; count: number }[];
  productionStats: {
    countries: { name: string; count: number }[];
    languages: { name: string; count: number }[];
    decades: { decade: string; count: number }[];
  };
  viewingHabits: {
    bingingScore: number;
    diversityScore: number;
    completionScore: number;
    averageGap: number;
    preferredLength: string;
    weekendVsWeekday: { weekend: number; weekday: number };
  };
}

interface RecommendationCard {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'person' | 'genre';
  reason: string;
  confidence: number;
  metadata?: {
    poster?: string;
    rating?: number;
    year?: number;
    genres?: string[];
  };
}

export const DiscoveryRecommendations: React.FC<DiscoveryRecommendationsProps> = ({
  genreStats,
  topActors,
  topDirectors,
  productionStats,
  viewingHabits,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Generate personalized recommendations
  const personalizedRecs = useMemo(() => {
    const recs: RecommendationCard[] = [];

    // Genre-based recommendations
    if (genreStats.length > 0) {
      const topGenre = genreStats[0];
      recs.push({
        id: 'genre-top',
        title: `Trending ${topGenre.name} Films`,
        type: 'genre',
        reason: `Because you've enjoyed ${topGenre.count} ${topGenre.name} titles`,
        confidence: 95,
      });

      // Suggest unexplored genres
      const unexploredGenres = ['Documentary', 'Animation', 'Musical', 'Western', 'War'].filter(
        (g) => !genreStats.find((gs) => gs.name === g),
      );

      if (unexploredGenres.length > 0) {
        recs.push({
          id: 'genre-explore',
          title: `Try ${unexploredGenres[0]} Genre`,
          type: 'genre',
          reason: 'Expand your horizons with new genres',
          confidence: 70,
        });
      }
    }

    // Actor-based recommendations
    if (topActors.length > 0) {
      const favoriteActor = topActors[0];
      recs.push({
        id: 'actor-fav',
        title: `${favoriteActor.name}'s Latest Films`,
        type: 'person',
        reason: `You've watched ${favoriteActor.count} of their movies`,
        confidence: 88,
      });
    }

    // Director-based recommendations
    if (topDirectors.length > 0) {
      const favoriteDirector = topDirectors[0];
      recs.push({
        id: 'director-fav',
        title: `Films by ${favoriteDirector.name}`,
        type: 'person',
        reason: `Based on your appreciation of their work`,
        confidence: 85,
      });
    }

    // Country-based recommendations
    if (productionStats.countries.length > 0) {
      const topCountries = productionStats.countries.slice(0, 3);
      const nonUSCountry = topCountries.find((c) => c.name !== 'United States');
      if (nonUSCountry) {
        recs.push({
          id: 'country-intl',
          title: `Cinema from ${nonUSCountry.name}`,
          type: 'genre',
          reason: 'Discover international perspectives',
          confidence: 75,
        });
      }
    }

    return recs;
  }, [genreStats, topActors, topDirectors, productionStats]);

  // Generate discovery challenges
  const challenges = useMemo(() => {
    return [
      {
        id: 'decade',
        title: 'Decade Explorer',
        description: 'Watch a film from each decade',
        progress: productionStats.decades.length,
        total: 10,
        icon: 'mdi:calendar-clock',
        color: 'primary',
      },
      {
        id: 'genre',
        title: 'Genre Master',
        description: 'Experience all major genres',
        progress: genreStats.length,
        total: 15,
        icon: 'mdi:tag-multiple',
        color: 'secondary',
      },
      {
        id: 'language',
        title: 'Polyglot Viewer',
        description: 'Watch films in 10 different languages',
        progress: productionStats.languages.length,
        total: 10,
        icon: 'mdi:earth',
        color: 'info',
      },
      {
        id: 'marathon',
        title: 'Weekend Warrior',
        description: 'Complete a trilogy in one weekend',
        progress: viewingHabits.bingingScore > 80 ? 1 : 0,
        total: 1,
        icon: 'mdi:trophy',
        color: 'warning',
      },
    ];
  }, [genreStats, productionStats, viewingHabits]);

  // Generate mood-based collections
  const moodCollections = useMemo(() => {
    const collections = [];
    const hour = new Date().getHours();

    if (hour >= 20 || hour < 6) {
      collections.push({
        id: 'night',
        title: 'Late Night Thrillers',
        description: 'Edge-of-your-seat suspense',
        icon: 'mdi:moon-waning-crescent',
        color: 'info',
        tags: ['Thriller', 'Mystery', 'Noir'],
      });
    }

    if (hour >= 6 && hour < 12) {
      collections.push({
        id: 'morning',
        title: 'Morning Motivation',
        description: 'Start your day inspired',
        icon: 'mdi:white-balance-sunny',
        color: 'warning',
        tags: ['Documentary', 'Biography', 'Sports'],
      });
    }

    if (hour >= 12 && hour < 17) {
      collections.push({
        id: 'afternoon',
        title: 'Afternoon Adventures',
        description: 'Epic journeys await',
        icon: 'mdi:compass',
        color: 'success',
        tags: ['Adventure', 'Action', 'Fantasy'],
      });
    }

    if (hour >= 17 && hour < 20) {
      collections.push({
        id: 'evening',
        title: 'Family Time Features',
        description: 'Perfect for everyone',
        icon: 'mdi:home-heart',
        color: 'primary',
        tags: ['Family', 'Comedy', 'Animation'],
      });
    }

    // Add seasonal collection
    const month = new Date().getMonth() + 1;
    if (month === 10) {
      collections.push({
        id: 'halloween',
        title: 'Halloween Specials',
        description: 'Spooky season selections',
        icon: 'mdi:halloween',
        color: 'error',
        tags: ['Horror', 'Thriller', 'Supernatural'],
      });
    } else if (month === 12) {
      collections.push({
        id: 'holiday',
        title: 'Holiday Classics',
        description: 'Festive favorites',
        icon: 'mdi:snowflake',
        color: 'primary',
        tags: ['Romance', 'Family', 'Comedy'],
      });
    }

    return collections;
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 75) return 'primary';
    if (confidence >= 60) return 'warning';
    return 'default';
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
            },
          }}
        >
          <Tab label="For You" icon={<AppIcon icon="mdi:account-heart" />} iconPosition="start" />
          <Tab label="Challenges" icon={<AppIcon icon="mdi:trophy" />} iconPosition="start" />
          <Tab
            label="Mood Collections"
            icon={<AppIcon icon="mdi:palette" />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* For You Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {personalizedRecs.map((rec) => (
            <Grid key={rec.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Chip label={rec.type} size="small" variant="outlined" color="primary" />
                    <Chip
                      label={`${rec.confidence}% match`}
                      size="small"
                      color={getConfidenceColor(rec.confidence)}
                    />
                  </Stack>
                  <Typography variant="h6" gutterBottom>
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rec.reason}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AppIcon icon="mdi:play" />}
                    >
                      Explore
                    </Button>
                    <IconButton size="small">
                      <AppIcon icon="mdi:bookmark-outline" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* AI Suggestion Card */}
          <Grid size={12}>
            <Alert
              severity="info"
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              }}
            >
              <AlertTitle sx={{ fontWeight: 'bold' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AppIcon icon="mdi:robot" />
                  <span>AI Discovery Engine</span>
                </Stack>
              </AlertTitle>
              <Typography variant="body2">
                Based on your viewing patterns, you might enjoy exploring{' '}
                <Chip label="Neo-noir thrillers" size="small" sx={{ mx: 0.5 }} /> from the{' '}
                <Chip label="2010s" size="small" sx={{ mx: 0.5 }} /> featuring{' '}
                <Chip label="ensemble casts" size="small" sx={{ mx: 0.5 }} />.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}

      {/* Challenges Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {challenges.map((challenge) => (
            <Grid key={challenge.id} size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(
                    (
                      theme.palette[challenge.color as keyof typeof theme.palette] as {
                        main: string;
                      }
                    ).main,
                    0.05,
                  )} 0%, transparent 100%)`,
                  borderTop: `3px solid ${
                    (
                      theme.palette[challenge.color as keyof typeof theme.palette] as {
                        main: string;
                      }
                    ).main
                  }`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Avatar sx={{ bgcolor: `${challenge.color}.main`, width: 48, height: 48 }}>
                      <AppIcon icon={challenge.icon} size={24} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {challenge.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {challenge.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {challenge.progress} / {challenge.total}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${(challenge.progress / challenge.total) * 100}%`,
                              height: '100%',
                              bgcolor: `${challenge.color}.main`,
                              borderRadius: 4,
                              transition: 'width 0.3s',
                            }}
                          />
                        </Box>
                      </Box>
                      {challenge.progress === challenge.total && (
                        <Chip
                          label="Completed!"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                          icon={<AppIcon icon="mdi:check" />}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Achievement Unlocked Alert */}
          <Grid size={12}>
            <Alert severity="success" icon={<AppIcon icon="mdi:trophy" />}>
              <AlertTitle>Next Achievement</AlertTitle>
              Watch 3 more documentaries to unlock the &quot;Knowledge Seeker&quot; badge!
            </Alert>
          </Grid>
        </Grid>
      )}

      {/* Mood Collections Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {moodCollections.map((collection) => (
            <Grid key={collection.id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(
                    (
                      theme.palette[collection.color as keyof typeof theme.palette] as {
                        main: string;
                      }
                    ).main,
                    0.1,
                  )} 0%, ${alpha(
                    (
                      theme.palette[collection.color as keyof typeof theme.palette] as {
                        main: string;
                      }
                    ).main,
                    0.05,
                  )} 100%)`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar sx={{ bgcolor: `${collection.color}.main`, width: 56, height: 56 }}>
                      <AppIcon icon={collection.icon} size={28} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{collection.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {collection.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                    {collection.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  <Button
                    fullWidth
                    variant="contained"
                    color={
                      collection.color as
                        | 'primary'
                        | 'secondary'
                        | 'error'
                        | 'warning'
                        | 'info'
                        | 'success'
                    }
                    startIcon={<AppIcon icon="mdi:play-circle" />}
                  >
                    Browse Collection
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Time-based suggestion */}
          <Grid size={12}>
            <Paper sx={{ p: 3, background: alpha(theme.palette.primary.main, 0.02) }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AppIcon icon="mdi:lightbulb" size={32} color="warning.main" />
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Perfect Time Suggestion
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on your usual viewing time, we recommend starting a 2-hour movie now to
                    finish before your typical bedtime.
                  </Typography>
                </Box>
                <Button variant="outlined" startIcon={<AppIcon icon="mdi:clock" />}>
                  Set Reminder
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
