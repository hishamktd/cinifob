'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Dayjs } from 'dayjs';

import { AppButton, AppEmptyState, AppRating, AppDatePicker } from '@core/components';
import { ContentCard } from '@/components/content-card';
import { MovieSortBy } from '@core/enums';
import { UserMovie } from '@/types';
import { WatchlistPageContainer, WatchlistGrid } from './styled-components';

interface WatchlistPageViewProps {
  movies: UserMovie[];
  sortBy: MovieSortBy;
  sortedMovies: UserMovie[];
  ratingDialog: {
    open: boolean;
    movie: UserMovie | null;
    rating: number | null;
    watchedDate: Dayjs;
  };
  onSortChange: (sort: MovieSortBy) => void;
  onRemoveFromWatchlist: (tmdbId: number) => void;
  onMarkAsWatched: (movie: UserMovie) => void;
  onRatingChange: (rating: number | null) => void;
  onDateChange: (date: Dayjs | null) => void;
  onSaveWatched: () => void;
  onCloseDialog: () => void;
}

const WatchlistPageView: React.FC<WatchlistPageViewProps> = ({
  movies,
  sortBy,
  sortedMovies,
  ratingDialog,
  onSortChange,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onRatingChange,
  onDateChange,
  onSaveWatched,
  onCloseDialog,
}) => {
  const router = useRouter();

  return (
    <WatchlistPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <div className="header-content">
            <Typography variant="h4" component="h1" className="page-title">
              My Watchlist
            </Typography>
            <Typography variant="body1" className="page-subtitle">
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'} to watch
            </Typography>
          </div>

          <div className="sort-chips-container">
            <Chip
              label="Date Added"
              onClick={() => onSortChange(MovieSortBy.DATE_ADDED)}
              color={sortBy === MovieSortBy.DATE_ADDED ? 'primary' : 'default'}
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
              label="Rating"
              onClick={() => onSortChange(MovieSortBy.RATING)}
              color={sortBy === MovieSortBy.RATING ? 'primary' : 'default'}
              size="small"
            />
          </div>
        </div>

        {movies.length === 0 ? (
          <AppEmptyState
            icon="mdi:bookmark-outline"
            title="Your watchlist is empty"
            description="Add movies to your watchlist to keep track of what you want to watch."
            actionLabel="Browse Movies"
            actionIcon="mdi:movie-search"
            onAction={() => router.push('/movies')}
          />
        ) : (
          <WatchlistGrid>
            {sortedMovies.map((userMovie) => (
              <ContentCard
                key={userMovie.movie?.tmdbId}
                item={{
                  id: userMovie.movie?.id || 0,
                  tmdbId: userMovie.movie?.tmdbId || 0,
                  mediaType: 'movie',
                  title: userMovie.movie?.title || 'Unknown Title',
                  overview: userMovie.movie?.overview,
                  posterPath: userMovie.movie?.posterPath,
                  backdropPath: userMovie.movie?.backdropPath,
                  date: userMovie.movie?.releaseDate?.toString(),
                  voteAverage: userMovie.movie?.voteAverage,
                  voteCount: userMovie.movie?.voteCount,
                  popularity: userMovie.movie?.popularity,
                  runtime: userMovie.movie?.runtime,
                  genres: userMovie.movie?.genres,
                }}
                isInWatchlist={true}
                isWatched={false}
                onAddToWatchlist={() => {
                  if (userMovie.movie?.tmdbId) {
                    onRemoveFromWatchlist(userMovie.movie.tmdbId);
                  }
                }}
                onMarkAsWatched={() => onMarkAsWatched(userMovie)}
              />
            ))}
          </WatchlistGrid>
        )}
      </div>

      <Dialog open={ratingDialog.open} onClose={onCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Mark as Watched</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            When did you watch &quot;{ratingDialog.movie?.movie?.title}&quot;?
          </Typography>
          <AppDatePicker
            label="Watch Date"
            value={ratingDialog.watchedDate}
            onChange={onDateChange}
            maxDate={ratingDialog.watchedDate}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
            How would you rate this movie?
          </Typography>
          <AppRating value={ratingDialog.rating} onChange={onRatingChange} size="large" />
        </DialogContent>
        <DialogActions>
          <AppButton onClick={onCloseDialog} variant="text">
            Cancel
          </AppButton>
          <AppButton onClick={onSaveWatched} variant="contained">
            Mark as Watched
          </AppButton>
        </DialogActions>
      </Dialog>
    </WatchlistPageContainer>
  );
};

export default WatchlistPageView;
