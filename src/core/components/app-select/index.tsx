'use client';

import React from 'react';
import ReactSelect from 'react-select';

import { FormControl, FormHelperText, FormLabel, useTheme } from '@mui/material';

import { getSelectStyles, getSelectTheme } from './styles/select.styles';
import { AppSelectProps } from './types';

export const AppSelect = ({
  label,
  error,
  helperText,
  required,
  fullWidth = true,
  ...props
}: AppSelectProps) => {
  const theme = useTheme();
  const customStyles = getSelectStyles(theme, error);
  const customTheme = getSelectTheme(theme);

  return (
    <FormControl fullWidth={fullWidth} error={error}>
      {label && (
        <FormLabel
          sx={{
            mb: 1,
            color: error ? 'error.main' : 'text.primary',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {label}
          {required && <span style={{ color: theme.palette.error.main }}> *</span>}
        </FormLabel>
      )}
      <ReactSelect styles={customStyles} theme={customTheme} {...props} />
      {helperText && (
        <FormHelperText sx={{ color: error ? 'error.main' : 'text.secondary' }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export type { AppSelectProps, SelectOption } from './types';
