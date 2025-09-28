'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Box, Card, CardContent, IconButton, Skeleton, Typography, Chip } from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { TMDB_CONFIG } from '@core/constants';
import { useContentPrefetch } from '@/hooks/useContentPrefetch';

interface ContentCardProps {
  item: {
    id: number;
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    overview?: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    date?: string;
    voteAverage?: number;
    voteCount?: number;
    popularity?: number;
    genreIds?: number[];
  };
  onAddToWatchlist?: () => void;
  onMarkAsWatched?: () => void;
  isInWatchlist?: boolean;
  isWatched?: boolean;
}

export const ContentCard = ({
  item,
  onAddToWatchlist,
  onMarkAsWatched,
  isInWatchlist = false,
  isWatched = false,
}: ContentCardProps) => {
  const router = useRouter();
  const { handleHover, handleHoverEnd } = useContentPrefetch();

  const handleCardClick = () => {
    const path = item.mediaType === 'tv' ? `/tv/${item.tmdbId}` : `/movies/${item.tmdbId}`;
    router.push(path);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.();
  };

  const handleWatchedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsWatched?.();
  };

  const formatDate = (date?: string) => {
    if (!date) return 'TBA';
    return new Date(date).getFullYear().toString();
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          border: `2px solid ${item.mediaType === 'tv' ? '#f44336' : '#4caf50'}`,
          borderTop: `2px solid ${item.mediaType === 'tv' ? '#f44336' : '#4caf50'}`,
          borderRight: `2px solid ${item.mediaType === 'tv' ? '#f44336' : '#4caf50'}`,
          borderBottom: `2px solid ${item.mediaType === 'tv' ? '#f44336' : '#4caf50'}`,
          borderLeft: `2px solid ${item.mediaType === 'tv' ? '#f44336' : '#4caf50'}`,
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          pointerEvents: 'none',
          zIndex: 10,
        },
        '&:hover': {
          '&::before': {
            animation: 'borderReveal 1.5s linear forwards',
          },
          '& .action-buttons': {
            opacity: 1,
          },
        },
        '@keyframes borderReveal': {
          '0%': {
            clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
          },
          '25%': {
            clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
          },
          '50%': {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 0)',
          },
          '75%': {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)',
          },
          '100%': {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          },
        },
      }}
      onClick={handleCardClick}
      onMouseEnter={() => handleHover(item.tmdbId, item.mediaType)}
      onMouseLeave={handleHoverEnd}
    >
      <Box sx={{ position: 'relative', paddingTop: '150%', overflow: 'hidden' }}>
        {item.posterPath ? (
          <Image
            src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w500${item.posterPath}`}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={false}
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
            <AppIcon
              icon={item.mediaType === 'tv' ? 'mdi:television-classic' : 'mdi:movie-open-outline'}
              size={64}
              color="text.disabled"
            />
          </Box>
        )}

        {/* Media Type Badge */}
        <Chip
          label={item.mediaType === 'tv' ? 'TV SHOW' : 'MOVIE'}
          size="small"
          icon={
            <AppIcon icon={item.mediaType === 'tv' ? 'mdi:television' : 'mdi:movie'} size={16} />
          }
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: item.mediaType === 'tv' ? 'error.main' : 'success.main',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.75rem',
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />

        {/* Rating Badge */}
        {item.voteAverage !== undefined && item.voteAverage > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <AppIcon icon="mdi:star" size={16} color="#FFD700" />
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              {item.voteAverage.toFixed(1)}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box
          className="action-buttons"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            p: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
        >
          {onMarkAsWatched && (
            <IconButton
              size="small"
              onClick={handleWatchedClick}
              sx={{
                bgcolor: isWatched ? 'success.main' : 'background.paper',
                color: isWatched ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isWatched ? 'success.dark' : 'action.hover',
                },
              }}
            >
              <AppIcon
                icon={isWatched ? 'mdi:check-circle' : 'mdi:check-circle-outline'}
                size={20}
              />
            </IconButton>
          )}
          {onAddToWatchlist && (
            <IconButton
              size="small"
              onClick={handleWatchlistClick}
              sx={{
                bgcolor: isInWatchlist ? 'secondary.main' : 'background.paper',
                color: isInWatchlist ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isInWatchlist ? 'secondary.dark' : 'action.hover',
                },
              }}
            >
              <AppIcon icon={isInWatchlist ? 'mdi:bookmark' : 'mdi:bookmark-outline'} size={20} />
            </IconButton>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <AppIcon
            icon={item.mediaType === 'tv' ? 'mdi:television-classic' : 'mdi:movie-open'}
            size={18}
            color={item.mediaType === 'tv' ? 'error.main' : 'success.main'}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: item.mediaType === 'tv' ? 'error.main' : 'success.main',
              textTransform: 'uppercase',
            }}
          >
            {item.mediaType === 'tv' ? 'TV Series' : 'Movie'}
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {formatDate(item.date)}
        </Typography>
        {item.overview && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.overview}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const ContentCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" sx={{ paddingTop: '150%' }} />
    <CardContent>
      <Skeleton variant="text" sx={{ fontSize: '1.2rem', mb: 0.5 }} />
      <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
    </CardContent>
  </Card>
);
