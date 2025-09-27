'use client';

import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { AppIcon } from '../app-icon';

export interface AppButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon'> {
  loading?: boolean;
  startIcon?: string;
  endIcon?: string;
  iconSize?: number;
  variant?: 'text' | 'outlined' | 'contained';
}

export const AppButton = React.memo(
  React.forwardRef<HTMLButtonElement, AppButtonProps>(
    (
      {
        children,
        loading = false,
        startIcon,
        endIcon,
        iconSize = 20,
        disabled,
        variant = 'contained',
        ...props
      },
      ref,
    ) => {
      return (
        <Button
          {...props}
          ref={ref}
          variant={variant}
          disabled={disabled || loading}
          startIcon={
            loading ? (
              <CircularProgress size={iconSize} />
            ) : startIcon ? (
              <AppIcon icon={startIcon} size={iconSize} />
            ) : undefined
          }
          endIcon={endIcon && !loading ? <AppIcon icon={endIcon} size={iconSize} /> : undefined}
        >
          {children}
        </Button>
      );
    },
  ),
);

AppButton.displayName = 'AppButton';
