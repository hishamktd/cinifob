'use client';

import React, { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Stack,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { useToast } from '@/hooks/useToast';

interface Episode {
  id: number;
  name: string;
  overview?: string;
  episode_number: number;
  season_number: number;
  air_date?: string;
  runtime?: number;
  still_path?: string;
  vote_average?: number;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview?: string;
  poster_path?: string;
  air_date?: string;
}

interface EpisodeTrackerProps {
  tvShowId: number;
  // tvShowName: string; // Unused prop
  seasons: Season[];
  onEpisodeStatusChange?: (
    seasonNumber: number,
    episodeNumber: number,
    status: 'watched' | 'planned' | null,
  ) => void;
}

interface EpisodeStatus {
  [key: string]: 'watched' | 'planned' | null;
}

export const EpisodeTracker = ({
  tvShowId,
  // tvShowName, // Unused prop
  seasons,
  onEpisodeStatusChange,
}: EpisodeTrackerProps) => {
  const { showToast } = useToast();
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);
  const [episodeStatus, setEpisodeStatus] = useState<EpisodeStatus>({});
  const [seasonEpisodes, setSeasonEpisodes] = useState<{ [key: number]: Episode[] }>({});
  const [loadingSeasons, setLoadingSeasons] = useState<number[]>([]);

  // Episode status would be loaded from the database via API
  useEffect(() => {
    const fetchEpisodeStatuses = async () => {
      try {
        const response = await fetch(`/api/user/tv/episodes?tmdbId=${tvShowId}`);
        if (response.ok) {
          const data = await response.json();
          // Transform the data to our local format
          const transformedStatus: EpisodeStatus = {};
          data.forEach(
            (userEpisode: {
              status: string;
              episode: { seasonNumber: number; episodeNumber: number };
            }) => {
              if (userEpisode.status === 'watched') {
                const key = `${userEpisode.episode.seasonNumber}-${userEpisode.episode.episodeNumber}`;
                transformedStatus[key] = 'watched';
              } else if (userEpisode.status === 'planned') {
                const key = `${userEpisode.episode.seasonNumber}-${userEpisode.episode.episodeNumber}`;
                transformedStatus[key] = 'planned';
              }
            },
          );
          setEpisodeStatus(transformedStatus);
        }
      } catch (error) {
        console.error('Error fetching episode statuses:', error);
      }
    };

    if (tvShowId) {
      fetchEpisodeStatuses();
    }
  }, [tvShowId]);

  const toggleSeasonExpand = async (seasonNumber: number) => {
    if (expandedSeasons.includes(seasonNumber)) {
      setExpandedSeasons(expandedSeasons.filter((s) => s !== seasonNumber));
    } else {
      setExpandedSeasons([...expandedSeasons, seasonNumber]);

      // Load episodes if not already loaded
      if (!seasonEpisodes[seasonNumber]) {
        await loadSeasonEpisodes(seasonNumber);
      }
    }
  };

  const loadSeasonEpisodes = async (seasonNumber: number) => {
    setLoadingSeasons((prev) => [...prev, seasonNumber]);

    try {
      const response = await fetch(`/api/tv/${tvShowId}/season/${seasonNumber}`);
      const data = await response.json();

      if (data.episodes) {
        setSeasonEpisodes((prev) => ({
          ...prev,
          [seasonNumber]: data.episodes,
        }));
      }
    } catch (error) {
      console.error('Error loading season episodes:', error);
      showToast('Failed to load episodes', 'error');
    } finally {
      setLoadingSeasons((prev) => prev.filter((s) => s !== seasonNumber));
    }
  };

  const handleEpisodeStatusChange = async (
    seasonNumber: number,
    episodeNumber: number,
    status: 'watched' | 'planned' | null,
  ) => {
    const key = `${seasonNumber}-${episodeNumber}`;
    const newStatus = {
      ...episodeStatus,
      [key]: status,
    };

    setEpisodeStatus(newStatus);

    try {
      if (status === 'watched' || status === 'planned') {
        // Add or update episode status
        const response = await fetch(`/api/user/tv/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tmdbId: tvShowId,
            seasonNumber,
            episodeNumber,
            watched: status === 'watched',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update episode status');
        }
      } else {
        // Remove episode tracking
        const response = await fetch(
          `/api/user/tv/episodes?tmdbId=${tvShowId}&season=${seasonNumber}&episode=${episodeNumber}`,
          {
            method: 'DELETE',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to remove episode status');
        }
      }
    } catch (error) {
      console.error('Error saving episode status:', error);
      showToast('Failed to update episode status', 'error');
      // Revert the status on error
      setEpisodeStatus(episodeStatus);
      return;
    }

    if (onEpisodeStatusChange) {
      onEpisodeStatusChange(seasonNumber, episodeNumber, status);
    }

    showToast(
      status === 'watched'
        ? 'Marked as watched'
        : status === 'planned'
          ? 'Added to watch plan'
          : 'Removed status',
      'success',
    );
  };

  const toggleEpisodeStatus = (seasonNumber: number, episodeNumber: number) => {
    const key = `${seasonNumber}-${episodeNumber}`;
    const currentStatus = episodeStatus[key];

    let newStatus: 'watched' | 'planned' | null = null;
    if (!currentStatus) {
      newStatus = 'planned';
    } else if (currentStatus === 'planned') {
      newStatus = 'watched';
    } else {
      newStatus = null;
    }

    handleEpisodeStatusChange(seasonNumber, episodeNumber, newStatus);
  };

  const markSeasonAsWatched = async (seasonNumber: number) => {
    const episodes = seasonEpisodes[seasonNumber];
    if (!episodes) return;

    const newStatus = { ...episodeStatus };
    episodes.forEach((episode) => {
      const key = `${seasonNumber}-${episode.episode_number}`;
      newStatus[key] = 'watched';
    });

    setEpisodeStatus(newStatus);

    try {
      // Save all episodes as watched via API
      const promises = episodes.map((episode) =>
        fetch(`/api/user/tv/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tmdbId: tvShowId,
            seasonNumber,
            episodeNumber: episode.episode_number,
            watched: true,
          }),
        }),
      );

      await Promise.all(promises);
      showToast(`Marked Season ${seasonNumber} as watched`, 'success');
    } catch (error) {
      console.error('Error marking season as watched:', error);
      showToast('Failed to mark season as watched', 'error');
      // Revert on error
      setEpisodeStatus(episodeStatus);
    }
  };

  const getSeasonProgress = (seasonNumber: number, episodeCount: number) => {
    let watchedCount = 0;
    let plannedCount = 0;

    for (let i = 1; i <= episodeCount; i++) {
      const key = `${seasonNumber}-${i}`;
      if (episodeStatus[key] === 'watched') watchedCount++;
      else if (episodeStatus[key] === 'planned') plannedCount++;
    }

    return {
      watched: watchedCount,
      planned: plannedCount,
      total: episodeCount,
      percentage: (watchedCount / episodeCount) * 100,
    };
  };

  const formatAirDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Episode Tracker
      </Typography>

      {seasons
        .filter((s) => s.season_number > 0)
        .map((season) => {
          const progress = getSeasonProgress(season.season_number, season.episode_count);
          const isExpanded = expandedSeasons.includes(season.season_number);
          const isLoading = loadingSeasons.includes(season.season_number);

          return (
            <Card key={season.id} sx={{ mb: 2 }}>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <IconButton onClick={() => toggleSeasonExpand(season.season_number)}>
                      <AppIcon icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} />
                    </IconButton>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">{season.name}</Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {season.episode_count} Episodes
                        </Typography>

                        {progress.watched > 0 && (
                          <Chip
                            size="small"
                            icon={<AppIcon icon="mdi:check-circle" size={16} />}
                            label={`${progress.watched} watched`}
                            color="success"
                            variant="outlined"
                          />
                        )}

                        {progress.planned > 0 && (
                          <Chip
                            size="small"
                            icon={<AppIcon icon="mdi:clock-outline" size={16} />}
                            label={`${progress.planned} planned`}
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      {progress.watched > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={progress.percentage}
                          sx={{ mt: 1, height: 6, borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Tooltip title="Mark all as watched">
                    <IconButton
                      onClick={() => {
                        if (!seasonEpisodes[season.season_number]) {
                          loadSeasonEpisodes(season.season_number).then(() => {
                            markSeasonAsWatched(season.season_number);
                          });
                        } else {
                          markSeasonAsWatched(season.season_number);
                        }
                      }}
                    >
                      <AppIcon icon="mdi:check-all" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Collapse in={isExpanded}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <List sx={{ mt: 2 }}>
                      {seasonEpisodes[season.season_number]?.map((episode) => {
                        const key = `${season.season_number}-${episode.episode_number}`;
                        const status = episodeStatus[key];

                        return (
                          <ListItem
                            key={episode.id}
                            sx={{
                              bgcolor: status === 'watched' ? 'action.selected' : 'transparent',
                              borderRadius: 1,
                              mb: 0.5,
                            }}
                          >
                            <ListItemIcon>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  toggleEpisodeStatus(season.season_number, episode.episode_number)
                                }
                              >
                                {status === 'watched' ? (
                                  <AppIcon icon="mdi:check-circle" color="success.main" />
                                ) : status === 'planned' ? (
                                  <AppIcon icon="mdi:clock-outline" color="warning.main" />
                                ) : (
                                  <AppIcon icon="mdi:checkbox-blank-circle-outline" />
                                )}
                              </IconButton>
                            </ListItemIcon>

                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    E{episode.episode_number}
                                  </Typography>
                                  <Typography variant="body2">{episode.name}</Typography>
                                  {episode.air_date && (
                                    <Typography variant="caption" color="text.secondary">
                                      • {formatAirDate(episode.air_date)}
                                    </Typography>
                                  )}
                                </Box>
                              }
                              secondary={
                                episode.overview && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {episode.overview}
                                  </Typography>
                                )
                              }
                            />

                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                {episode.vote_average !== undefined && episode.vote_average > 0 && (
                                  <Chip
                                    size="small"
                                    icon={<AppIcon icon="mdi:star" size={14} />}
                                    label={episode.vote_average.toFixed(1)}
                                    variant="outlined"
                                  />
                                )}
                                {episode.runtime && (
                                  <Chip
                                    size="small"
                                    label={`${episode.runtime}m`}
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Collapse>
              </Box>
            </Card>
          );
        })}
    </Box>
  );
};
