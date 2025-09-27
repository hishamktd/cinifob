import { Components, Theme } from '@mui/material';

export const muiButtonOverrides: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: {
      borderRadius: 8,
      padding: '8px 16px',
      fontWeight: 500,
      textTransform: 'none',
      transition: 'all 0.2s ease-in-out',
    },
    contained: {
      boxShadow: 'none',
      '&:hover': {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
    },
    outlined: {
      borderWidth: 1.5,
      '&:hover': {
        borderWidth: 1.5,
      },
    },
    text: {
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
    sizeSmall: {
      padding: '6px 12px',
      fontSize: '0.8125rem',
    },
    sizeMedium: {
      padding: '8px 16px',
    },
    sizeLarge: {
      padding: '10px 20px',
      fontSize: '0.9375rem',
    },
  },
};