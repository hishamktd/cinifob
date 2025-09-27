'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Rating,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { Toast } from '@core/components/toast';
import { RelatedContent } from '@/components/related-content';
import { EpisodeTracker } from '@/components/episode-tracker';
import { TMDB_CONFIG } from '@core/constants';

interface TVShow {
  id?: number;
  tmdbId: number;
  name: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  firstAirDate?: string;
  lastAirDate?: string;
  voteAverage?: number;
  voteCount?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  episodeRunTime?: number[];
  genres?: Array<{ id: number; name: string }>;
  tagline?: string;
  homepage?: string;
  status?: string;
  type?: string;
  originalLanguage?: string;
  originalName?: string;
  popularity?: number;
  inProduction?: boolean;
  networks?: Array<{ id: number; name: string; logo_path?: string }>;
  createdBy?: Array<{ id: number; name: string; profile_path?: string }>;
  seasons?: Array<{
    id: number;
    name: string;
    overview?: string;
    poster_path?: string;
    season_number: number;
    episode_count: number;
    air_date?: string;
  }>;
  videos?: Array<{
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official?: boolean;
  }>;
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
      order: number;
    }>;
    crew?: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path?: string;
    }>;
  };
}

export default function TVShowDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    if (params.tmdbId) {
      fetchTVShowDetails(params.tmdbId as string);
    }
  }, [params.tmdbId]);

  const fetchTVShowDetails = async (tmdbId: string) => {
    try {
      const response = await fetch(`/api/tv/${tmdbId}`);
      const data = await response.json();

      if (data.tvShow) {
        setTVShow(data.tvShow);
      } else if (data.error) {
        setToast({ open: true, message: data.error, severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching TV show details:', error);
      setToast({ open: true, message: 'Failed to load TV show details', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!session) {
      setToast({ open: true, message: 'Please login to add to watchlist', severity: 'warning' });
      return;
    }
    setToast({ open: true, message: 'TV show watchlist support coming soon!', severity: 'info' });
  };

  const handleMarkAsWatched = () => {
    if (!session) {
      setToast({ open: true, message: 'Please login to mark as watched', severity: 'warning' });
      return;
    }
    setToast({ open: true, message: 'TV show tracking support coming soon!', severity: 'info' });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRuntime = (minutes?: number[]) => {
    if (!minutes || minutes.length === 0) return 'N/A';
    const avgRuntime = minutes.reduce((a, b) => a + b, 0) / minutes.length;
    const hours = Math.floor(avgRuntime / 60);
    const mins = Math.round(avgRuntime % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Skeleton variant="text" sx={{ fontSize: '3rem', mb: 2 }} />
                <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (!tvShow) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              TV Show not found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The TV show you&apos;re looking for doesn&apos;t exist or has been removed.
            </Typography>
            <Button variant="contained" href="/browse">
              Browse Content
            </Button>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section with Backdrop */}
      {tvShow.backdropPath && (
        <Box
          sx={{
            position: 'relative',
            height: { xs: 300, md: 500 },
            width: '100%',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)',
              zIndex: 1,
            },
          }}
        >
          <Image
            src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w1280${tvShow.backdropPath}`}
            alt={tvShow.name}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </Box>
      )}

      <Container>
        <Box sx={{ py: 4, mt: tvShow.backdropPath ? -20 : 0, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4}>
            {/* Poster and Actions */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
                {tvShow.posterPath ? (
                  <Box sx={{ position: 'relative', paddingTop: '150%' }}>
                    <Image
                      src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w500${tvShow.posterPath}`}
                      alt={tvShow.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      paddingTop: '150%',
                      position: 'relative',
                      bgcolor: 'action.disabledBackground',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon
                      icon="mdi:television-classic"
                      size={64}
                      style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </Box>
                )}
              </Card>

              {/* Action Buttons */}
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AppIcon icon="mdi:bookmark-plus" />}
                  onClick={handleAddToWatchlist}
                  disabled={actionLoading}
                >
                  Add to Watchlist
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AppIcon icon="mdi:check" />}
                  onClick={handleMarkAsWatched}
                  disabled={actionLoading}
                >
                  Mark as Watched
                </Button>
                {tvShow.homepage && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AppIcon icon="mdi:open-in-new" />}
                    component={Link}
                    href={tvShow.homepage}
                    target="_blank"
                  >
                    Official Website
                  </Button>
                )}
              </Stack>
            </Grid>

            {/* Details */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {tvShow.name}
              </Typography>

              {tvShow.tagline && (
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  &quot;{tvShow.tagline}&quot;
                </Typography>
              )}

              {/* Metadata Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip icon={<AppIcon icon="mdi:television" />} label="TV Series" color="error" />
                {tvShow.voteAverage !== undefined && (
                  <Chip
                    icon={<AppIcon icon="mdi:star" />}
                    label={`${tvShow.voteAverage.toFixed(1)} / 10`}
                    color="warning"
                  />
                )}
                <Chip
                  icon={<AppIcon icon="mdi:calendar" />}
                  label={tvShow.firstAirDate ? new Date(tvShow.firstAirDate).getFullYear() : 'TBA'}
                />
                {tvShow.numberOfSeasons && (
                  <Chip
                    icon={<AppIcon icon="mdi:playlist-play" />}
                    label={`${tvShow.numberOfSeasons} Season${tvShow.numberOfSeasons > 1 ? 's' : ''}`}
                  />
                )}
                {tvShow.status && (
                  <Chip
                    icon={
                      <AppIcon icon={tvShow.inProduction ? 'mdi:broadcast' : 'mdi:broadcast-off'} />
                    }
                    label={tvShow.status}
                    color={tvShow.inProduction ? 'success' : 'default'}
                  />
                )}
              </Box>

              {/* Genres */}
              {tvShow.genres && tvShow.genres.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tvShow.genres.map((genre) => (
                      <Chip key={genre.id} label={genre.name} variant="outlined" size="small" />
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                  <Tab label="Overview" />
                  <Tab label="Episode Tracker" />
                  <Tab label="Seasons" />
                  <Tab label="Cast & Crew" />
                  <Tab label="Videos" />
                  <Tab label="Details" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              {tabValue === 0 && (
                <Box sx={{ py: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Synopsis
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {tvShow.overview || 'No overview available.'}
                  </Typography>

                  {tvShow.createdBy && tvShow.createdBy.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Created By
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        {tvShow.createdBy.map((creator) => (
                          <Chip
                            key={creator.id}
                            avatar={
                              creator.profile_path ? (
                                <Avatar
                                  src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${creator.profile_path}`}
                                />
                              ) : (
                                <Avatar>{creator.name[0]}</Avatar>
                              )
                            }
                            label={creator.name}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              )}

              {tabValue === 1 && (
                <Box sx={{ py: 3 }}>
                  <EpisodeTracker
                    tvShowId={tvShow.tmdbId}
                    tvShowName={tvShow.name}
                    seasons={tvShow.seasons || []}
                    onEpisodeStatusChange={(season, episode, status) => {
                      console.log(`Episode ${season}x${episode} marked as ${status}`);
                    }}
                  />
                </Box>
              )}

              {tabValue === 2 && (
                <Box sx={{ py: 3 }}>
                  {tvShow.seasons && tvShow.seasons.length > 0 ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Seasons ({tvShow.seasons.length})
                      </Typography>
                      {tvShow.seasons.map((season) => (
                        <Accordion key={season.id}>
                          <AccordionSummary expandIcon={<AppIcon icon="mdi:chevron-down" />}>
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}
                            >
                              {season.poster_path && (
                                <Avatar
                                  variant="rounded"
                                  src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${season.poster_path}`}
                                  sx={{ width: 60, height: 90 }}
                                />
                              )}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">{season.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {season.episode_count} Episodes
                                  {season.air_date &&
                                    ` • ${new Date(season.air_date).getFullYear()}`}
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              {season.overview || 'No overview available for this season.'}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </>
                  ) : (
                    <Typography color="text.secondary">No season information available</Typography>
                  )}
                </Box>
              )}

              {tabValue === 3 && (
                <Box sx={{ py: 3 }}>
                  {tvShow.credits?.cast && tvShow.credits.cast.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Cast
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {tvShow.credits.cast.slice(0, 12).map((person) => (
                          <Grid key={person.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ p: 2 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                  src={
                                    person.profile_path
                                      ? `${TMDB_CONFIG.IMAGE_BASE_URL}/w92${person.profile_path}`
                                      : undefined
                                  }
                                  sx={{ width: 56, height: 56 }}
                                >
                                  {!person.profile_path && person.name[0]}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {person.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {person.character}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  {tvShow.credits?.crew && tvShow.credits.crew.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Crew
                      </Typography>
                      <Grid container spacing={2}>
                        {tvShow.credits.crew
                          .filter((member) =>
                            ['Director', 'Executive Producer', 'Producer', 'Writer'].includes(
                              member.job,
                            ),
                          )
                          .slice(0, 8)
                          .map((person) => (
                            <Grid
                              key={`${person.id}-${person.job}`}
                              size={{ xs: 12, sm: 6, md: 4 }}
                            >
                              <Card sx={{ p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Avatar
                                    src={
                                      person.profile_path
                                        ? `${TMDB_CONFIG.IMAGE_BASE_URL}/w92${person.profile_path}`
                                        : undefined
                                    }
                                    sx={{ width: 56, height: 56 }}
                                  >
                                    {!person.profile_path && person.name[0]}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="subtitle2" noWrap>
                                      {person.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {person.job}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </>
                  )}
                </Box>
              )}

              {tabValue === 4 && (
                <Box sx={{ py: 3 }}>
                  {tvShow.videos && tvShow.videos.length > 0 ? (
                    <Grid container spacing={2}>
                      {tvShow.videos
                        .filter((video) => video.site === 'YouTube')
                        .slice(0, 6)
                        .map((video) => (
                          <Grid key={video.id} size={{ xs: 12, sm: 6 }}>
                            <Card>
                              <Box
                                sx={{
                                  position: 'relative',
                                  paddingTop: '56.25%',
                                  bgcolor: 'black',
                                }}
                              >
                                <iframe
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                  }}
                                  src={`https://www.youtube.com/embed/${video.key}`}
                                  title={video.name}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </Box>
                              <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle2" noWrap>
                                  {video.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {video.type} • {video.official ? 'Official' : 'Unofficial'}
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">No videos available</Typography>
                  )}
                </Box>
              )}

              {tabValue === 5 && (
                <Box sx={{ py: 3 }}>
                  <Grid container spacing={2}>
                    {tvShow.type && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body1">{tvShow.type}</Typography>
                      </Grid>
                    )}
                    {tvShow.episodeRunTime && tvShow.episodeRunTime.length > 0 && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Episode Runtime
                        </Typography>
                        <Typography variant="body1">
                          {formatRuntime(tvShow.episodeRunTime)}
                        </Typography>
                      </Grid>
                    )}
                    {tvShow.numberOfEpisodes && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Episodes
                        </Typography>
                        <Typography variant="body1">{tvShow.numberOfEpisodes}</Typography>
                      </Grid>
                    )}
                    {tvShow.firstAirDate && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          First Air Date
                        </Typography>
                        <Typography variant="body1">{formatDate(tvShow.firstAirDate)}</Typography>
                      </Grid>
                    )}
                    {tvShow.lastAirDate && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Air Date
                        </Typography>
                        <Typography variant="body1">{formatDate(tvShow.lastAirDate)}</Typography>
                      </Grid>
                    )}
                    {tvShow.originalLanguage && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Original Language
                        </Typography>
                        <Typography variant="body1">
                          {tvShow.originalLanguage.toUpperCase()}
                        </Typography>
                      </Grid>
                    )}
                    {tvShow.originalName && tvShow.originalName !== tvShow.name && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Original Name
                        </Typography>
                        <Typography variant="body1">{tvShow.originalName}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  {tvShow.networks && tvShow.networks.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Networks
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        {tvShow.networks.map((network) => (
                          <Chip
                            key={network.id}
                            label={network.name}
                            avatar={
                              network.logo_path ? (
                                <Avatar
                                  src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${network.logo_path}`}
                                />
                              ) : undefined
                            }
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Related Content Section */}
      {tvShow && (
        <Container sx={{ mt: 4 }}>
          <RelatedContent
            contentId={tvShow.tmdbId}
            contentType="tv"
            title="Similar TV Shows"
            maxItems={8}
            showTypeFilter={true}
          />
        </Container>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </MainLayout>
  );
}
