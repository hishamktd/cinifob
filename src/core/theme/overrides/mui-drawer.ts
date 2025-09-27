import { Components, Theme } from '@mui/material';

export const muiDrawerOverrides: Components<Theme>['MuiDrawer'] = {
  styleOverrides: {
    paper: {
      backgroundImage: 'none',
      borderRadius: 0,
      boxShadow: '2px 0px 8px rgba(0,0,0,0.08)',
    },
    paperAnchorLeft: {
      borderRight: '1px solid',
      borderColor: 'divider',
    },
    paperAnchorRight: {
      borderLeft: '1px solid',
      borderColor: 'divider',
    },
  },
};
