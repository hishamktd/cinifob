'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Box,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

import { AppButton, AppEmptyState, AppRating, AppDatePicker, AppIcon } from '@core/components';
import { ContentCard } from '@/components/content-card';
import { MovieSortBy } from '@core/enums';
import { UserMovie, UserTVShow, ContentItem } from '@/types';
import { WatchlistPageContainer, WatchlistGrid } from './styled-components';

interface UnifiedWatchlistPageViewProps {
  movies: UserMovie[];
  tvShows: UserTVShow[];
  sortBy: MovieSortBy | string;
  contentType: 'all' | 'movies' | 'tv';
  sortedContent: ContentItem[];
  ratingDialog: {
    open: boolean;
    item: UserMovie | UserTVShow | null;
    rating: number | null;
    watchedDate: Dayjs;
    mediaType: 'movie' | 'tv';
  };
  onContentTypeChange: (type: 'all' | 'movies' | 'tv') => void;
  onSortChange: (sort: string) => void;
  onRemoveFromWatchlist: (tmdbId: number, mediaType: 'movie' | 'tv') => void;
  onMarkAsWatched: (item: UserMovie | UserTVShow, mediaType: 'movie' | 'tv') => void;
  onRatingChange: (rating: number | null) => void;
  onDateChange: (date: Dayjs | null) => void;
  onSaveWatched: () => void;
  onCloseDialog: () => void;
}

