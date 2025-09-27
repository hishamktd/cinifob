'use client';

import React, { useMemo } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';

export interface AppLoaderProps {
  type?: 'circular' | 'linear' | 'skeleton' | 'dots';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  skeletonVariant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  skeletonLines?: number;
  skeletonHeight?: number | string;
  skeletonWidth?: number | string;
}

export const AppLoader = React.memo(
  ({
    type = 'circular',
    size = 'medium',
    message,
    fullscreen = false,
    overlay = false,
    color = 'primary',
    skeletonVariant = 'rectangular',
    skeletonLines = 3,
    skeletonHeight = 40,
    skeletonWidth = '100%',
  }: AppLoaderProps) => {
    const theme = useTheme();

    const sizeMap = useMemo(
      () => ({
        small: 24,
        medium: 40,
        large: 60,
      }),
      [],
    );

    const renderLoader = () => {
      switch (type) {
        case 'circular':
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={sizeMap[size]} color={color} />
              {message && (
                <Typography variant="body2" color="text.secondary">
                  {message}
                </Typography>
              )}
            </Box>
          );

        case 'linear':
          return (
            <Box sx={{ width: '100%' }}>
              {message && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {message}
                </Typography>
              )}
              <LinearProgress color={color} />
            </Box>
          );

        case 'skeleton':
          return (
            <Box sx={{ width: '100%' }}>
              {Array.from({ length: skeletonLines }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant={skeletonVariant}
                  height={skeletonHeight}
                  width={index === skeletonLines - 1 ? '80%' : skeletonWidth}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          );

        case 'dots':
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    sx={{
                      width: size === 'small' ? 6 : size === 'medium' ? 8 : 10,
                      height: size === 'small' ? 6 : size === 'medium' ? 8 : 10,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      animation: 'pulse 1.4s ease-in-out infinite',
                      animationDelay: `${index * 0.2}s`,
                      '@keyframes pulse': {
                        '0%, 80%, 100%': {
                          opacity: 0.3,
                          transform: 'scale(0.8)',
                        },
                        '40%': {
                          opacity: 1,
                          transform: 'scale(1)',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
              {message && (
                <Typography variant="body2" color="text.secondary">
                  {message}
                </Typography>
              )}
            </Box>
          );

        default:
          return null;
      }
    };

    const containerSx = useMemo(
      () => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(fullscreen && {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.modal,
        }),
        ...(overlay && {
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(2px)',
        }),
        ...(fullscreen &&
          theme.palette.mode === 'dark' &&
          overlay && {
            bgcolor: 'rgba(0, 0, 0, 0.8)',
          }),
      }),
      [fullscreen, overlay, theme.zIndex.modal, theme.palette.mode],
    );

    if (fullscreen) {
      return <Box sx={containerSx}>{renderLoader()}</Box>;
    }

    return <Box sx={{ py: type === 'linear' ? 1 : 4, ...containerSx }}>{renderLoader()}</Box>;
  },
);

AppLoader.displayName = 'AppLoader';

// Skeleton component variations for common use cases
export const MovieCardSkeleton = React.memo(({ count = 1 }: { count?: number }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1, mb: 1 }} />
        <Skeleton variant="text" height={28} width="80%" />
        <Skeleton variant="text" height={20} width="40%" />
      </Box>
    ))}
  </Box>
));

MovieCardSkeleton.displayName = 'MovieCardSkeleton';

export const ListItemSkeleton = React.memo(({ count = 3 }: { count?: number }) => (
  <Box sx={{ width: '100%' }}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" height={24} width="60%" />
          <Skeleton variant="text" height={20} width="40%" />
        </Box>
      </Box>
    ))}
  </Box>
));

ListItemSkeleton.displayName = 'ListItemSkeleton';
