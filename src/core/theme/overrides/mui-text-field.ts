import { Components, Theme } from '@mui/material';

export const muiTextFieldOverrides: Components<Theme>['MuiTextField'] = {
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
          borderWidth: 1,
        },
        '&:hover fieldset': {
          borderWidth: 1.5,
        },
        '&.Mui-focused fieldset': {
          borderWidth: 2,
        },
      },
      '& .MuiInputLabel-root': {
        fontSize: '0.875rem',
        '&.Mui-focused': {
          fontWeight: 500,
        },
      },
    },
  },
};