const UnifiedWatchlistPageView: React.FC<UnifiedWatchlistPageViewProps> = ({
  movies,
  tvShows,
  sortBy,
  contentType,
  sortedContent,
  ratingDialog,
  onContentTypeChange,
  onSortChange,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onRatingChange,
  onDateChange,
  onSaveWatched,
  onCloseDialog,
}) => {
  const router = useRouter();
  const totalCount = movies.length + tvShows.length;

  const getContentStats = () => {
    const movieCount = movies.length;
    const tvCount = tvShows.length;

    if (contentType === 'movies') return `${movieCount} ${movieCount === 1 ? 'movie' : 'movies'}`;
    if (contentType === 'tv') return `${tvCount} ${tvCount === 1 ? 'show' : 'shows'}`;
    return `${totalCount} ${totalCount === 1 ? 'item' : 'items'} (${movieCount} ${movieCount === 1 ? 'movie' : 'movies'}, ${tvCount} ${tvCount === 1 ? 'show' : 'shows'})`;
  };

  const getDialogTitle = () => {
    if (ratingDialog.mediaType === 'movie') {
      return `Mark "${(ratingDialog.item as UserMovie)?.movie?.title}" as Watched`;
    } else {
      return `Start Watching "${(ratingDialog.item as UserTVShow)?.tvShow?.name}"`;
    }
  };

  return (
    <WatchlistPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <div className="header-content">
            <Typography variant="h3" component="h1" className="page-title">
              My Watchlist
            </Typography>
            <Typography variant="body1" className="page-subtitle">
              {getContentStats()}
            </Typography>
          </div>

          {/* Content Type Filter */}
          <Box className="content-filter" sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={contentType}
              exclusive
              onChange={(_, value) => value && onContentTypeChange(value)}
              size="small"
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.75,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="all">
                <AppIcon icon="mdi:view-grid" size={16} style={{ marginRight: 6 }} />
                All
              </ToggleButton>
              <ToggleButton value="movies">
                <AppIcon icon="mdi:movie" size={16} style={{ marginRight: 6 }} />
                Movies ({movies.length})
              </ToggleButton>
              <ToggleButton value="tv">
                <AppIcon icon="mdi:television-classic" size={16} style={{ marginRight: 6 }} />
                TV Shows ({tvShows.length})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Sort Options */}
          <Box className="sort-chips-container">
            <Chip
              label="Date Added"
              onClick={() => onSortChange('date_added')}
              color={sortBy === 'date_added' ? 'primary' : 'default'}
              variant={sortBy === 'date_added' ? 'filled' : 'outlined'}
              size="medium"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label="Title"
              onClick={() => onSortChange('title')}
              color={sortBy === 'title' ? 'primary' : 'default'}
              variant={sortBy === 'title' ? 'filled' : 'outlined'}
              size="medium"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label="Release Date"
              onClick={() => onSortChange('release_date')}
              color={sortBy === 'release_date' ? 'primary' : 'default'}
              variant={sortBy === 'release_date' ? 'filled' : 'outlined'}
              size="medium"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label="Rating"
              onClick={() => onSortChange('rating')}
              color={sortBy === 'rating' ? 'primary' : 'default'}
              variant={sortBy === 'rating' ? 'filled' : 'outlined'}
              size="medium"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label="Type"
              onClick={() => onSortChange('type')}
              color={sortBy === 'type' ? 'primary' : 'default'}
              variant={sortBy === 'type' ? 'filled' : 'outlined'}
              size="medium"
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </div>

        {totalCount === 0 ? (
          <AppEmptyState
            icon="mdi:bookmark-outline"
            title="Your watchlist is empty"
            description="Add movies and TV shows to your watchlist to keep track of what you want to watch."
            actionLabel="Browse Content"
            actionIcon="mdi:compass"
            onAction={() => router.push('/browse')}
          />
        ) : sortedContent.length === 0 ? (
          <AppEmptyState
            icon="mdi:filter-off"
            title={`No ${contentType === 'movies' ? 'movies' : contentType === 'tv' ? 'TV shows' : 'content'} in your watchlist`}
            description={`You haven't added any ${contentType === 'movies' ? 'movies' : contentType === 'tv' ? 'TV shows' : 'content'} to your watchlist yet.`}
            actionLabel={`Browse ${contentType === 'movies' ? 'Movies' : contentType === 'tv' ? 'TV Shows' : 'Content'}`}
            actionIcon="mdi:compass"
            onAction={() => router.push(contentType === 'tv' ? '/tv' : '/movies')}
          />
        ) : (
          <WatchlistGrid>
            {sortedContent.map((item) => (
              <ContentCard
                key={`${item.mediaType}-${item.tmdbId}`}
                item={{
                  ...item,
                  overview: item.overview || undefined,
                  date: item.date || undefined,
                }}
                isInWatchlist={true}
                isWatched={false}
                onAddToWatchlist={() => onRemoveFromWatchlist(item.tmdbId, item.mediaType)}
                onMarkAsWatched={() => {
                  const userItem =
                    item.mediaType === 'movie'
                      ? movies.find((m) => m.movie?.tmdbId === item.tmdbId)
                      : tvShows.find((s) => s.tvShow?.tmdbId === item.tmdbId);
                  if (userItem) {
                    onMarkAsWatched(userItem, item.mediaType);
                  }
                }}
              />
            ))}
          </WatchlistGrid>
        )}
      </div>

      <Dialog open={ratingDialog.open} onClose={onCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          {ratingDialog.mediaType === 'movie' ? (
            <>
              <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                When did you watch this movie?
              </Typography>
              <AppDatePicker
                label="Watch Date"
                value={ratingDialog.watchedDate}
                onChange={onDateChange}
                maxDate={dayjs()}
                fullWidth
                sx={{ mb: 3 }}
              />
              <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                How would you rate it?
              </Typography>
              <AppRating
                value={ratingDialog.rating}
                onChange={(_event, value) => onRatingChange(value)}
                size="large"
              />
            </>
          ) : (
            <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
              Ready to start watching this show? You can track your progress episode by episode.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <AppButton onClick={onCloseDialog} variant="text">
            Cancel
          </AppButton>
          <AppButton onClick={onSaveWatched} variant="contained">
            {ratingDialog.mediaType === 'movie' ? 'Mark as Watched' : 'Start Watching'}
          </AppButton>
        </DialogActions>
      </Dialog>
    </WatchlistPageContainer>
  );
};

export default UnifiedWatchlistPageView;
