import { Components, Theme } from '@mui/material';

export const muiAppBarOverrides: Components<Theme>['MuiAppBar'] = {
  styleOverrides: {
    root: {
      backgroundImage: 'none',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
    },
    colorPrimary: {
      backgroundColor: 'primary.main',
    },
    colorTransparent: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
  },
};