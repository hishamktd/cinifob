import { createTheme, PaletteMode, ThemeOptions } from '@mui/material';

import {
  muiAppBarOverrides,
  muiButtonOverrides,
  muiCardOverrides,
  muiDrawerOverrides,
  muiPaperOverrides,
  muiTextFieldOverrides,
} from './overrides';
import { darkPalette } from './palettes/dark.palette';
import { lightPalette } from './palettes/light.palette';
import { typography } from './typography/typography';

export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: mode === 'light' ? lightPalette : darkPalette,
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: muiButtonOverrides,
    MuiCard: muiCardOverrides,
    MuiTextField: muiTextFieldOverrides,
    MuiPaper: muiPaperOverrides,
    MuiAppBar: muiAppBarOverrides,
    MuiDrawer: muiDrawerOverrides,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'light' ? '#bbb #f5f5f5' : '#6b6b6b #1e1e1e',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#bbb' : '#6b6b6b',
            border: '2px solid',
            borderColor: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => {
  return createTheme(getThemeOptions(mode));
};

export const themes = {
  light: createAppTheme('light'),
  dark: createAppTheme('dark'),
};
