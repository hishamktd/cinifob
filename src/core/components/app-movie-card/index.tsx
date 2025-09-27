'use client';

import React, { useCallback, useMemo } from 'react';
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
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { AppIcon } from '../app-icon';
import { AppRating } from '../app-rating';
import { TMDB_CONFIG } from '@core/constants';
import { Movie } from '@/types';
import { useMoviePrefetch } from '@/hooks/useMoviePrefetch';
import { useMovieStatus } from '@/hooks/useMovieStatus';

export interface AppMovieCardProps {
  movie: Partial<Movie>;
  onAddToWatchlist?: () => void;
  onMarkAsWatched?: () => void;
  onRatingChange?: (rating: number | null) => void;
  showActions?: boolean;
  showRating?: boolean;
  userRating?: number | null;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact';
  enablePrefetch?: boolean;
}

export const AppMovieCard = React.memo(
  ({
    movie,
    onAddToWatchlist,
    onMarkAsWatched,
    onRatingChange,
    showActions = true,
    showRating = false,
    userRating,
    size = 'medium',
    variant = 'default',
    enablePrefetch = true,
  }: AppMovieCardProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { prefetchMovie, cancelPrefetch } = useMoviePrefetch({ delay: 400 });
    const { isInWatchlist, isWatched } = useMovieStatus();

    const inWatchlist = movie.tmdbId ? isInWatchlist(movie.tmdbId) : false;
    const watched = movie.tmdbId ? isWatched(movie.tmdbId) : false;

    const posterUrl = movie.posterPath
      ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZES[3]}${movie.posterPath}`
      : '/placeholder-movie.jpg';

    const handleCardClick = useCallback(() => {
      if (movie.tmdbId) {
        router.push(`/movies/${movie.tmdbId}`);
      }
    }, [movie.tmdbId, router]);

    const handleMouseEnter = useCallback(() => {
      if (enablePrefetch && movie.tmdbId) {
        prefetchMovie(movie.tmdbId);
      }
    }, [enablePrefetch, movie.tmdbId, prefetchMovie]);

    const handleMouseLeave = useCallback(() => {
      if (enablePrefetch) {
        cancelPrefetch();
      }
    }, [enablePrefetch, cancelPrefetch]);

    const releaseYear = useMemo(() => {
      return movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown';
    }, [movie.releaseDate]);

    // Size configurations
    const sizeConfig = useMemo(
      () => ({
        small: {
          aspectRatio: '120%',
          titleVariant: 'subtitle2' as const,
          yearVariant: 'caption' as const,
          iconSize: 16,
          chipSize: 'small' as const,
        },
        medium: {
          aspectRatio: '150%',
          titleVariant: 'h6' as const,
          yearVariant: 'body2' as const,
          iconSize: 20,
          chipSize: 'small' as const,
        },
        large: {
          aspectRatio: '150%',
          titleVariant: 'h5' as const,
          yearVariant: 'body1' as const,
          iconSize: 24,
          chipSize: 'medium' as const,
        },
      }),
      [],
    );

    const config = useMemo(() => sizeConfig[size], [sizeConfig, size]);

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardActionArea onClick={handleCardClick}>
          <Box sx={{ position: 'relative', paddingTop: config.aspectRatio }}>
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
                size={config.chipSize}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                }}
                icon={
                  <AppIcon
                    icon="mdi:star"
                    size={config.iconSize - 4}
                    style={{ color: '#ffc107' }}
                  />
                }
              />
            )}
            {watched && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: '50%',
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon icon="mdi:check" size={config.iconSize - 4} />
              </Box>
            )}
          </Box>
          <CardContent sx={{ flexGrow: 1, pb: variant === 'compact' ? 1 : 2 }}>
            <Typography variant={config.titleVariant} component="h3" noWrap title={movie.title}>
              {movie.title}
            </Typography>
            <Typography variant={config.yearVariant} color="text.secondary">
              {releaseYear}
            </Typography>
            {showRating && (
              <Box sx={{ mt: 1 }}>
                <AppRating
                  value={userRating}
                  onChange={onRatingChange}
                  size={size === 'large' ? 'medium' : 'small'}
                  readOnly={!onRatingChange}
                />
              </Box>
            )}
          </CardContent>
        </CardActionArea>
        {showActions && (
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Tooltip title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}>
              <IconButton
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onAddToWatchlist?.();
                }}
                color={inWatchlist ? 'primary' : 'default'}
                disabled={watched}
              >
                <AppIcon
                  icon={inWatchlist ? 'mdi:bookmark' : 'mdi:bookmark-outline'}
                  size={config.iconSize}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title={watched ? 'Watched' : 'Mark as Watched'}>
              <IconButton
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onMarkAsWatched?.();
                }}
                color={watched ? 'success' : 'default'}
              >
                <AppIcon
                  icon={watched ? 'mdi:check-circle' : 'mdi:check-circle-outline'}
                  size={config.iconSize}
                />
              </IconButton>
            </Tooltip>
          </CardActions>
        )}
      </Card>
    );
  },
);

AppMovieCard.displayName = 'AppMovieCard';
