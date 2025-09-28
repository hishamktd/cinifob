'use client';

import React, { useCallback, useMemo } from 'react';
import { Box, Rating, Typography, Tooltip } from '@mui/material';
import { AppIcon } from '../app-icon';
import { AppRatingProps } from './types';

export const AppRating = React.memo(
  ({
    label,
    showValue = false,
    showCount = false,
    count,
    variant = 'default',
    icon = 'mdi:star',
    emptyIcon = 'mdi:star-outline',
    iconSize = 20,
    color = '#ffc107',
    emptyColor = '#e0e0e0',
    value,
    ...props
  }: AppRatingProps) => {
    const getRatingText = useCallback(() => {
      if (!value) return 'Not rated';
      return `${value.toFixed(1)} star${value !== 1 ? 's' : ''}`;
    }, [value]);

    const renderRating = useMemo(
      () => (
        <Rating
          {...props}
          value={value}
          icon={<AppIcon icon={icon} size={iconSize} style={{ color }} />}
          emptyIcon={<AppIcon icon={emptyIcon} size={iconSize} style={{ color: emptyColor }} />}
          sx={{
            '& .MuiRating-iconFilled': {
              color,
            },
            '& .MuiRating-iconEmpty': {
              color: emptyColor,
            },
            ...props.sx,
          }}
        />
      ),
      [props, value, icon, iconSize, color, emptyIcon, emptyColor],
    );

    if (variant === 'compact') {
      return (
        <Tooltip title={getRatingText()}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{renderRating}</Box>
        </Tooltip>
      );
    }

    if (variant === 'detailed') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {label && (
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderRating}
            {showValue && value && (
              <Typography variant="body2" color="text.secondary">
                {value.toFixed(1)}
              </Typography>
            )}
            {showCount && count && (
              <Typography variant="caption" color="text.secondary">
                ({count.toLocaleString()})
              </Typography>
            )}
          </Box>
        </Box>
      );
    }

    // Default variant
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {label && (
          <Typography variant="body2" color="text.secondary">
            {label}:
          </Typography>
        )}
        {renderRating}
        {showValue && value && (
          <Typography variant="body2" color="text.secondary">
            {value.toFixed(1)}
          </Typography>
        )}
        {showCount && count && (
          <Typography variant="caption" color="text.secondary">
            ({count.toLocaleString()})
          </Typography>
        )}
      </Box>
    );
  },
);

AppRating.displayName = 'AppRating';

// Specialized rating components
export const MovieRating = React.memo(
  ({
    rating,
    count,
    ...props
  }: {
    rating?: number;
    count?: number;
  } & Omit<AppRatingProps, 'value' | 'showValue' | 'showCount'>) => (
    <AppRating
      {...props}
      value={rating}
      showValue={!!rating}
      showCount={!!count}
      count={count}
      readOnly
    />
  ),
);

MovieRating.displayName = 'MovieRating';

export const UserRating = React.memo(
  ({
    rating,
    onRatingChange,
    ...props
  }: {
    rating?: number | null;
    onRatingChange?: (rating: number | null) => void;
  } & Omit<AppRatingProps, 'value' | 'onChange'>) => {
    const handleChange = useCallback(
      (_: React.SyntheticEvent, newValue: number | null) => {
        onRatingChange?.(newValue);
      },
      [onRatingChange],
    );

    return <AppRating {...props} value={rating} onChange={handleChange} precision={0.5} />;
  },
);

UserRating.displayName = 'UserRating';

export type { AppRatingProps } from './types';
