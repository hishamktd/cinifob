'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dayjs } from 'dayjs';

import { Typography, Chip, CardContent } from '@mui/material';

import { AppIcon, AppEmptyState } from '@core/components';
import { WatchedMovieCard } from '@/components/watched-movie-card';
import { MovieSortBy } from '@core/enums';
import { UserMovie } from '@/types';
import {
  WatchedPageContainer,
  StatsGrid,
  StatCard,
  MoviesSection,
  MoviesGrid,
} from './styled-components';

interface WatchedPageViewProps {
  movies: UserMovie[];
  stats: {
    totalWatched: number;
    totalRuntime: number;
    averageRating: number;
    highestRated: UserMovie | null;
  };
  sortBy: MovieSortBy;
  editingDateId: number | null;
  sortedMovies: UserMovie[];
  onSortChange: (sort: MovieSortBy) => void;
  onEditDateClick: (id: number) => void;
  onCancelEditDate: () => void;
  onUpdateWatchedDate: (movieId: number, newDate: Dayjs | null) => void;
  onAddToWatchlist: (movie: UserMovie['movie']) => void;
  onRemoveFromWatched: (tmdbId: number) => void;
  formatRuntime: (minutes: number) => string;
}

const WatchedPageView: React.FC<WatchedPageViewProps> = ({
  movies,
  stats,
  sortBy,
  editingDateId,
  sortedMovies,
  onSortChange,
  onEditDateClick,
  onCancelEditDate,
  onUpdateWatchedDate,
  onAddToWatchlist,
  onRemoveFromWatched,
  formatRuntime,
}) => {
  const router = useRouter();

  return (
    <WatchedPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <Typography variant="h4" component="h1" className="page-title" gutterBottom>
            Watched Movies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your movie watching journey
          </Typography>
        </div>

        {movies.length > 0 && (
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
                  Movies Watched
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
                  Total Runtime
                </Typography>
              </CardContent>
            </StatCard>

            <StatCard>
              <CardContent className="stat-content">
                <AppIcon icon="mdi:star" size={24} color="primary.main" className="stat-icon" />
                <Typography variant="h4" className="stat-value">
                  {stats.averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Average Rating
                </Typography>
              </CardContent>
            </StatCard>

            {stats.highestRated && (
              <StatCard>
                <CardContent className="stat-content">
                  <AppIcon icon="mdi:trophy" size={24} color="primary.main" className="stat-icon" />
                  <Typography variant="body1" className="stat-subtitle" noWrap>
                    {stats.highestRated.movie?.title || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" className="stat-label">
                    Highest Rated ({stats.highestRated.rating}★)
                  </Typography>
                </CardContent>
              </StatCard>
            )}
          </StatsGrid>
        )}

        <MoviesSection>
          <div className="section-header">
            <Typography variant="h6" className="section-title">
              All Watched Movies
            </Typography>
          </div>

          <div className="sort-chips-container">
            <Chip
              label="Recently Watched"
              onClick={() => onSortChange(MovieSortBy.RECENTLY_WATCHED)}
              color={sortBy === MovieSortBy.RECENTLY_WATCHED ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Title"
              onClick={() => onSortChange(MovieSortBy.TITLE)}
              color={sortBy === MovieSortBy.TITLE ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="Release Date"
              onClick={() => onSortChange(MovieSortBy.RELEASE_DATE)}
              color={sortBy === MovieSortBy.RELEASE_DATE ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label="My Rating"
              onClick={() => onSortChange(MovieSortBy.RATING)}
              color={sortBy === MovieSortBy.RATING ? 'primary' : 'default'}
              size="small"
            />
          </div>
        </MoviesSection>

        {movies.length === 0 ? (
          <AppEmptyState
            icon="mdi:movie-check-outline"
            title="No watched movies yet"
            description="Keep track of movies you've watched and rate them."
            actionLabel="Browse Movies"
            actionIcon="mdi:movie-search"
            onAction={() => router.push('/movies')}
          />
        ) : (
          <MoviesGrid>
            {sortedMovies.map((userMovie) => (
              <WatchedMovieCard
                key={userMovie.movie?.id}
                userMovie={userMovie}
                isEditingDate={editingDateId === userMovie.id}
                onEditDateClick={() => onEditDateClick(userMovie.id)}
                onCancelEditDate={onCancelEditDate}
                onUpdateDate={onUpdateWatchedDate}
                onAddToWatchlist={onAddToWatchlist}
                onRemoveFromWatched={onRemoveFromWatched}
              />
            ))}
          </MoviesGrid>
        )}
      </div>
    </WatchedPageContainer>
  );
};

export default WatchedPageView;
