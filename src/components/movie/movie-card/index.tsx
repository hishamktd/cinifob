'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Rating,
  Tooltip,
  Typography,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { TMDB_CONFIG } from '@core/constants';
import { Movie } from '@/types';

interface MovieCardProps {
  movie: Partial<Movie>;
  onAddToWatchlist?: () => void;
  onMarkAsWatched?: () => void;
  showActions?: boolean;
  userRating?: number;
}

export const MovieCard = ({
  movie,
  onAddToWatchlist,
  onMarkAsWatched,
  showActions = true,
  userRating,
}: MovieCardProps) => {
  const router = useRouter();

  const posterUrl = movie.posterPath
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZES[3]}${movie.posterPath}`
    : '/placeholder-movie.jpg';

  const handleCardClick = () => {
    if (movie.tmdbId) {
      router.push(`/movies/${movie.tmdbId}`);
    }
  };

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleCardClick}>
        <Box sx={{ position: 'relative', paddingTop: '150%' }}>
          {movie.posterPath ? (
            <Image
              src={posterUrl}
              alt={movie.title || 'Movie poster'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon icon="mdi:movie-outline" size={64} color="grey.500" />
            </Box>
          )}
          {movie.voteAverage && (
            <Chip
              label={movie.voteAverage.toFixed(1)}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
              }}
              icon={<AppIcon icon="mdi:star" size={16} style={{ color: '#ffc107' }} />}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="h6" component="h3" noWrap>
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {releaseYear}
          </Typography>
          {userRating && <Rating value={userRating} size="small" readOnly sx={{ mt: 1 }} />}
        </CardContent>
      </CardActionArea>
      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Tooltip title="Add to Watchlist">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.();
              }}
            >
              <AppIcon icon="mdi:bookmark-outline" size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark as Watched">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsWatched?.();
              }}
            >
              <AppIcon icon="mdi:check-circle-outline" size={20} />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
};
