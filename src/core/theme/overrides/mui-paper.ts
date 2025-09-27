import { Components, Theme } from '@mui/material';

export const muiPaperOverrides: Components<Theme>['MuiPaper'] = {
  styleOverrides: {
    root: {
      backgroundImage: 'none',
    },
    rounded: {
      borderRadius: 8,
    },
    elevation1: {
      boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
    },
    elevation2: {
      boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
    },
    elevation3: {
      boxShadow: '0px 3px 9px rgba(0,0,0,0.08)',
    },
    elevation4: {
      boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
    },
    elevation8: {
      boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
    },
  },
};
