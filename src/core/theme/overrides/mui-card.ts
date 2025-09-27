import { Components, Theme } from '@mui/material';

export const muiCardOverrides: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: {
      borderRadius: 12,
      boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
      backgroundImage: 'none',
      transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0px 6px 24px rgba(0,0,0,0.12)',
      },
    },
  },
};
