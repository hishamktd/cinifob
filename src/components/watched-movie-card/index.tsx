'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs, { Dayjs } from 'dayjs';

import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AppIcon, AppButton } from '@core/components';
import { TMDB_CONFIG } from '@core/constants';
import { UserMovie } from '@/types';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 2,
          borderColor: 'success.main',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[8],
            borderColor: 'success.dark',
          },
          position: 'relative',
        }}
        onClick={handleCardClick}
      >
        {/* Poster with 2:3 aspect ratio */}
        <Box sx={{ position: 'relative', paddingTop: '150%', overflow: 'hidden' }}>
          {movie.posterPath ? (
            <Image
              src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w342${movie.posterPath}`}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'action.disabledBackground',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon icon="mdi:movie-open-outline" size={48} color="text.disabled" />
            </Box>
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
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: 0.5,
                px: 0.75,
                py: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
              }}
            >
              <AppIcon icon="mdi:star" size={14} color="#FFD700" />
              <Typography
                variant="caption"
                sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
              >
                {movie.voteAverage.toFixed(1)}
              </Typography>
            </Box>
          )}

          {/* Watched Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(76, 175, 80, 0.95)',
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <AppIcon icon="mdi:check-circle" size={16} color="white" />
            <Typography
              variant="caption"
              sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
            >
              WATCHED
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 1.5, pb: 1 }}>
          <Typography
            variant="body2"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
            }}
          >
            {movie.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {getYear(movie.releaseDate)}
          </Typography>
        </CardContent>
      </Card>

      {/* Watched Date Section */}
      <Box
        sx={{
          mt: 0.75,
          p: 0.75,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
          borderRadius: 0.5,
        }}
      >
        {isEditingDate ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DatePicker
                label="Date"
                value={dayjs(userMovie.watchedAt)}
                onChange={(newDate) => onUpdateDate(userMovie.id, newDate)}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { '& .MuiInputBase-input': { fontSize: '0.75rem' } },
                  },
                }}
              />
              <IconButton size="small" onClick={onCancelEditDate} sx={{ p: 0.5 }}>
                <AppIcon icon="mdi:close" size={16} />
              </IconButton>
            </Box>
          </LocalizationProvider>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AppIcon icon="mdi:calendar" size={14} color="text.secondary" />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                {dayjs(userMovie.watchedAt).format('MMM D, YYYY')}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditDateClick();
              }}
              sx={{
                p: 0.25,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <AppIcon icon="mdi:pencil" size={12} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* User Rating */}
      {userMovie.rating && (
        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75 }}>
          <AppIcon icon="mdi:star" size={14} color="warning.main" />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Your Rating: {userMovie.rating}/10
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 0.75, display: 'flex', gap: 0.5 }}>
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
      </Box>
    </Box>
  );
};
