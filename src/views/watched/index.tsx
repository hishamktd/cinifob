'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import {
  Typography,
  Chip,
  CardContent,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

import { AppIcon, AppEmptyState } from '@core/components';
import { MovieSortBy } from '@core/enums';
import { UserMovie, UserTVShow, ContentItem } from '@/types';
import { ContentCard } from '@/components/content-card';
import { WatchedPageContainer, StatsGrid, StatCard, MoviesSection } from './styled-components';

interface WatchedPageViewProps {
  movies: UserMovie[];
  tvShows: UserTVShow[];
  stats: {
    totalWatched: number;
    totalRuntime: number;
    averageRating: number;
    highestRated: UserMovie | UserTVShow | null;
  };
  sortBy: MovieSortBy;
  contentType: 'all' | 'movies' | 'tv';
  // editingDateId: number | null; // Unused prop
  sortedContent: ContentItem[];
  onContentTypeChange: (type: 'all' | 'movies' | 'tv') => void;
  onSortChange: (sort: MovieSortBy) => void;
  // onEditDateClick: (id: number) => void; // Unused prop
  // onCancelEditDate: () => void; // Unused prop
  // onUpdateWatchedDate: (movieId: number, newDate: Dayjs | null) => void; // Unused prop
  onAddToWatchlist: (item: ContentItem) => void;
  onRemoveFromWatched: (tmdbId: number, mediaType: 'movie' | 'tv') => void;
  formatRuntime: (minutes: number) => string;
}

const WatchedPageView: React.FC<WatchedPageViewProps> = ({
  movies,
  tvShows,
  stats,
  sortBy,
  contentType,
  // editingDateId, // Unused prop
  sortedContent,
  onContentTypeChange,
  onSortChange,
  // onEditDateClick, // Unused prop
  // onCancelEditDate, // Unused prop
  // onUpdateWatchedDate, // Unused prop
  onAddToWatchlist,
  onRemoveFromWatched,
  formatRuntime,
}) => {
  const router = useRouter();

  const getHighestRatedTitle = () => {
    if (!stats.highestRated) return 'N/A';
    if ('movie' in stats.highestRated && stats.highestRated.movie) {
      return stats.highestRated.movie.title;
    } else if ('tvShow' in stats.highestRated && stats.highestRated.tvShow) {
      return stats.highestRated.tvShow.name;
    }
    return 'N/A';
  };

  return (
    <WatchedPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <Typography variant="h4" component="h1" className="page-title" gutterBottom>
            Watched Content
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your movie and TV show watching journey
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            value={contentType}
            exclusive
            onChange={(_, value) => value && onContentTypeChange(value)}
            size="small"
          >
            <ToggleButton value="all">
              <AppIcon icon="mdi:all-inclusive" size={20} sx={{ mr: 0.5 }} />
              All ({movies.length + tvShows.length})
            </ToggleButton>
            <ToggleButton value="movies">
              <AppIcon icon="mdi:movie" size={20} sx={{ mr: 0.5 }} />
              Movies ({movies.length})
            </ToggleButton>
            <ToggleButton value="tv">
              <AppIcon icon="mdi:television-classic" size={20} sx={{ mr: 0.5 }} />
              TV Shows ({tvShows.length})
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as MovieSortBy)}
              label="Sort By"
            >
              <MenuItem value={MovieSortBy.RECENTLY_WATCHED}>Recently Watched</MenuItem>
              <MenuItem value={MovieSortBy.DATE_ADDED}>Date Added</MenuItem>
              <MenuItem value={MovieSortBy.TITLE}>Title</MenuItem>
              <MenuItem value={MovieSortBy.RELEASE_DATE}>Release Date</MenuItem>
              <MenuItem value={MovieSortBy.RATING}>Your Rating</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {(movies.length > 0 || tvShows.length > 0) && (
          <StatsGrid>
            <StatCard>
              <CardContent className="stat-content">
                <AppIcon
                  icon="mdi:movie-check"
                  size={24}
                  color="primary.main"
                  className="stat-icon"
                />
                <Typography variant="h4" className="stat-value">
                  {stats.totalWatched}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Total Watched
                </Typography>
              </CardContent>
            </StatCard>

            <StatCard>
              <CardContent className="stat-content">
                <AppIcon
                  icon="mdi:clock-outline"
                  size={24}
                  color="primary.main"
                  className="stat-icon"
                />
                <Typography variant="h4" className="stat-value">
                  {formatRuntime(stats.totalRuntime)}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Total Runtime (Movies)
                </Typography>
              </CardContent>
            </StatCard>

            <StatCard>
              <CardContent className="stat-content">
                <AppIcon icon="mdi:star" size={24} color="primary.main" className="stat-icon" />
                <Typography variant="h4" className="stat-value">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Average Rating
                </Typography>
              </CardContent>
            </StatCard>

            <StatCard>
              <CardContent className="stat-content">
                <AppIcon icon="mdi:trophy" size={24} color="primary.main" className="stat-icon" />
                <Typography
                  variant="body1"
                  className="stat-value"
                  sx={{
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getHighestRatedTitle()}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Highest Rated
                </Typography>
                {stats.highestRated && (
                  <Chip
                    label={`${stats.highestRated.rating}/10`}
                    size="small"
                    color="primary"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </CardContent>
            </StatCard>
          </StatsGrid>
        )}

        <MoviesSection>
          {sortedContent.length > 0 ? (
            <Grid container spacing={2}>
              {sortedContent.map((item) => (
                <Grid item key={`${item.mediaType}-${item.tmdbId}`} xs={12} sm={6} md={4} lg={3}>
                  <ContentCard
                    item={item}
                    onRemove={() => onRemoveFromWatched(item.tmdbId, item.mediaType)}
                    onAddToWatchlist={() => onAddToWatchlist(item)}
                    onNavigate={() =>
                      router.push(`/${item.mediaType === 'movie' ? 'movies' : 'tv'}/${item.tmdbId}`)
                    }
                    showActions
                    showRating={item._rating}
                    showWatchedDate={item._completedAt}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <AppEmptyState
              icon="mdi:movie-off"
              title="No watched content"
              description={
                contentType === 'movies'
                  ? "You haven't watched any movies yet"
                  : contentType === 'tv'
                    ? "You haven't completed any TV shows yet"
                    : "You haven't watched any content yet"
              }
              action={{
                label: 'Browse Content',
                onClick: () => router.push('/browse'),
              }}
            />
          )}
        </MoviesSection>
      </div>
    </WatchedPageContainer>
  );
};

export default WatchedPageView;
