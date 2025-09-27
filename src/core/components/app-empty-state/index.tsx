'use client';

import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { AppIcon } from '../app-icon';
import { AppButton } from '../app-button';

export interface AppEmptyStateProps {
  icon?: string;
  iconSize?: number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
  variant?: 'default' | 'minimal' | 'illustration';
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
}

export const AppEmptyState = React.memo(
  ({
    icon = 'mdi:inbox-outline',
    iconSize,
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
    variant = 'default',
    size = 'medium',
    fullHeight = false,
  }: AppEmptyStateProps) => {
    const theme = useTheme();

    const sizeConfig = useMemo(
      () => ({
        small: {
          iconSize: iconSize || 48,
          titleVariant: 'h6' as const,
          descriptionVariant: 'body2' as const,
          spacing: 2,
          maxWidth: 300,
        },
        medium: {
          iconSize: iconSize || 64,
          titleVariant: 'h5' as const,
          descriptionVariant: 'body1' as const,
          spacing: 3,
          maxWidth: 400,
        },
        large: {
          iconSize: iconSize || 80,
          titleVariant: 'h4' as const,
          descriptionVariant: 'h6' as const,
          spacing: 4,
          maxWidth: 500,
        },
      }),
      [iconSize],
    );

    const config = useMemo(() => sizeConfig[size], [sizeConfig, size]);

    const renderIcon = () => {
      if (variant === 'minimal') return null;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: config.iconSize * 1.5,
            height: config.iconSize * 1.5,
            borderRadius: '50%',
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
            mb: config.spacing,
          }}
        >
          <AppIcon
            icon={icon}
            size={config.iconSize}
            color={theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400'}
          />
        </Box>
      );
    };

    const renderContent = () => (
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: config.maxWidth,
          mx: 'auto',
        }}
      >
        <Typography
          variant={config.titleVariant}
          component="h3"
          sx={{
            mb: description ? 1 : config.spacing,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant={config.descriptionVariant}
            color="text.secondary"
            sx={{ mb: config.spacing, lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}

        {actionLabel && onAction && (
          <AppButton
            onClick={onAction}
            variant="contained"
            startIcon={actionIcon}
            size={size === 'large' ? 'large' : 'medium'}
          >
            {actionLabel}
          </AppButton>
        )}
      </Box>
    );

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: config.spacing * 2,
          px: 2,
          ...(fullHeight && {
            minHeight: '50vh',
          }),
        }}
      >
        {renderIcon()}
        {renderContent()}
      </Box>
    );
  },
);

AppEmptyState.displayName = 'AppEmptyState';

// Predefined empty states for common scenarios
export const NoMoviesFound = React.memo(
  ({ searchQuery, onClearSearch }: { searchQuery?: string; onClearSearch?: () => void }) => (
    <AppEmptyState
      icon="mdi:movie-search-outline"
      title={searchQuery ? `No movies found for "${searchQuery}"` : 'No movies found'}
      description={
        searchQuery
          ? 'Try adjusting your search terms or browse our popular movies.'
          : 'Discover amazing movies by searching or browsing our collection.'
      }
      actionLabel={searchQuery ? 'Clear Search' : 'Browse Movies'}
      actionIcon={searchQuery ? 'mdi:close' : 'mdi:movie-outline'}
      onAction={onClearSearch}
    />
  ),
);

NoMoviesFound.displayName = 'NoMoviesFound';

export const NoWatchlistMovies = React.memo(({ onBrowse }: { onBrowse?: () => void }) => (
  <AppEmptyState
    icon="mdi:bookmark-outline"
    title="Your watchlist is empty"
    description="Start building your movie collection by adding movies you want to watch."
    actionLabel="Browse Movies"
    actionIcon="mdi:plus"
    onAction={onBrowse}
  />
));

NoWatchlistMovies.displayName = 'NoWatchlistMovies';

export const NoWatchedMovies = React.memo(({ onBrowse }: { onBrowse?: () => void }) => (
  <AppEmptyState
    icon="mdi:check-circle-outline"
    title="No watched movies"
    description="Keep track of movies you've watched and rate them."
    actionLabel="Find Movies"
    actionIcon="mdi:magnify"
    onAction={onBrowse}
  />
));

NoWatchedMovies.displayName = 'NoWatchedMovies';
