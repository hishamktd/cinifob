'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Chip, LinearProgress, Box } from '@mui/material';

import { AppEmptyState } from '@core/components';
import { ContentCard } from '@/components/content-card';
import { TVShowSortBy } from '@core/enums';
import { UserTVShow } from '@/types';
import { WatchingPageContainer, WatchingGrid } from './styled-components';

interface TVWatchingPageViewProps {
  shows: UserTVShow[];
  sortBy: TVShowSortBy;
  sortedShows: UserTVShow[];
  onSortChange: (sort: TVShowSortBy) => void;
  onMarkCompleted: (show: UserTVShow) => void;
  onContinueWatching: (tmdbId: number) => void;
}

const TVWatchingPageView: React.FC<TVWatchingPageViewProps> = ({
  shows,
  sortBy,
  sortedShows,
  onSortChange,
  onMarkCompleted,
  onContinueWatching,
}) => {
  const router = useRouter();

  const calculateProgress = (show: UserTVShow) => {
    const watched = show.episodesWatched || 0;
    const total = show.totalEpisodes || show.tvShow?.numberOfEpisodes || 0;
    return total > 0 ? (watched / total) * 100 : 0;
  };

  return (
    <WatchingPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <div className="header-content">
            <Typography variant="h4" component="h1" className="page-title">
              Currently Watching
            </Typography>
            <Typography variant="body1" className="page-subtitle">
              {shows.length} {shows.length === 1 ? 'show' : 'shows'} in progress
            </Typography>
          </div>

          <div className="sort-chips-container">
            <Chip
              label="Last Updated"
              onClick={() => onSortChange(TVShowSortBy.NAME_ASC)}
              color={sortBy === TVShowSortBy.NAME_ASC ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Title"
              onClick={() => onSortChange(TVShowSortBy.NAME_ASC)}
              color={sortBy === TVShowSortBy.NAME_ASC ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Progress"
              onClick={() => onSortChange(TVShowSortBy.POPULARITY_DESC)}
              color={sortBy === TVShowSortBy.POPULARITY_DESC ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Rating"
              onClick={() => onSortChange(TVShowSortBy.VOTE_AVERAGE_DESC)}
              color={sortBy === TVShowSortBy.VOTE_AVERAGE_DESC ? 'primary' : 'default'}
              size="small"
            />
          </div>
        </div>

        {shows.length === 0 ? (
          <AppEmptyState
            icon="mdi:television-play"
            title="You're not watching any TV shows"
            description="Start watching a TV show from your watchlist or browse for new shows."
            actionLabel="Browse TV Shows"
            actionIcon="mdi:television-guide"
            onAction={() => router.push('/tv')}
          />
        ) : (
          <WatchingGrid>
            {sortedShows.map((userShow) => {
              const progress = calculateProgress(userShow);
              return (
                <Box key={userShow.tvShow?.tmdbId} className="show-card-wrapper">
                  <ContentCard
                    item={{
                      id: userShow.tvShow?.id || 0,
                      tmdbId: userShow.tvShow?.tmdbId || 0,
                      mediaType: 'tv',
                      title: userShow.tvShow?.name || 'Unknown Title',
                      name: userShow.tvShow?.name,
                      overview: userShow.tvShow?.overview,
                      posterPath: userShow.tvShow?.posterPath,
                      backdropPath: userShow.tvShow?.backdropPath,
                      date: userShow.tvShow?.firstAirDate?.toString(),
                      voteAverage: userShow.tvShow?.voteAverage,
                      voteCount: userShow.tvShow?.voteCount,
                      popularity: userShow.tvShow?.popularity,
                      numberOfSeasons: userShow.tvShow?.numberOfSeasons,
                      numberOfEpisodes: userShow.tvShow?.numberOfEpisodes,
                      genres: userShow.tvShow?.genres,
                    }}
                    isInWatchlist={false}
                    isWatched={false}
                    onAddToWatchlist={() => {
                      if (userShow.tvShow?.tmdbId) {
                        onContinueWatching(userShow.tvShow.tmdbId);
                      }
                    }}
                    onMarkAsWatched={() => onMarkCompleted(userShow)}
                  />
                  <Box className="progress-section">
                    <Box className="progress-info">
                      <Typography variant="caption" color="text.secondary">
                        {userShow.episodesWatched || 0} /{' '}
                        {userShow.totalEpisodes || userShow.tvShow?.numberOfEpisodes || 0} episodes
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      className="progress-bar"
                    />
                    {userShow.currentSeason && userShow.currentEpisode && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="current-episode"
                      >
                        S{userShow.currentSeason}E{userShow.currentEpisode}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </WatchingGrid>
        )}
      </div>
    </WatchingPageContainer>
  );
};

export default TVWatchingPageView;
