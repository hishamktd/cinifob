'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs, { Dayjs } from 'dayjs';

import { Box, CardContent, Typography, Chip, IconButton } from '@mui/material';

import { AppIcon, AppButton, AppDatePicker } from '@core/components';
import { TMDB_CONFIG } from '@core/constants';
import { UserMovie } from '@/types';
import {
  WatchedMovieCardWrapper,
  StyledMovieCard,
  PosterWrapper,
  PosterPlaceholder,
  RatingBadge,
  WatchedIndicator,
  MovieTitle,
  WatchedDateSection,
  DateDisplay,
  EditDateButton,
  UserRatingSection,
  ActionButtonsWrapper,
} from './styled-components';

interface WatchedMovieCardProps {
  userMovie: UserMovie;
  isEditingDate: boolean;
  onEditDateClick: () => void;
  onCancelEditDate: () => void;
  onUpdateDate: (movieId: number, newDate: Dayjs | null) => void;
  onAddToWatchlist: (movie: UserMovie['movie']) => void;
  onRemoveFromWatched: (tmdbId: number) => void;
}

export const WatchedMovieCard: React.FC<WatchedMovieCardProps> = ({
  userMovie,
  isEditingDate,
  onEditDateClick,
  onCancelEditDate,
  onUpdateDate,
  onAddToWatchlist,
  onRemoveFromWatched,
}) => {
  const router = useRouter();
  const movie = userMovie.movie;

  if (!movie) return null;

  const handleCardClick = () => {
    router.push(`/movies/${movie.tmdbId}`);
  };

  const getYear = (date?: Date | string | null) => {
    if (!date) return 'TBA';
    return new Date(date).getFullYear().toString();
  };

  return (
    <WatchedMovieCardWrapper>
      <StyledMovieCard onClick={handleCardClick}>
        <PosterWrapper>
          {movie.posterPath ? (
            <Image
              src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w342${movie.posterPath}`}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <PosterPlaceholder>
              <AppIcon icon="mdi:movie-open-outline" size={48} color="text.disabled" />
            </PosterPlaceholder>
          )}

          {/* Movie Badge */}
          <Chip
            label="MOVIE"
            size="small"
            icon={<AppIcon icon="mdi:movie" size={14} />}
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              bgcolor: 'success.main',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />

          {/* Rating Badge */}
          {movie.voteAverage !== undefined && movie.voteAverage > 0 && (
            <RatingBadge>
              <AppIcon icon="mdi:star" size={14} color="#FFD700" />
              <Typography
                variant="caption"
                sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
              >
                {movie.voteAverage.toFixed(1)}
              </Typography>
            </RatingBadge>
          )}

          {/* Watched Indicator */}
          <WatchedIndicator>
            <AppIcon icon="mdi:check-circle" size={16} color="white" />
            <Typography
              variant="caption"
              sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
            >
              WATCHED
            </Typography>
          </WatchedIndicator>
        </PosterWrapper>

        {/* Content */}
        <CardContent sx={{ p: 1.5, pb: 1 }}>
          <MovieTitle variant="body2">{movie.title}</MovieTitle>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {getYear(movie.releaseDate)}
          </Typography>
        </CardContent>
      </StyledMovieCard>

      {/* Watched Date Section */}
      <WatchedDateSection>
        {isEditingDate ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AppDatePicker
              label="Date"
              value={dayjs(userMovie.watchedAt)}
              onChange={(newDate: dayjs.Dayjs | null) =>
                newDate && onUpdateDate(userMovie.id, newDate)
              }
              maxDate={dayjs()}
              size="small"
              fullWidth
              slotProps={{
                textField: {
                  sx: { '& .MuiInputBase-input': { fontSize: '0.75rem' } },
                },
              }}
            />
            <IconButton size="small" onClick={onCancelEditDate} sx={{ p: 0.5 }}>
              <AppIcon icon="mdi:close" size={16} />
            </IconButton>
          </Box>
        ) : (
          <DateDisplay>
            <div className="date-info">
              <AppIcon icon="mdi:calendar" size={14} color="text.secondary" />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                {dayjs(userMovie.watchedAt).format('MMM D, YYYY')}
              </Typography>
            </div>
            <EditDateButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditDateClick();
              }}
            >
              <AppIcon icon="mdi:pencil" size={12} />
            </EditDateButton>
          </DateDisplay>
        )}
      </WatchedDateSection>

      {/* User Rating */}
      {userMovie.rating && (
        <UserRatingSection>
          <AppIcon icon="mdi:star" size={14} color="warning.main" />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Your Rating: {userMovie.rating}/10
          </Typography>
        </UserRatingSection>
      )}

      {/* Action Buttons */}
      <ActionButtonsWrapper>
        <AppButton
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onAddToWatchlist(movie);
          }}
          fullWidth
          sx={{
            fontSize: '0.7rem',
            py: 0.5,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
          }}
        >
          Watch Again
        </AppButton>
        <AppButton
          size="small"
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFromWatched(movie.tmdbId);
          }}
          sx={{
            fontSize: '0.7rem',
            py: 0.5,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Remove
        </AppButton>
      </ActionButtonsWrapper>
    </WatchedMovieCardWrapper>
  );
};
