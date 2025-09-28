'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { AppButton, AppEmptyState } from '@core/components';
import { ContentCard } from '@/components/content-card';
import { TVShowSortBy } from '@core/enums';
import { UserTVShow } from '@/types';
import { WatchlistPageContainer, WatchlistGrid } from './styled-components';

interface TVWatchlistPageViewProps {
  shows: UserTVShow[];
  sortBy: TVShowSortBy;
  sortedShows: UserTVShow[];
  ratingDialog: {
    open: boolean;
    show: UserTVShow | null;
  };
  onSortChange: (sort: TVShowSortBy) => void;
  onRemoveFromWatchlist: (tmdbId: number) => void;
  onStartWatching: (show: UserTVShow) => void;
  onSaveWatching: () => void;
  onCloseDialog: () => void;
}

const TVWatchlistPageView: React.FC<TVWatchlistPageViewProps> = ({
  shows,
  sortBy,
  sortedShows,
  ratingDialog,
  onSortChange,
  onRemoveFromWatchlist,
  onStartWatching,
  onSaveWatching,
  onCloseDialog,
}) => {
  const router = useRouter();

  return (
    <WatchlistPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <div className="header-content">
            <Typography variant="h4" component="h1" className="page-title">
              TV Show Watchlist
            </Typography>
            <Typography variant="body1" className="page-subtitle">
              {shows.length} {shows.length === 1 ? 'show' : 'shows'} to watch
            </Typography>
          </div>

          <div className="sort-chips-container">
            <Chip
              label="Date Added"
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
              label="First Air Date"
              onClick={() => onSortChange(TVShowSortBy.FIRST_AIR_DATE_DESC)}
              color={sortBy === TVShowSortBy.FIRST_AIR_DATE_DESC ? 'primary' : 'default'}
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
            icon="mdi:television-classic"
            title="Your TV show watchlist is empty"
            description="Add TV shows to your watchlist to keep track of what you want to watch."
            actionLabel="Browse TV Shows"
            actionIcon="mdi:television-guide"
            onAction={() => router.push('/tv')}
          />
        ) : (
          <WatchlistGrid>
            {sortedShows.map((userShow) => (
              <ContentCard
                key={userShow.tvShow?.tmdbId}
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
                isInWatchlist={true}
                isWatched={false}
                onAddToWatchlist={() => {
                  if (userShow.tvShow?.tmdbId) {
                    onRemoveFromWatchlist(userShow.tvShow.tmdbId);
                  }
                }}
                onMarkAsWatched={() => onStartWatching(userShow)}
              />
            ))}
          </WatchlistGrid>
        )}
      </div>

      <Dialog open={ratingDialog.open} onClose={onCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Start Watching &quot;{ratingDialog.show?.tvShow?.name}&quot;</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            Ready to start watching this show?
          </Typography>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={onCloseDialog} variant="text">
            Cancel
          </AppButton>
          <AppButton onClick={onSaveWatching} variant="contained">
            Start Watching
          </AppButton>
        </DialogActions>
      </Dialog>
    </WatchlistPageContainer>
  );
};

export default TVWatchlistPageView;
